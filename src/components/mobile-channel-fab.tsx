"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pin } from "lucide-react";

/* ─────────────────────────────────────────────
   MobileChannelFab — モバイル専用チャンネル切替 FAB
   右下 fixed。タップでボトムシート表示。
   ───────────────────────────────────────────── */

export function MobileChannelFab({
  channels,
}: {
  channels: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移でシートを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* FAB トリガー */}
      <button
        onClick={() => setOpen(!open)}
        className="click-ripple float-water-delay-3 fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neon-pink bg-river-deep/90 text-sm font-bold text-white shadow-neo-md backdrop-blur-md md:hidden"
        aria-label="チャンネル一覧"
        aria-expanded={open}
      >
        Ch
      </button>

      {/* ボトムシート */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        >
          <nav
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-river-deep/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
            aria-label="Channel navigation"
          >
            {/* Scoops */}
            <Link
              href="/scoops"
              className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                pathname === "/scoops"
                  ? "border-2 border-neon-pink bg-neon-pink/20 text-white"
                  : "text-[var(--text-secondary)] hover:bg-river-surface hover:text-[var(--text-primary)]"
              }`}
            >
              <Pin size={16} className="text-neon-pink" />
              Scoops
            </Link>

            <div className="my-2 h-px bg-river-border/50" />

            {/* Channels */}
            <div className="max-h-[50vh] space-y-1 overflow-y-auto">
              {channels.map((ch) => {
                const href = `/channels/${ch.id}`;
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={ch.id}
                    href={href}
                    className={`flex items-center rounded-xl px-3 py-2.5 text-sm ${
                      isActive
                        ? "border-2 border-neon-pink bg-neon-pink/20 font-bold text-white"
                        : "text-[var(--text-secondary)] hover:bg-river-surface hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="mr-2 text-[var(--text-secondary)]">#</span>
                    {ch.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
