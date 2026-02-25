"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-4xl font-bold text-neon-pink">!</p>
      <p className="mt-3 text-lg text-[var(--text-primary)]">
        問題が発生しました
      </p>
      <p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">
        {error.message || "予期しないエラーが発生しました"}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full border-2 border-neon-pink bg-neon-pink px-6 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
      >
        もう一度試す
      </button>
    </div>
  );
}
