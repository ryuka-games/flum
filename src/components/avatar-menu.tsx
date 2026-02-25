"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { OpmlImport } from "@/components/opml-import";
import { OpmlExport } from "@/components/opml-export";
import { SidePanel } from "@/components/side-panel";

/* ─────────────────────────────────────────────
   AvatarMenu — アカウントメニュー
   トリガー: 右上 fixed のアバターアイコン
   パネル: SidePanel（右ガターにポップ）
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

  const avatarUrl = user.user_metadata.avatar_url;
  const userName = user.user_metadata.user_name ?? user.email;

  return (
    <>
      {/* トリガー: アバター（右上 fixed） */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-river-surface/80 backdrop-blur-sm transition-all hover:ring-2 hover:ring-neon-pink/50 max-md:left-3 max-md:right-auto max-md:top-[calc(12px+env(safe-area-inset-top,0px))]"
        aria-label="アカウントメニュー"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <span className="text-sm font-bold text-[var(--text-secondary)]">
            {(userName ?? "U").charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="アカウント"
      >
        {/* ユーザー名 */}
        <div className="mb-3 flex items-center gap-3 border-b border-river-border pb-3">
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
      </SidePanel>
    </>
  );
}
