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
          className="w-full rounded bg-river-surface px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex-shrink-0 rounded bg-river-border px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-river-surface disabled:opacity-50"
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
