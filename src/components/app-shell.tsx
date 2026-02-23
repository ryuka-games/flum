"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, PanelLeftClose } from "lucide-react";
import { FlowLine } from "@/components/flow-line";
import { WallpaperLayer } from "@/components/wallpaper-layer";

const STORAGE_KEY = "flum-sidebar-collapsed";
const TOGGLE_EVENT = "sidebar-toggle";

function getCollapsed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(TOGGLE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TOGGLE_EVENT, callback);
  };
}

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const collapsed = useSyncExternalStore(subscribe, getCollapsed, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ページ遷移でドロワーを閉じる
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Escape キーでドロワーを閉じる
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerOpen, closeDrawer]);

  const toggle = () => {
    localStorage.setItem(STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(TOGGLE_EVENT));
  };

  const sidebarWidth = collapsed ? "2.5rem" : "15rem";

  return (
    <>
      <FlowLine />
      <div className="flex min-h-screen">
        {/*
          レイアウトスペース確保用ラッパー。
          モバイル: w-0（サイドバーはオーバーレイ）
          デスクトップ: collapsed=w-10 / expanded=w-60
        */}
        <div className={`flex-shrink-0 w-0 ${collapsed ? "md:w-10" : "md:w-60"} md:sticky md:top-0 md:h-screen`}>
          {/* デスクトップ折りたたみバー */}
          {collapsed && (
            <div className="hidden md:flex h-screen w-10 flex-col items-center bg-river-deep py-3">
              <button
                onClick={toggle}
                className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-river-surface hover:text-white"
                title="サイドバーを表示"
                aria-label="サイドバーを表示"
              >
                <Menu size={18} />
              </button>
            </div>
          )}

          {/*
            サイドバー本体（1回だけ描画）。
            モバイル: fixed overlay, translate-x で開閉
            デスクトップ expanded: relative（ラッパー内に収まる）
            デスクトップ collapsed: md:hidden（折りたたみバーに置き換え）
          */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 w-60
              transition-transform duration-200
              ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
              md:relative md:z-auto md:translate-x-0 md:transition-none
              ${collapsed ? "md:hidden" : ""}
            `}
          >
            {/* モバイル: 閉じるボタン */}
            <button
              onClick={closeDrawer}
              className="absolute right-2 top-3 z-10 rounded-lg p-1 text-[var(--text-secondary)] hover:bg-river-surface hover:text-white md:hidden"
              aria-label="メニューを閉じる"
            >
              <X size={18} />
            </button>
            {/* デスクトップ: 折りたたみボタン */}
            <button
              onClick={toggle}
              className="absolute right-2 top-3 z-10 hidden rounded-lg p-1 text-[var(--text-secondary)] hover:bg-river-surface hover:text-white md:block"
              title="サイドバーを非表示"
              aria-label="サイドバーを非表示"
            >
              <PanelLeftClose size={18} />
            </button>
            {sidebar}
          </div>
        </div>

        {/* モバイルバックドロップ */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
        )}

        <main className="flex flex-1 flex-col min-w-0">
          {/* モバイルハンバーガー（ドロワー開いている時は非表示） */}
          {!drawerOpen && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="fixed left-3 top-3 z-30 rounded-xl bg-river-deep/80 p-2 text-[var(--text-secondary)] backdrop-blur-sm hover:text-white md:hidden"
              aria-label="メニューを開く"
            >
              <Menu size={20} />
            </button>
          )}
          <WallpaperLayer sidebarWidth={sidebarWidth} />
          <div className="relative z-10 flex flex-1 flex-col">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
