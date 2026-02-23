import Link from "next/link";
import { LogOut, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createChannel } from "@/app/actions/channel";
import { ChannelLink } from "@/components/channel-link";
import { OpmlImport } from "@/components/opml-import";
import { OpmlExport } from "@/components/opml-export";

export async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: channels } = await supabase
    .from("channels")
    .select("id, name")
    .order("created_at", { ascending: true });

  return (
    <aside className="flex h-screen w-60 flex-col bg-river-deep text-[var(--text-secondary)]">
      {/* ヘッダー */}
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Flum</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <Link
          href="/scoops"
          className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-river-surface hover:text-[var(--text-primary)]"
        >
          <Pin size={14} className="text-neon-pink" />
          Scoops
        </Link>

        <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faded)]">
          CHANNELS
        </p>
        {channels?.map((channel) => (
          <ChannelLink key={channel.id} id={channel.id} name={channel.name} />
        ))}

        {/* チャンネル作成フォーム */}
        <form action={createChannel} className="mt-2 px-1">
          <label htmlFor="new-channel" className="sr-only">新しいチャンネル名</label>
          <div className="flex gap-1">
            <input
              id="new-channel"
              type="text"
              name="name"
              placeholder="新しいチャンネル"
              className="w-full rounded-xl bg-river-surface px-3 py-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border"
            />
            <button
              type="submit"
              className="rounded-full border-2 border-neon-pink bg-neon-pink px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
              aria-label="チャンネルを作成"
            >
              +
            </button>
          </div>
        </form>

        {/* OPML インポート */}
        <div className="px-1">
          <OpmlImport />
          <OpmlExport />
        </div>
      </nav>

      {/* ユーザー情報 + ログアウト */}
      <div className="border-t border-river-border px-3 py-3">
        <div className="flex items-center gap-2">
          {user.user_metadata.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="flex-1 truncate text-sm text-[var(--text-primary)]">
            {user.user_metadata.user_name ?? user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="ログアウト"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
