import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedItem } from "@/components/feed-item";

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel: filterChannel } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("favorites")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterChannel) {
    query = query.eq("channel_name", filterChannel);
  }

  const { data: favorites } = await query;

  // フィルタ用: ユニークなチャンネル名一覧
  const { data: allFavorites } = await supabase
    .from("favorites")
    .select("channel_name");
  const channelNames = [
    ...new Set(
      (allFavorites ?? [])
        .map((f) => f.channel_name)
        .filter((name): name is string => !!name),
    ),
  ];

  return (
    <>
      <div className="sticky top-0 z-20 bg-[#0a0a0a]">
        <header className="border-b border-zinc-800/50 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">
            <Star size={16} fill="currentColor" className="mr-1 inline text-yellow-400" />
            お気に入り
          </h2>
        </header>

        {/* チャンネルフィルタ */}
        {channelNames.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-zinc-800/50 px-4 py-2">
            <a
              href="/favorites"
              className={`rounded px-2 py-0.5 text-xs ${
                !filterChannel
                  ? "bg-zinc-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              すべて
            </a>
            {channelNames.map((name) => (
              <a
                key={name}
                href={`/favorites?channel=${encodeURIComponent(name)}`}
                className={`rounded px-2 py-0.5 text-xs ${
                  filterChannel === name
                    ? "bg-zinc-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                # {name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div>
        {favorites && favorites.length > 0 ? (
          <div className="mx-auto max-w-xl divide-y divide-zinc-800/50">
            {favorites.map((fav) => (
              <FeedItem
                key={fav.id}
                title={fav.title}
                url={fav.url}
                sourceName={fav.source_name ?? ""}
                publishedAt={fav.published_at}
                channelName={fav.channel_name ?? undefined}
                favoriteId={fav.id}
                ogImage={fav.og_image ?? undefined}
                ogDescription={fav.og_description ?? undefined}
                thumbnailUrl={fav.thumbnail_url ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-20 text-zinc-600">
            <div className="text-center">
              <p className="mb-2">お気に入りはまだありません</p>
              <p className="text-sm text-zinc-700">
                フィードの ★ をクリックするとここに表示されます
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
