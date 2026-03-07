"use client";

import Image from "next/image";
import { Github, Rss, Palette, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: Rss,
    title: "チャンネル整理",
    desc: "RSSフィードをチャンネルで分類。情報が流れる水路を自分で設計",
    visual: "/visuals/channels.png",
  },
  {
    icon: Palette,
    title: "鮮度の可視化",
    desc: "新しい記事はビビッド、古い記事は色褪せる。一目で鮮度がわかる",
    visual: "/visuals/decay.png",
  },
  {
    icon: Pin,
    title: "Scoop",
    desc: "流れから記事を掬い上げて保存。大事な情報は流さない",
    visual: "/visuals/scoop.png",
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "";

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-river-bg px-4">
      <div className="w-full max-w-md text-center">
        {/* ブランド */}
        <h1 className="text-5xl font-bold text-[var(--text-primary)]">Flum</h1>
        <div className="mx-auto mt-3 h-1 w-16 -skew-x-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          チャンネル型フィードリーダー
        </p>

        {/* 機能紹介 */}
        <div className="mt-10 space-y-4 text-left">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>

        {/* サインインボタン（各ブランドガイドライン準拠） */}
        <div className="mt-10 space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#8E918F] bg-[#131314] px-8 py-3 text-sm font-medium text-[#E3E3E3] transition-colors hover:bg-[#1f1f1f]"
          >
            <GoogleIcon />
            Google でサインイン
          </button>

          <button
            onClick={handleGitHubLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#8E918F] bg-[#131314] px-8 py-3 text-sm font-medium text-[#E3E3E3] transition-colors hover:bg-[#1f1f1f]"
          >
            <Github size={18} />
            GitHub でサインイン
          </button>
        </div>

        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          無料 / アカウントで即開始
        </p>
      </div>
    </div>
  );
}

/* ─── Feature Card with optional visual ─── */

function FeatureCard({
  feature,
}: {
  feature: { icon: React.ComponentType<{ size: number; className?: string }>; title: string; desc: string; visual?: string };
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-river-surface/50">
      {feature.visual && (
        <VisualSlot src={feature.visual} alt={feature.title} />
      )}
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-river-surface">
          <feature.icon size={16} className="text-neon-pink" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {feature.title}
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {feature.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Visual slot: renders only when image exists ─── */

function VisualSlot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-video w-full bg-river-deep">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 448px) 100vw, 448px"
        onError={(e) => {
          // 画像がなければスロットごと非表示
          const container = (e.target as HTMLElement).parentElement;
          if (container) container.style.display = "none";
        }}
      />
    </div>
  );
}
