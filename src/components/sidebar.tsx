import { LogOut, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createChannel } from "@/app/actions/channel";
import { ChannelLink } from "@/components/channel-link";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <div className="h-[2px] bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan" />

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <a
          href="/scoops"
          className="mb-2 flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-river-surface"
        >
          <Pin size={14} className="text-neon-pink" />
          Scoops
        </a>

        <p className="mb-1 px-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
          チャンネル
        </p>
        {channels?.map((channel) => (
          <ChannelLink key={channel.id} id={channel.id} name={channel.name} />
        ))}

        {/* チャンネル作成フォーム */}
        <form action={createChannel} className="mt-2 px-1">
          <div className="flex gap-1">
            <input
              type="text"
              name="name"
              placeholder="新しいチャンネル"
              className="w-full rounded bg-river-surface px-2 py-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border"
            />
            <button
              type="submit"
              className="rounded bg-river-border px-2 py-1 text-sm text-[var(--text-primary)] hover:bg-river-surface"
            >
              +
            </button>
          </div>
        </form>
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
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="ログアウト"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
