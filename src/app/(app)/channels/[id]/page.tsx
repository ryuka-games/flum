import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FeedPresets } from "@/components/feed-presets";
import { ChannelFeedView } from "@/components/channel-feed-view";
import { ChannelSettingsPanel } from "@/components/channel-settings-panel";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("id, name, description, keyword_filters")
    .eq("id", id)
    .single();

  if (!channel) notFound();

  // このチャンネルのフィードソース一覧
  const { data: sources } = await supabase
    .from("feed_sources")
    .select("id, name, url")
    .eq("channel_id", id)
    .order("created_at", { ascending: true });

  const hasSources = sources && sources.length > 0;
  const existingUrls = (sources ?? []).map((s) => s.url);

  const feedSourceIds = (sources ?? []).map((s) => s.id);
  const sourceNameMap: Record<string, string> = {};
  for (const s of sources ?? []) {
    sourceNameMap[s.id] = s.name;
  }

  // お気に入り済み URL → Scoop ID マップ
  const { data: favorites } = await supabase
    .from("scoops")
    .select("id, url");
  const scoopMap: Record<string, string> = {};
  for (const f of favorites ?? []) {
    scoopMap[f.url] = f.id;
  }

  return (
    <>
      {/* ⚙ チャンネル設定 — アバター隣に fixed 配置 */}
      <ChannelSettingsPanel
        channelId={channel.id}
        channelName={channel.name}
        sources={sources ?? []}
        existingUrls={existingUrls}
        keywordFilters={channel.keyword_filters ?? []}
      />

      {hasSources ? (
        <ChannelFeedView
          channelId={channel.id}
          channelName={channel.name}
          feedSourceIds={feedSourceIds}
          sourceNameMap={sourceNameMap}
          scoopMap={scoopMap}
        />
      ) : (
        <FeedPresets channelId={channel.id} existingUrls={existingUrls} />
      )}
    </>
  );
}
