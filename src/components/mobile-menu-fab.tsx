"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Pin, Plus, Settings, LogOut } from "lucide-react";
import { createChannel } from "@/app/actions/channel";
import { signOut } from "@/app/actions/auth";
import { OpmlImport } from "@/components/opml-import";
import { OpmlExport } from "@/components/opml-export";

/* ─────────────────────────────────────────────
   MobileMenuFab — モバイル統合メニュー
   1つのボタン → ボトムシートに全ナビゲーションを集約
   ───────────────────────────────────────────── */

export function MobileMenuFab({
  user,
  channels,
}: {
  user: {
    user_metadata: {
      avatar_url?: string;
      user_name?: string;
      full_name?: string;
    };
    email?: string;
  } | null;
  channels: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // チャンネル設定パネルの開閉を追跡
  useEffect(() => {
    function onSettingsOpen() { setSettingsOpen(true); }
    function onSettingsClose() { setSettingsOpen(false); }
    window.addEventListener("channel-settings-opened", onSettingsOpen);
    window.addEventListener("channel-settings-closed", onSettingsClose);
    return () => {
      window.removeEventListener("channel-settings-opened", onSettingsOpen);
      window.removeEventListener("channel-settings-closed", onSettingsClose);
    };
  }, []);

  const closeSheet = () => {
    setOpen(false);
    setCreating(false);
  };

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSheet();
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

  function handleOpenSettings() {
    closeSheet();
    // ChannelSettingsPanel が listen する custom event
    window.dispatchEvent(new Event("open-channel-settings"));
  }

  const userName =
    user?.user_metadata.user_name ??
    user?.user_metadata.full_name ??
    user?.email;
  const avatarUrl = user?.user_metadata.avatar_url;
  const isChannelPage = pathname.startsWith("/channels/");

  return (
    <>
      {/* FAB トリガー — メニューも設定パネルも閉じてるときだけ表示 */}
      {!open && !settingsOpen && (
        <button
          onClick={() => setOpen(true)}
          className="click-ripple float-shadow float-water-delay-3 fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-river-deep/85 text-[var(--text-secondary)] backdrop-blur-md md:hidden"
          aria-label="メニュー"
        >
          <Menu size={18} />
        </button>
      )}

      {/* ボトムシート */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closeSheet}
        >
          <nav
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t-2 border-neon-pink bg-river-deep/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {/* アバター情報 */}
            {user && (
              <div className="mb-3 flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-river-surface">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">
                      {(userName ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {userName}
                </p>
              </div>
            )}

            <div className="h-px bg-river-border/50" />

            {/* Scoops */}
            <Link
              href="/scoops"
              onClick={closeSheet}
              className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                pathname === "/scoops"
                  ? "border-2 border-neon-pink bg-neon-pink/20 text-white"
                  : "text-[var(--text-secondary)] hover:bg-river-surface hover:text-[var(--text-primary)]"
              }`}
            >
              <Pin size={16} className="text-neon-pink" />
              Scoops
            </Link>

            {/* チャンネル設定（チャンネルページのみ） */}
            {isChannelPage && (
              <button
                onClick={handleOpenSettings}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-river-surface hover:text-int-accent"
              >
                <Settings size={16} />
                チャンネル設定
              </button>
            )}

            <div className="my-2 h-px bg-river-border/50" />

            {/* Channels */}
            <div className="max-h-[40vh] space-y-1 overflow-y-auto">
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
                    <span className="mr-2 text-[var(--text-secondary)]">
                      #
                    </span>
                    {ch.name}
                  </Link>
                );
              })}
            </div>

            {/* チャンネル作成 */}
            <div className="mt-1">
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-river-surface hover:text-int-accent"
                >
                  <Plus size={16} />
                  チャンネルを作成
                </button>
              )}
            </div>

            <div className="my-2 h-px bg-river-border/50" />

            {/* OPML + ログアウト */}
            {user && (
              <div className="space-y-1">
                <OpmlImport />
                <OpmlExport />
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-river-surface hover:text-[var(--text-primary)]"
                  >
                    <LogOut size={16} />
                    ログアウト
                  </button>
                </form>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
