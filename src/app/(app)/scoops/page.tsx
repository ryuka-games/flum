import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScoopsFeedView } from "@/components/scoops-feed-view";

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

      <ScoopsFeedView scoops={favorites ?? []} />
    </>
  );
}
