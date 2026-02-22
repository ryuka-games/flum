import Link from "next/link";
import { Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedItem } from "@/components/feed-item";

export default async function ScoopsPage({
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
    .from("scoops")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterChannel) {
    query = query.eq("channel_name", filterChannel);
  }

  const { data: favorites } = await query;

  // フィルタ用: ユニークなチャンネル名一覧
  const { data: allFavorites } = await supabase
    .from("scoops")
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
      <div className="sticky top-0 z-40 bg-river-deep">
        <header className="px-4 py-3 pl-14 md:pl-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Scoops
          </h2>
        </header>

        {/* チャンネルフィルタ */}
        {channelNames.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-river-border px-4 py-2">
            <Link
              href="/scoops"
              className={`rounded-full border-2 px-3 py-0.5 text-xs transition-colors ${
                !filterChannel
                  ? "border-neon-pink bg-neon-pink font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)]"
                  : "border-river-border bg-river-surface text-[var(--text-muted)] hover:border-neon-pink hover:text-[var(--text-primary)]"
              }`}
            >
              すべて
            </Link>
            {channelNames.map((name) => (
              <Link
                key={name}
                href={`/scoops?channel=${encodeURIComponent(name)}`}
                className={`rounded-full border-2 px-3 py-0.5 text-xs transition-colors ${
                  filterChannel === name
                    ? "border-neon-pink bg-neon-pink font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)]"
                    : "border-river-border bg-river-surface text-[var(--text-muted)] hover:border-neon-pink hover:text-[var(--text-primary)]"
                }`}
              >
                # {name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        {favorites && favorites.length > 0 ? (
          <div className="mx-auto max-w-xl divide-y divide-river-border/50 bg-black/95 backdrop-blur-md">
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
                noDecay
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-muted)]">
            <div className="text-center">
              <p className="mb-2">Scoop した記事はまだありません</p>
              <p className="text-sm text-[var(--text-faded)]">
                フィードの <Pin size={14} className="inline text-neon-pink" /> をクリックして流れから掬い上げましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
