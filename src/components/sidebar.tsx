import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createChannel } from "@/app/actions/channel";
import { ChannelLink } from "@/components/channel-link";

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
    <aside className="flex h-screen w-60 flex-col bg-zinc-900 text-zinc-300">
      {/* ヘッダー */}
      <div className="border-b border-zinc-700 px-4 py-3">
        <h1 className="text-lg font-bold text-white">Flum</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <a
          href="/favorites"
          className="mb-2 flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-zinc-800"
        >
          <span className="text-yellow-400">★</span>
          お気に入り
        </a>

        <p className="mb-1 px-2 text-xs font-semibold uppercase text-zinc-500">
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
              className="w-full rounded bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-600"
            />
            <button
              type="submit"
              className="rounded bg-zinc-700 px-2 py-1 text-sm text-white hover:bg-zinc-600"
            >
              +
            </button>
          </div>
        </form>
      </nav>

      {/* ユーザー情報 + ログアウト */}
      <div className="border-t border-zinc-700 px-3 py-3">
        <div className="flex items-center gap-2">
          {user.user_metadata.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="flex-1 truncate text-sm text-white">
            {user.user_metadata.user_name ?? user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-zinc-500 hover:text-white"
              title="ログアウト"
            >
              退出
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
