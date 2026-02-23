"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function FlowLine() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const done = () => {
    clearTimers();
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
  };

  const doneRef = useRef(done);
  doneRef.current = done;

  const start = () => {
    clearTimers();
    setLoading(true);
    setProgress(0);
    requestAnimationFrame(() => {
      setProgress(20);
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.08));
      }, 150);
    });
    timerRef.current = setTimeout(() => doneRef.current(), 8000);
  };

  const startRef = useRef(start);
  startRef.current = start;

  // ナビゲーション開始: 内部リンクのクリックを検知
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (
          url.pathname !== window.location.pathname ||
          url.search !== window.location.search
        ) {
          startRef.current();
        }
      } catch {
        /* invalid URL */
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // 外部トリガー: カスタムイベントで start/done を受け付ける
  useEffect(() => {
    const onStart = () => startRef.current();
    const onDone = () => doneRef.current();
    window.addEventListener("flowline:start", onStart);
    window.addEventListener("flowline:done", onDone);
    return () => {
      window.removeEventListener("flowline:start", onStart);
      window.removeEventListener("flowline:done", onDone);
    };
  }, []);

  // ナビゲーション完了: pathname 変化を検知
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      doneRef.current();
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  // ナビゲーション完了: search params 変化を検知（useSearchParams 不要）
  // ページ再レンダリング時に window.location.search をチェック
  useEffect(() => {
    if (!loading) return;
    const currentSearch = window.location.search;
    if (currentSearch !== prevSearchRef.current) {
      doneRef.current();
      prevSearchRef.current = currentSearch;
    }
  });

  useEffect(() => () => clearTimers(), []);

  // 通常: フルグラデーション / ローディング: 左から伸びる
  if (!loading) {
    return (
      <div className="pointer-events-none fixed left-0 right-0 top-[3.25rem] z-50 h-[2px] bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan" />
    );
  }

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-[3.25rem] z-50 h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan transition-[width] ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "300ms",
        }}
      />
    </div>
  );
}
