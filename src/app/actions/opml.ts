"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OpmlChannel } from "@/lib/opml";

export type ImportResult = {
  channelsCreated: number;
  feedsAdded: number;
  feedsSkipped: number;
};

export async function importOpml(
  channels: OpmlChannel[],
): Promise<ImportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 既存チャンネルを取得（同名チャンネル再利用のため）
  const { data: existingChannels } = await supabase
    .from("channels")
    .select("id, name")
    .eq("user_id", user.id);

  const channelMap = new Map(
    (existingChannels ?? []).map((ch) => [ch.name, ch.id]),
  );

  let channelsCreated = 0;
  let feedsAdded = 0;
  let feedsSkipped = 0;

  for (const channel of channels) {
    let channelId = channelMap.get(channel.name);

    // 新規チャンネル作成
    if (!channelId) {
      const { data } = await supabase
        .from("channels")
        .insert({ name: channel.name, user_id: user.id })
        .select("id")
        .single();

      if (!data) continue;
      channelId = data.id;
      channelMap.set(channel.name, channelId);
      channelsCreated++;
    }

    // チャンネル内の既存 URL を取得（重複スキップ用）
    const { data: existingSources } = await supabase
      .from("feed_sources")
      .select("url")
      .eq("channel_id", channelId);

    const existingUrls = new Set(
      (existingSources ?? []).map((s) => s.url),
    );

    // 新規フィードだけフィルタ
    const newFeeds = channel.feeds.filter((f) => !existingUrls.has(f.url));
    feedsSkipped += channel.feeds.length - newFeeds.length;

    if (newFeeds.length === 0) continue;

    // 一括 INSERT
    const { data: inserted } = await supabase
      .from("feed_sources")
      .insert(
        newFeeds.map((f) => ({
          channel_id: channelId,
          name: f.title,
          url: f.url,
        })),
      )
      .select("id");

    feedsAdded += inserted?.length ?? 0;
  }

  revalidatePath("/");
  return { channelsCreated, feedsAdded, feedsSkipped };
}
