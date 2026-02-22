"use client";

import { useTransition } from "react";
import { refreshChannelById } from "@/app/actions/feed";
import { saveAndNotify } from "@/lib/feed/store";

export function RefreshButton({
  channelId,
  feedSourceIds,
}: {
  channelId: string;
  feedSourceIds: string[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const fetched = await refreshChannelById(channelId).catch(() => []);
      if (fetched.length > 0) {
        await saveAndNotify(fetched, feedSourceIds);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-xl border-2 border-river-border px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-int-accent hover:text-int-accent disabled:opacity-50"
    >
      {isPending ? "更新中..." : "↻ すべてのソースを更新"}
    </button>
  );
}
