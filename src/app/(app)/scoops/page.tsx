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
      <section className="px-4 pb-4">
        {/* チャンネルフィルタ */}
        {channelNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/scoops"
              className={`rounded-full border-2 px-3 py-0.5 text-xs transition-colors ${
                !filterChannel
                  ? "border-neon-pink bg-neon-pink font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)]"
                  : "border-river-border bg-river-surface text-[var(--text-secondary)] hover:border-neon-pink hover:text-[var(--text-primary)]"
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
                    : "border-river-border bg-river-surface text-[var(--text-secondary)] hover:border-neon-pink hover:text-[var(--text-primary)]"
                }`}
              >
                # {name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div>
        {favorites && favorites.length > 0 ? (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-2">
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
                thumbnailUrl={fav.thumbnail_url ?? undefined}
                noDecay
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-secondary)]">
            <div className="text-center">
              <p className="mb-2">Scoop した記事はまだありません</p>
              <p className="text-sm text-[var(--text-secondary)]">
                フィードの <Pin size={14} className="inline text-neon-pink" /> をクリックして流れから掬い上げましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
