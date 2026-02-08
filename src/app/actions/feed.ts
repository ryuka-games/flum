"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAndParseFeed } from "@/lib/feed/fetch-feed";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FeedActionState = {
  error?: string;
};

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

  // RSS フェッチ + パース
  const result = await fetchAndParseFeed(url);
  if (!result.success) {
    return { error: result.error };
  }

  // feed_sources に INSERT
  const { data: source, error: sourceError } = await supabase
    .from("feed_sources")
    .insert({ channel_id: channelId, name: result.feed.title, url })
    .select("id")
    .single();

  if (sourceError) {
    // unique 制約違反（同じ URL が既に登録済み）
    if (sourceError.code === "23505") {
      return { error: "この URL は既に登録されています" };
    }
    return { error: "ソースの登録に失敗しました" };
  }

  // feed_items に upsert
  if (result.feed.items.length > 0) {
    const items = result.feed.items.map((item) => ({
      feed_source_id: source.id,
      title: item.title,
      url: item.url,
      content: item.content ?? null,
      thumbnail_url: item.thumbnailUrl ?? null,
      published_at: item.publishedAt ?? null,
    }));

    await supabase.from("feed_items").upsert(items, {
      onConflict: "feed_source_id,url",
      ignoreDuplicates: true,
    });
  }

  // last_fetched_at を更新
  await supabase
    .from("feed_sources")
    .update({ last_fetched_at: new Date().toISOString() })
    .eq("id", source.id);

  revalidatePath(`/channels/${channelId}`);
  return {};
}

export async function deleteFeedSource(formData: FormData) {
  const id = formData.get("id") as string;
  const channelId = formData.get("channel_id") as string;
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("feed_sources").delete().eq("id", id);

  revalidatePath(`/channels/${channelId}`);
}

export async function refreshFeed(formData: FormData) {
  const sourceId = formData.get("source_id") as string;
  const channelId = formData.get("channel_id") as string;
  if (!sourceId) return;

  const supabase = await createClient();

  // ソースの URL を取得
  const { data: source } = await supabase
    .from("feed_sources")
    .select("id, url")
    .eq("id", sourceId)
    .single();

  if (!source) return;

  const result = await fetchAndParseFeed(source.url);
  if (!result.success) return;

  if (result.feed.items.length > 0) {
    const items = result.feed.items.map((item) => ({
      feed_source_id: source.id,
      title: item.title,
      url: item.url,
      content: item.content ?? null,
      thumbnail_url: item.thumbnailUrl ?? null,
      published_at: item.publishedAt ?? null,
    }));

    await supabase.from("feed_items").upsert(items, {
      onConflict: "feed_source_id,url",
      ignoreDuplicates: true,
    });
  }

  await supabase
    .from("feed_sources")
    .update({ last_fetched_at: new Date().toISOString() })
    .eq("id", source.id);

  revalidatePath(`/channels/${channelId}`);
}
