"use client";

import { useEffect, useTransition } from "react";
import { refreshChannelById } from "@/app/actions/feed";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function AutoRefresh({ channelId }: { channelId: string }) {
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(async () => {
        await refreshChannelById(channelId).catch(() => {});
      });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [channelId, startTransition]);

  return null;
}
