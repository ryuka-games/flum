import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 最初のチャンネルがあればリダイレクト
  const { data: channels } = await supabase
    .from("channels")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  if (channels && channels.length > 0) {
    redirect(`/channels/${channels[0].id}`);
  }

  // チャンネルがない場合
  return (
    <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
      <div className="text-center">
        <p className="mb-2 text-lg">チャンネルがありません</p>
        <p className="text-sm">← サイドバーからチャンネルを作成してください</p>
      </div>
    </div>
  );
}
