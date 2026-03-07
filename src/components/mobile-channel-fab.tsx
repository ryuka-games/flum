"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pin, Plus } from "lucide-react";
import { createChannel } from "@/app/actions/channel";

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
  const [creating, setCreating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const closeSheet = () => {
    setOpen(false);
    setCreating(false);
  };

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // 作成モードでフォーカス
  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  async function handleCreate(formData: FormData) {
    await createChannel(formData);
    closeSheet();
    router.refresh();
  }

  return (
    <>
      {/* FAB トリガー */}
      <button
        onClick={() => setOpen(!open)}
        className="click-ripple float-shadow float-water-delay-3 fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neon-pink bg-river-deep/90 text-sm font-bold text-white shadow-neo-md backdrop-blur-md md:hidden"
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
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t-2 border-neon-pink bg-river-deep/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
            aria-label="Channel navigation"
          >
            {/* Scoops */}
            <Link
              href="/scoops"
              onClick={closeSheet}
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
                    onClick={closeSheet}
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

            <div className="my-2 h-px bg-river-border/50" />

            {/* チャンネル作成 */}
            {creating ? (
              <form action={handleCreate} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  name="name"
                  placeholder="チャンネル名"
                  className="min-w-0 flex-1 rounded-xl bg-river-surface px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border"
                />
                <button
                  type="submit"
                  className="rounded-full border-2 border-neon-pink bg-neon-pink px-4 py-2 text-sm font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
                >
                  作成
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-river-surface hover:text-int-accent"
              >
                <Plus size={16} />
                チャンネルを作成
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
