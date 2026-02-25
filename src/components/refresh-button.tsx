"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshChannelById } from "@/app/actions/feed";
import { saveAndNotify } from "@/lib/feed/store";
import { Tooltip } from "@/components/tooltip";

export function RefreshButton({
  channelId,
  feedSourceIds,
}: {
  channelId: string;
  feedSourceIds: string[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    window.dispatchEvent(new Event("flowline:start"));
    startTransition(async () => {
      try {
        const fetched = await refreshChannelById(channelId).catch(() => []);
        if (fetched.length > 0) {
          await saveAndNotify(fetched, feedSourceIds);
        }
      } finally {
        window.dispatchEvent(new Event("flowline:done"));
      }
    });
  }

  return (
    <Tooltip content="すべてのソースを更新">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`transition-colors ${isPending ? "text-int-accent" : "text-[var(--text-muted)] hover:text-int-accent"}`}
        aria-label="すべてのソースを更新"
      >
        <RefreshCw size={18} className={isPending ? "animate-spin" : ""} />
      </button>
    </Tooltip>
  );
}
