"use client";

import { useActionState, useEffect } from "react";
import { addFeedSource, type FeedActionState } from "@/app/actions/feed";
import { putItems } from "@/lib/feed/store";

export function AddFeedForm({ channelId }: { channelId: string }) {
  const [state, action, isPending] = useActionState<FeedActionState, FormData>(
    addFeedSource,
    {},
  );

  // サーバーから返された items を IDB に保存
  // revalidatePath で ChannelFeedView が再マウント → getItemsBySourceIds が発火するので
  // ここでは saveAndNotify ではなく putItems だけで十分
  useEffect(() => {
    if (state.items && state.items.length > 0) {
      putItems(state.items);
    }
  }, [state.items]);

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="channel_id" value={channelId} />
      <label htmlFor="feed-url" className="sr-only">RSS フィードの URL</label>
      <div className="flex gap-1">
        <input
          id="feed-url"
          type="text"
          name="url"
          placeholder="RSS フィードの URL を入力"
          disabled={isPending}
          className="w-full rounded-xl bg-river-surface px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex-shrink-0 rounded-full border-2 border-neon-pink bg-neon-pink px-4 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)] disabled:opacity-50"
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
