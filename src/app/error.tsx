"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--river-bg)] px-4 text-center">
      <p className="text-4xl font-bold text-neon-pink">!</p>
      <p className="mt-3 text-lg text-[var(--text-primary)]">
        問題が発生しました
      </p>
      <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
        {error.message || "予期しないエラーが発生しました"}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full border-2 border-neon-pink bg-neon-pink px-6 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
        >
          もう一度試す
        </button>
        <Link
          href="/"
          className="rounded-full border-2 border-river-border px-6 py-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-cyan)] hover:text-[var(--text-primary)]"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
