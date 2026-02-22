import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { deleteChannel } from "@/app/actions/channel";
import { deleteFeedSource } from "@/app/actions/feed";
import { AddFeedForm } from "@/components/add-feed-form";
import { Dropdown } from "@/components/dropdown";
import { FeedPresets, PresetChips } from "@/components/feed-presets";
import { ChannelFeedView } from "@/components/channel-feed-view";
import { RefreshButton } from "@/components/refresh-button";
import { WallpaperPicker } from "@/components/wallpaper-picker";

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
      <div className="sticky top-0 z-40 bg-river-deep">
        <header className="flex items-center justify-between px-4 py-3 pl-14 md:pl-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              <span className="mr-1 text-[var(--text-muted)]">#</span>
              {channel.name}
            </h2>
            {channel.description && (
              <p className="text-xs text-[var(--text-muted)]">{channel.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dropdown trigger={<span className="text-xl" title="ソース管理">+</span>}>
              <AddFeedForm channelId={channel.id} />
              <PresetChips channelId={channel.id} existingUrls={existingUrls} />
              {hasSources && (
                <>
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs text-[var(--text-muted)]">登録済み</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source) => (
                        <div
                          key={source.id}
                          className="flex items-center gap-1 rounded-full bg-river-surface px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                        >
                          <span className="max-w-[160px] truncate">{source.name}</span>
                          <form action={deleteFeedSource} className="inline">
                            <input type="hidden" name="id" value={source.id} />
                            <input type="hidden" name="channel_id" value={channel.id} />
                            <button
                              type="submit"
                              className="text-[var(--text-muted)] hover:text-red-400"
                              title="ソース削除"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <RefreshButton channelId={channel.id} feedSourceIds={feedSourceIds} />
                  </div>
                </>
              )}
              <WallpaperPicker channelId={channel.id} />
            </Dropdown>
            <form action={deleteChannel}>
              <input type="hidden" name="id" value={channel.id} />
              <button
                type="submit"
                className="text-[var(--text-faded)] hover:text-red-400"
                title="チャンネル削除"
              >
                <Trash2 size={20} />
              </button>
            </form>
          </div>
        </header>
      </div>

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
