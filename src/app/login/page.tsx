"use client";

import { Github, Rss, Palette, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: Rss,
    title: "チャンネル整理",
    desc: "RSSフィードをチャンネルで分類。情報が流れる水路を自分で設計",
  },
  {
    icon: Palette,
    title: "鮮度の可視化",
    desc: "新しい記事はビビッド、古い記事は色褪せる。一目で鮮度がわかる",
  },
  {
    icon: Pin,
    title: "Scoop",
    desc: "流れから記事を掬い上げて保存。大事な情報は流さない",
  },
];

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
    <div className="flex min-h-screen items-center justify-center bg-river-bg px-4">
      <div className="w-full max-w-sm text-center">
        {/* ブランド */}
        <h1 className="text-5xl font-bold text-[var(--text-primary)]">Flum</h1>
        <div className="mx-auto mt-3 h-1 w-16 -skew-x-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          チャンネル型フィードリーダー
        </p>

        {/* 機能紹介 */}
        <div className="mt-10 space-y-4 text-left">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-river-surface">
                <f.icon size={16} className="text-neon-pink" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{f.title}</p>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleGitHubLogin}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-neon-pink bg-neon-pink px-8 py-3 font-bold text-white shadow-[3px_3px_0_var(--accent-cyan)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
        >
          <Github size={18} />
          GitHub でログイン
        </button>

        <p className="mt-4 text-xs text-[var(--text-faded)]">
          無料 / GitHub アカウントで即開始
        </p>
      </div>
    </div>
  );
}
