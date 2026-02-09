import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { removeFavorite } from "@/app/actions/favorite";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";

  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 30) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

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
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">
          <span className="mr-1 text-yellow-400">★</span>
          お気に入り
        </h2>
      </header>

      {/* チャンネルフィルタ */}
      {channelNames.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 px-4 py-2">
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

      <div className="flex-1 overflow-y-auto">
        {favorites && favorites.length > 0 ? (
          <div className="divide-y divide-zinc-800/50">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-3 rounded px-3 py-2 hover:bg-zinc-800/50"
              >
                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 gap-3"
                >
                  {fav.thumbnail_url && (
                    <img
                      src={fav.thumbnail_url}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{fav.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                      {fav.channel_name && (
                        <>
                          <span className="truncate">
                            # {fav.channel_name}
                          </span>
                          <span>·</span>
                        </>
                      )}
                      {fav.source_name && (
                        <span className="truncate">{fav.source_name}</span>
                      )}
                      {fav.published_at && (
                        <>
                          <span>·</span>
                          <span className="flex-shrink-0">
                            {timeAgo(fav.published_at)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
                <form action={removeFavorite} className="flex-shrink-0">
                  <input type="hidden" name="id" value={fav.id} />
                  <button
                    type="submit"
                    className="text-lg text-yellow-400 hover:text-zinc-500"
                    title="お気に入り解除"
                  >
                    ★
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-20 text-zinc-600">
            <div className="text-center">
              <p className="mb-2">お気に入りはまだありません</p>
              <p className="text-sm text-zinc-700">
                フィードの ☆ をクリックするとここに表示されます
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
