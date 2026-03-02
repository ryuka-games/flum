"use client";

import { useEffect, useRef } from "react";

type ShortcutSection = {
  title: string;
  shortcuts: { key: string; description: string }[];
};

const SECTIONS: ShortcutSection[] = [
  {
    title: "フィード操作",
    shortcuts: [
      { key: "j", description: "次のアイテム" },
      { key: "k", description: "前のアイテム" },
      { key: "o / Enter", description: "新タブで開く" },
      { key: "s", description: "Scoop トグル" },
      { key: "r", description: "リフレッシュ" },
    ],
  },
  {
    title: "ナビゲーション",
    shortcuts: [
      { key: "H", description: "前のチャンネル" },
      { key: "L", description: "次のチャンネル" },
      { key: "1 - 9", description: "チャンネルへジャンプ" },
      { key: "S", description: "Scoops へ移動" },
    ],
  },
  {
    title: "その他",
    shortcuts: [
      { key: "?", description: "このヘルプ" },
      { key: "Esc", description: "選択解除 / 閉じる" },
    ],
  },
];

export function KeyboardHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto max-w-xs rounded-2xl border border-white/10 bg-[var(--glass-bg)] p-6 text-[var(--text-primary)] backdrop-blur-xl backdrop:bg-black/50"
    >
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
        キーボードショートカット
      </h2>
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-xs font-medium text-[var(--text-muted)]">
              {section.title}
            </h3>
            <dl className="space-y-2">
              {section.shortcuts.map(({ key, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4"
                >
                  <dd className="text-sm">{description}</dd>
                  <dt>
                    <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-int-accent">
                      {key}
                    </kbd>
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-lg bg-white/5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white/10"
      >
        閉じる
      </button>
    </dialog>
  );
}
