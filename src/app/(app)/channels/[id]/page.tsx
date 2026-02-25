import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FeedPresets } from "@/components/feed-presets";
import { ChannelFeedView } from "@/components/channel-feed-view";
import { RefreshButton } from "@/components/refresh-button";
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
    .select("id, name, description")
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

  // お気に入り済み URL 一覧
  const { data: favorites } = await supabase
    .from("scoops")
    .select("url");
  const scoopedUrls = (favorites ?? []).map((f) => f.url);

  return (
    <>
      <section className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              <span className="mr-1 text-[var(--text-muted)]">#</span>
              {channel.name}
            </h2>
            {channel.description && (
              <p className="text-xs text-[var(--text-muted)]">{channel.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasSources && (
              <RefreshButton channelId={channel.id} feedSourceIds={feedSourceIds} />
            )}
            <ChannelSettingsPanel
              channelId={channel.id}
              channelName={channel.name}
              sources={sources ?? []}
              existingUrls={existingUrls}
            />
          </div>
        </div>
      </section>

      {hasSources ? (
        <ChannelFeedView
          channelId={channel.id}
          channelName={channel.name}
          feedSourceIds={feedSourceIds}
          sourceNameMap={sourceNameMap}
          scoopedUrls={scoopedUrls}
        />
      ) : (
        <FeedPresets channelId={channel.id} existingUrls={existingUrls} />
      )}
    </>
  );
}
