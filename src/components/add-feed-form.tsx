"use client";

import { useActionState } from "react";
import { addFeedSource, type FeedActionState } from "@/app/actions/feed";

export function AddFeedForm({ channelId }: { channelId: string }) {
  const [state, action, isPending] = useActionState<FeedActionState, FormData>(
    addFeedSource,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="channel_id" value={channelId} />
      <div className="flex gap-1">
        <input
          type="text"
          name="url"
          placeholder="RSS フィードの URL を入力"
          disabled={isPending}
          className="w-full rounded bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex-shrink-0 rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          {isPending ? "追加中..." : "追加"}
        </button>
      </div>
      {state.error && (
        <p className="px-1 text-xs text-red-400">{state.error}</p>
      )}
    </form>
  );
}
