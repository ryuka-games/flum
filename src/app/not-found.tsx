"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--river-bg)] px-4 text-center">
      <p className="text-6xl font-bold text-neon-pink">404</p>
      <p className="mt-3 text-lg text-[var(--text-primary)]">
        ページが見つかりません
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        この水路は存在しないか、流れが変わったようです
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full border-2 border-neon-pink bg-neon-pink px-6 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
