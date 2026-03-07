"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAndParseFeed, discoverFeedUrl, type FeedItem } from "@/lib/feed/fetch-feed";
import { fetchOgpBatch } from "@/lib/feed/fetch-ogp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FeedItemPayload = {
  feedSourceId: string;
  title: string;
  url: string;
  content: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  ogImage: string | null;
  ogDescription: string | null;
};

export type FeedActionState = {
  error?: string;
  items?: FeedItemPayload[];
};

/**
 * パース済みアイテムを直近だけに絞る。
 * - publishedAt が48h以内 or 日付なし → 通過
 * - それでも多ければ先頭50件で打ち切り（日付なしフィードの安全弁）
 */
const ITEM_CUTOFF_MS = 48 * 60 * 60 * 1000;
const ITEM_MAX_COUNT = 50;

function filterRecentItems(items: FeedItem[]): FeedItem[] {
  const now = Date.now();
  const recent = items.filter((item) => {
    if (!item.publishedAt) return true;
    const age = now - new Date(item.publishedAt).getTime();
    return !isNaN(age) && age < ITEM_CUTOFF_MS;
  });
  return recent.slice(0, ITEM_MAX_COUNT);
}

/** 水門: キーワードに一致する記事だけ通す（OR マッチ、大文字小文字区別なし） */
function filterByKeywords(items: FeedItem[], keywords: string[]): FeedItem[] {
  if (keywords.length === 0) return items;
  const lower = keywords.map((k) => k.toLowerCase());
  return items.filter((item) => {
    const haystack = (item.title + " " + (item.content ?? "")).toLowerCase();
    return lower.some((kw) => haystack.includes(kw));
  });
}

