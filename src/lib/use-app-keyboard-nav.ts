"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type UseAppKeyboardNavOptions = {
  channels: { id: string; name: string }[];
};

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useAppKeyboardNav({ channels }: UseAppKeyboardNavOptions) {
  const pathname = usePathname();
  const router = useRouter();

  const ref = useRef({ channels, pathname, router });
  ref.current = { channels, pathname, router };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return;
      if (document.querySelector("dialog[open]")) return;

      const { channels, pathname, router } = ref.current;

      // S → Scoops
      if (e.key === "S") {
        e.preventDefault();
        router.push("/scoops");
        return;
      }

      // 1-9 → チャンネル直接ジャンプ
      if (e.key >= "1" && e.key <= "9" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const idx = Number(e.key) - 1;
        if (idx < channels.length) {
          e.preventDefault();
          router.push(`/channels/${channels[idx].id}`);
        }
        return;
      }

      // H/L → 前後チャンネル
      if (e.key !== "H" && e.key !== "L") return;

      e.preventDefault();

      // 現在のチャンネル index を特定
      const match = pathname.match(/^\/channels\/([^/]+)/);
      const currentId = match?.[1];
      const isScoops = pathname.startsWith("/scoops");

      if (e.key === "H") {
        if (isScoops) {
          // Scoops → 最後のチャンネル
          if (channels.length > 0) {
            router.push(`/channels/${channels[channels.length - 1].id}`);
          }
        } else if (currentId) {
          const idx = channels.findIndex((ch) => ch.id === currentId);
          if (idx > 0) {
            router.push(`/channels/${channels[idx - 1].id}`);
          }
        }
      } else {
        // L
        if (isScoops) {
          // Scoops → 最初のチャンネル
          if (channels.length > 0) {
            router.push(`/channels/${channels[0].id}`);
          }
        } else if (currentId) {
          const idx = channels.findIndex((ch) => ch.id === currentId);
          if (idx >= 0 && idx < channels.length - 1) {
            router.push(`/channels/${channels[idx + 1].id}`);
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
