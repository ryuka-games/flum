"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "flum-sidebar-collapsed";

function getCollapsed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const storedCollapsed = useSyncExternalStore(subscribe, getCollapsed, () => false);
  const [collapsed, setCollapsed] = useState(storedCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 h-screen flex-shrink-0">
        {collapsed ? (
          <div className="flex h-screen w-10 flex-col items-center bg-zinc-900 py-3">
            <button
              onClick={toggle}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              title="サイドバーを表示"
            >
              ≡
            </button>
          </div>
        ) : (
          <div className="relative h-screen w-60">
            <button
              onClick={toggle}
              className="absolute right-2 top-3 z-10 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              title="サイドバーを非表示"
            >
              ←
            </button>
            {sidebar}
          </div>
        )}
      </div>
      <main className="flex flex-1 flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
