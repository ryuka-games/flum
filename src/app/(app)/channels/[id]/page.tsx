import { Settings, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { deleteChannel } from "@/app/actions/channel";
import { DeleteFeedSourceButton } from "@/components/delete-feed-source";
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
            {/* + ボタン: フィード追加のみ */}
            <Dropdown trigger={<span className="text-xl" title="フィード追加">+</span>}>
              <AddFeedForm channelId={channel.id} />
              <PresetChips channelId={channel.id} existingUrls={existingUrls} />
            </Dropdown>

            {hasSources && (
              <>
                {/* ↻ リフレッシュ */}
                <RefreshButton channelId={channel.id} feedSourceIds={feedSourceIds} />

                {/* ⚙ チャンネル設定 */}
                <Dropdown
                  trigger={
                    <span title="チャンネル設定">
                      <Settings size={18} />
                    </span>
                  }
                >
                  <div>
                    <p className="mb-1.5 text-xs text-[var(--text-muted)]">登録済み</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source) => (
                        <div
                          key={source.id}
                          className="flex items-center gap-1 rounded-full bg-river-surface px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                        >
                          <span className="max-w-[160px] truncate">{source.name}</span>
                          <DeleteFeedSourceButton sourceId={source.id} channelId={channel.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <WallpaperPicker channelId={channel.id} />
                  <form action={deleteChannel} className="mt-3 border-t border-river-border pt-3">
                    <input type="hidden" name="id" value={channel.id} />
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-sm text-red-400 hover:text-red-300"
                      title="チャンネル削除"
                    >
                      <Trash2 size={14} />
                      チャンネルを削除
                    </button>
                  </form>
                </Dropdown>
              </>
            )}
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
