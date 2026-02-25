"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { OpmlImport } from "@/components/opml-import";
import { OpmlExport } from "@/components/opml-export";

/* ─────────────────────────────────────────────
   AvatarMenu — 軽量ドロップダウン（YouTube 風）
   トリガー: 右上 fixed のアバターアイコン
   内容: ユーザー名、OPML、ログアウト
   ───────────────────────────────────────────── */

export function AvatarMenu({
  user,
}: {
  user: {
    user_metadata: { avatar_url?: string; user_name?: string };
    email?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const avatarUrl = user.user_metadata.avatar_url;
  const userName = user.user_metadata.user_name ?? user.email;

  return (
    <div
      ref={ref}
      className="fixed right-6 top-6 z-50 max-md:left-3 max-md:right-auto max-md:top-[calc(12px+env(safe-area-inset-top,0px))]"
    >
      {/* トリガー: アバター */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-river-surface/80 backdrop-blur-sm transition-all hover:ring-2 hover:ring-neon-pink/50"
        aria-label="アカウントメニュー"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <span className="text-sm font-bold text-[var(--text-secondary)]">
            {(userName ?? "U").charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* ドロップダウン */}
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border-2 border-neon-pink bg-river-deep p-3 shadow-[4px_4px_0_var(--accent-cyan)] max-md:left-0 max-md:right-auto">
          {/* ユーザー情報 */}
          <div className="mb-2 flex items-center gap-3 border-b border-river-border pb-2">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
            )}
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {userName}
            </p>
          </div>

          {/* OPML */}
          <OpmlImport />
          <OpmlExport />

          {/* ログアウト */}
          <form
            action={signOut}
            className="mt-2 border-t border-river-border pt-2"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-river-surface hover:text-[var(--text-primary)]"
            >
              <LogOut size={12} />
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
