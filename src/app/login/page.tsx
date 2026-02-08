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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-8 text-4xl font-bold">Flum</h1>
        <p className="mb-8 text-foreground/60">
          チャンネル型リアルタイムフィードリーダー
        </p>
        <button
          onClick={handleGitHubLogin}
          className="rounded-lg bg-foreground px-6 py-3 text-background hover:opacity-90"
        >
          GitHub でログイン
        </button>
      </div>
    </div>
  );
}
