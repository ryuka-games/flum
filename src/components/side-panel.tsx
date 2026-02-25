"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/* ─────────────────────────────────────────────
   SidePanel — 右ガターにポンッと出現するパネル
   デスクトップ: コンテンツ(640px)の右横に浮遊
   モバイル: ボトムシート
   見た目: ピンク枠 + シアンシャドウ（ネオブルータリスト）
   ───────────────────────────────────────────── */

export function SidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  // rAF で1フレーム遅延: トリガーボタンの click と mousedown の競合を回避
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* モバイルバックドロップ */}
      <div
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        aria-hidden="true"
      />

      {/* パネル本体
          モバイル: fixed bottom sheet (inset-x-3 bottom-3)
          デスクトップ: コンテンツ右端 + 16px gap に配置
            left: min(
              calc(50% + 336px),       ← コンテンツ右端(50%+320px) + 16px gap
              calc(100vw - 344px)      ← 画面右端から panel(320px) + 24px margin
            )
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={title}
        className="side-panel fixed z-50 overflow-y-auto rounded-2xl border-2 border-neon-pink bg-river-deep p-4 shadow-[4px_4px_0_var(--accent-cyan)]"
      >
        {/* ヘッダー */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </>
  );
}
