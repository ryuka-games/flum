import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { deleteChannel } from "@/app/actions/channel";
import { deleteFeedSource, refreshChannel } from "@/app/actions/feed";
import { AddFeedForm } from "@/components/add-feed-form";
import { Dropdown } from "@/components/dropdown";
import { FeedItemList } from "@/components/feed-item-list";

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

  const feedSourceIds = (sources ?? []).map((s) => s.id);

  // sourceNameMap: feedSourceId → ソース名（Realtime ペイロードにはJOINデータがないため）
  const sourceNameMap: Record<string, string> = {};
  for (const s of sources ?? []) {
    sourceNameMap[s.id] = s.name;
  }

  // このチャンネルの全フィードアイテム
  const { data: items } = await supabase
    .from("feed_items")
    .select("id, title, url, thumbnail_url, published_at, feed_source_id, og_image, og_description, content")
    .in("feed_source_id", feedSourceIds.length > 0 ? feedSourceIds : [""])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  // お気に入り済み URL 一覧
  const { data: favorites } = await supabase
    .from("favorites")
    .select("url");
  const favoritedUrls = (favorites ?? []).map((f) => f.url);

  return (
    <>
      <div className="sticky top-0 z-20 bg-[#0a0a0a]">
        <header className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              <span className="mr-1 text-zinc-500">#</span>
              {channel.name}
            </h2>
            {channel.description && (
              <p className="text-xs text-zinc-500">{channel.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dropdown trigger={<span className="text-xl" title="ソース管理">+</span>}>
              <AddFeedForm channelId={channel.id} />
              {sources && sources.length > 0 && (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                      >
                        <span className="max-w-[160px] truncate">{source.name}</span>
                        <form action={deleteFeedSource} className="inline">
                          <input type="hidden" name="id" value={source.id} />
                          <input type="hidden" name="channel_id" value={channel.id} />
                          <button
                            type="submit"
                            className="text-zinc-500 hover:text-red-400"
                            title="ソース削除"
                          >
                            ×
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                  <form action={refreshChannel} className="mt-3">
                    <input type="hidden" name="channel_id" value={channel.id} />
                    <button
                      type="submit"
                      className="w-full rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    >
                      ↻ すべてのソースを更新
                    </button>
                  </form>
                </>
              )}
            </Dropdown>
            <form action={deleteChannel}>
              <input type="hidden" name="id" value={channel.id} />
              <button
                type="submit"
                className="text-zinc-600 hover:text-red-400"
                title="チャンネル削除"
              >
                <Trash2 size={20} />
              </button>
            </form>
          </div>
        </header>
      </div>

      {/* フィードアイテム一覧（Realtime 対応 Client Component） */}
      <div>
        <FeedItemList
          initialItems={items ?? []}
          feedSourceIds={feedSourceIds}
          sourceNameMap={sourceNameMap}
          favoritedUrls={favoritedUrls}
          channelName={channel.name}
          returnPath={`/channels/${id}`}
        />
      </div>
    </>
  );
}
