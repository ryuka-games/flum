import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { deleteChannel } from "@/app/actions/channel";
import { deleteFeedSource, refreshFeed } from "@/app/actions/feed";
import { AddFeedForm } from "@/components/add-feed-form";
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
    .select("id, title, url, thumbnail_url, published_at, feed_source_id")
    .in("feed_source_id", feedSourceIds.length > 0 ? feedSourceIds : [""])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  return (
    <>
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            <span className="mr-1 text-zinc-500">#</span>
            {channel.name}
          </h2>
          {channel.description && (
            <p className="text-xs text-zinc-500">{channel.description}</p>
          )}
        </div>
        <form action={deleteChannel}>
          <input type="hidden" name="id" value={channel.id} />
          <button
            type="submit"
            className="text-xs text-zinc-600 hover:text-red-400"
          >
            削除
          </button>
        </form>
      </header>

      {/* ソース管理エリア */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <AddFeedForm channelId={channel.id} />

        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
              >
                <span className="max-w-[200px] truncate">{source.name}</span>
                <form action={refreshFeed} className="inline">
                  <input type="hidden" name="source_id" value={source.id} />
                  <input type="hidden" name="channel_id" value={channel.id} />
                  <button
                    type="submit"
                    className="ml-1 text-zinc-500 hover:text-white"
                    title="再取得"
                  >
                    ↻
                  </button>
                </form>
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
        )}
      </div>

      {/* フィードアイテム一覧（Realtime 対応 Client Component） */}
      <div className="flex-1 overflow-y-auto">
        <FeedItemList
          initialItems={items ?? []}
          feedSourceIds={feedSourceIds}
          sourceNameMap={sourceNameMap}
        />
      </div>
    </>
  );
}
