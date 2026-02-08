import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { deleteChannel } from "@/app/actions/channel";

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

      {/* フィードエリア（プレースホルダー） */}
      <div className="flex flex-1 items-center justify-center text-zinc-600">
        <div className="text-center">
          <p className="mb-2">フィードはまだありません</p>
          <p className="text-sm text-zinc-700">
            RSS ソースを追加するとここにフィードが表示されます
          </p>
        </div>
      </div>
    </>
  );
}
