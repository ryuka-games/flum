"use client";

import { useEffect, useRef, useState } from "react";
import { toggleFavorite, removeFavorite } from "@/app/actions/favorite";
import type { FeedItemData } from "@/components/feed-item-list";

type UseKeyboardNavOptions = {
  items: FeedItemData[];
  channelId?: string;
  feedSourceIds?: string[];
  scoopMap: Record<string, string>; // url → scoopId
  sourceNameMap: Record<string, string>;
  channelName: string;
  returnPath: string;
};

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

function scrollToSelected(index: number) {
  const el = document.querySelector(`[data-feed-item-index="${index}"]`);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const margin = 60;

  // 既に快適ゾーン内なら動かさない
  if (rect.top >= margin && rect.bottom <= vh - margin) return;

  // 快適ゾーン外なら上から 25% の位置へ
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.scrollTo({
    top: window.scrollY + rect.top - vh * 0.25,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

/** 画面内に見えている最初のカードの index を返す。見つからなければ 0 */
function findVisibleIndex(): number {
  const els = document.querySelectorAll("[data-feed-item-index]");
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight) {
      return Number(el.getAttribute("data-feed-item-index"));
    }
  }
  return 0;
}

function moveTo(index: number, set: (i: number) => void) {
  set(index);
  requestAnimationFrame(() => scrollToSelected(index));
}

export function useKeyboardNav(options: UseKeyboardNavOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // アクションキー（o/s/Escape）が読む値を ref に保持
  // → keydown リスナーの依存配列から除外し、再登録を減らす
  const ref = useRef(options);
  ref.current = options;
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const helpRef = useRef(helpOpen);
  helpRef.current = helpOpen;

  // アイテム数が変わったら selectedIndex をクランプ
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (options.items.length === 0) return null;
      return Math.min(prev, options.items.length - 1);
    });
  }, [options.items.length]);

  // マウスが動いたら選択解除（キーボードとマウスは排他）
  // { once: true } で1回だけ発火 → selectedIndex が非 null になったら再登録
  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = () => setSelectedIndex(null);
    document.addEventListener("mousemove", handler, { once: true });
    return () => document.removeEventListener("mousemove", handler);
  }, [selectedIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return;
      const { items, scoopMap, sourceNameMap, channelName, returnPath,
              channelId, feedSourceIds } = ref.current;
      const sel = selectedRef.current;

      // dialog が開いている場合（ヘルプ以外）はスキップ
      if (document.querySelector("dialog[open]") && !helpRef.current) return;

      switch (e.key) {
        case "j": {
          e.preventDefault();
          if (items.length === 0) return;
          const next = sel === null
            ? findVisibleIndex()
            : Math.min(sel + 1, items.length - 1);
          moveTo(next, setSelectedIndex);
          break;
        }
        case "k": {
          e.preventDefault();
          if (items.length === 0) return;
          if (sel === null) {
            moveTo(findVisibleIndex(), setSelectedIndex);
          } else if (sel > 0) {
            moveTo(sel - 1, setSelectedIndex);
          }
          break;
        }
        case "o":
        case "Enter": {
          if (sel === null || !items[sel]) return;
          e.preventDefault();
          window.open(items[sel].url, "_blank", "noopener");
          break;
        }
        case "s": {
          if (sel === null || !items[sel]) return;
          e.preventDefault();
          const item = items[sel];
          const scoopId = scoopMap[item.url];

          if (scoopId) {
            const fd = new FormData();
            fd.set("id", scoopId);
            removeFavorite(fd);
          } else {
            const fd = new FormData();
            fd.set("url", item.url);
            fd.set("title", item.title);
            fd.set("source_name", sourceNameMap[item.feed_source_id] ?? "");
            fd.set("channel_name", channelName);
            fd.set("published_at", item.published_at ?? "");
            fd.set("return_path", returnPath);
            fd.set("og_image", item.og_image ?? "");
            toggleFavorite(fd);
          }
          break;
        }
        case "r": {
          if (!channelId || !feedSourceIds) return; // Scoops ではリフレッシュ不要
          e.preventDefault();
          (async () => {
            const { refreshChannelById } = await import("@/app/actions/feed");
            const { saveAndNotify } = await import("@/lib/feed/store");
            const { setFeedErrors } = await import("@/lib/feed/error-store");

            window.dispatchEvent(new Event("flowline:start"));
            try {
              const result = await refreshChannelById(channelId);
              setFeedErrors(channelId, result.errors, result.succeededSourceIds);
              if (result.items.length > 0) {
                await saveAndNotify(result.items, feedSourceIds);
              }
            } finally {
              window.dispatchEvent(new Event("flowline:done"));
            }
          })();
          break;
        }
        case "p": {
          if (sel === null || !items[sel]) return;
          e.preventDefault();
          const el = document.querySelector(`[data-feed-item-index="${sel}"]`);
          el?.dispatchEvent(new CustomEvent("toggle-preview", { bubbles: false }));
          break;
        }
        case "?": {
          e.preventDefault();
          setHelpOpen((prev) => !prev);
          break;
        }
        case "Escape": {
          if (helpRef.current) {
            e.preventDefault();
            setHelpOpen(false);
          } else if (sel !== null) {
            e.preventDefault();
            setSelectedIndex(null);
          }
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []); // ref 経由で最新値を読むため依存不要

  return { selectedIndex, helpOpen, setHelpOpen };
}
