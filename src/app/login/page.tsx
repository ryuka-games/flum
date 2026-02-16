"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-river-bg">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--text-primary)]">Flum</h1>
        <div className="mx-auto mb-6 h-1 w-16 -skew-x-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan" />
        <p className="mb-8 text-[var(--text-muted)]">
          チャンネル型リアルタイムフィードリーダー
        </p>
        <button
          onClick={handleGitHubLogin}
          className="rounded-lg border-2 border-neon-pink bg-neon-pink px-6 py-3 font-bold text-white shadow-[3px_3px_0_var(--accent-cyan)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
        >
          GitHub でログイン
        </button>
      </div>
    </div>
  );
}