export async function addFeedSource(
  prevState: FeedActionState,
  formData: FormData,
): Promise<FeedActionState> {
  const channelId = formData.get("channel_id") as string;
  const url = (formData.get("url") as string)?.trim();

  if (!channelId || !url) {
    return { error: "URL を入力してください" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RSS フェッチ + パース（初回なので条件付きヘッダーなし）
  // パース失敗時はサイト URL として auto-discovery を試行
  let feedUrl = url;
  let result = await fetchAndParseFeed(url);
  if (!result.success) {
    const discovered = await discoverFeedUrl(url);
    if (!discovered) {
      return { error: result.error };
    }
    feedUrl = discovered;
    result = await fetchAndParseFeed(feedUrl);
    if (!result.success) {
      return { error: result.error };
    }
  }
  if ("notModified" in result) {
    return { error: "フィードを取得できませんでした" };
  }

  // feed_sources に INSERT（発見した feedUrl を保存）
  const { data: source, error: sourceError } = await supabase
    .from("feed_sources")
    .insert({ channel_id: channelId, name: result.feed.title, url: feedUrl })
    .select("id")
    .single();

  if (sourceError) {
    // unique 制約違反（同じ URL が既に登録済み）
    if (sourceError.code === "23505") {
      return { error: "この URL は既に登録されています" };
    }
    return { error: "ソースの登録に失敗しました" };
  }

  // チャンネルのキーワードフィルタ（水門）を取得
  const { data: ch } = await supabase
    .from("channels")
    .select("keyword_filters")
    .eq("id", channelId)
    .single();
  const keywords = ch?.keyword_filters ?? [];

  // フィードアイテムをクライアントに返す（OGP 並列フェッチ付き）
  const recentItems = filterRecentItems(result.feed.items);
  const gatedItems = filterByKeywords(recentItems, keywords);
  let items: FeedItemPayload[] = [];
  if (gatedItems.length > 0) {
    const ogpMap = await fetchOgpBatch(
      gatedItems.map((item) => item.url),
    );

    items = gatedItems.map((item) => ({
      feedSourceId: source.id,
      title: item.title,
      url: item.url,
      content: item.content ?? null,
      thumbnailUrl: item.thumbnailUrl ?? null,
      publishedAt: item.publishedAt ?? null,
      ogImage: ogpMap.get(item.url)?.image ?? null,
      ogDescription: ogpMap.get(item.url)?.description ?? null,
    }));
  }

  // last_fetched_at + 条件付きヘッダーを保存
  await supabase
    .from("feed_sources")
    .update({
      last_fetched_at: new Date().toISOString(),
      etag: result.headers.etag ?? null,
      last_modified_header: result.headers.lastModified ?? null,
    })
    .eq("id", source.id);

  revalidatePath(`/channels/${channelId}`);
  return { items };
}

export async function deleteFeedSource(formData: FormData) {
  const id = formData.get("id") as string;
  const channelId = formData.get("channel_id") as string;
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("feed_sources").delete().eq("id", id);

  revalidatePath(`/channels/${channelId}`);
}

export type RefreshResult = {
  items: FeedItemPayload[];
  errors: Record<string, string>; // { [feedSourceId]: errorMessage }
  succeededSourceIds: string[];
};

/** チャンネルの全ソースをフェッチして items とエラーを返す */
export async function refreshChannelById(
  channelId: string,
): Promise<RefreshResult> {
  const empty: RefreshResult = { items: [], errors: {}, succeededSourceIds: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  // チャンネルのキーワードフィルタ + 全ソースを並列取得
  const [{ data: channelData }, { data: sources }] = await Promise.all([
    supabase
      .from("channels")
      .select("keyword_filters")
      .eq("id", channelId)
      .single(),
    supabase
      .from("feed_sources")
      .select("id, url, etag, last_modified_header")
      .eq("channel_id", channelId),
  ]);
  const keywords = channelData?.keyword_filters ?? [];

  if (!sources || sources.length === 0) return empty;

  const allItems: FeedItemPayload[] = [];
  const errors: Record<string, string> = {};
  const succeededSourceIds: string[] = [];

  // 全ソースを並列フェッチ
  await Promise.allSettled(
    sources.map(async (source) => {
      const result = await fetchAndParseFeed(source.url, {
        etag: source.etag,
        lastModified: source.last_modified_header,
      });
      if (!result.success) {
        errors[source.id] = result.error;
        return;
      }

      succeededSourceIds.push(source.id);

      // 304 Not Modified: フェッチ日時だけ更新
      if ("notModified" in result) {
        await supabase
          .from("feed_sources")
          .update({ last_fetched_at: new Date().toISOString() })
          .eq("id", source.id);
        return;
      }

      const recentItems = filterRecentItems(result.feed.items);
      const gatedItems = filterByKeywords(recentItems, keywords);
      if (gatedItems.length > 0) {
        const ogpMap = await fetchOgpBatch(
          gatedItems.map((item) => item.url),
        );

        const items = gatedItems.map((item) => ({
          feedSourceId: source.id,
          title: item.title,
          url: item.url,
          content: item.content ?? null,
          thumbnailUrl: item.thumbnailUrl ?? null,
          publishedAt: item.publishedAt ?? null,
          ogImage: ogpMap.get(item.url)?.image ?? null,
          ogDescription: ogpMap.get(item.url)?.description ?? null,
        }));

        allItems.push(...items);
      }

      await supabase
        .from("feed_sources")
        .update({
          last_fetched_at: new Date().toISOString(),
          etag: result.headers.etag ?? null,
          last_modified_header: result.headers.lastModified ?? null,
        })
        .eq("id", source.id);
    }),
  );

  return { items: allItems, errors, succeededSourceIds };
}

/** 水門: チャンネルのキーワードフィルタを更新 */
export async function updateKeywordFilters(formData: FormData) {
  const channelId = formData.get("channel_id") as string;
  const keywordsRaw = formData.get("keyword_filters") as string;
  if (!channelId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const keywords: string[] = keywordsRaw
    ? (JSON.parse(keywordsRaw) as string[]).filter(Boolean)
    : [];

  await supabase
    .from("channels")
    .update({ keyword_filters: keywords })
    .eq("id", channelId);

  revalidatePath(`/channels/${channelId}`);
}
