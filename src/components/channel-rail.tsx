"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pin } from "lucide-react";
import { createChannel } from "@/app/actions/channel";

/* ─────────────────────────────────────────────
   ChannelRailItem — アクティブ状態判定の薄い Client ラッパー
   ───────────────────────────────────────────── */

function ChannelRailItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const initial = label.charAt(0).toUpperCase();

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
        isActive
          ? "border-2 border-neon-pink bg-neon-pink/20 text-white shadow-[2px_2px_0_var(--accent-cyan)]"
          : "bg-river-deep/85 text-[var(--text-secondary)] ring-1 ring-white/[0.06] backdrop-blur-md hover:bg-river-surface/90 hover:text-[var(--text-primary)] hover:ring-white/[0.10]"
      }`}
      title={label}
    >
      {icon ?? initial}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CreateChannelButton — レール内の + ボタン → ドロップダウン入力
   ───────────────────────────────────────────── */

function CreateChannelButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSubmit(formData: FormData) {
    await createChannel(formData);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold transition-all ${
          open
            ? "border-2 border-neon-pink bg-neon-pink/20 text-white"
            : "bg-river-deep/85 text-[var(--text-secondary)] ring-1 ring-white/[0.06] backdrop-blur-md hover:bg-river-surface/90 hover:text-int-accent hover:ring-white/[0.10]"
        }`}
        title="チャンネルを作成"
        aria-label="チャンネルを作成"
      >
        +
      </button>
      {open && (
        <div className="absolute left-full top-0 z-30 ml-3 w-56 rounded-2xl border-2 border-neon-pink bg-river-deep p-3 shadow-[4px_4px_0_var(--accent-cyan)]">
          <form action={handleSubmit}>
            <label htmlFor="rail-new-channel" className="sr-only">
              新しいチャンネル名
            </label>
            <input
              ref={inputRef}
              id="rail-new-channel"
              type="text"
              name="name"
              placeholder="チャンネル名"
              className="w-full rounded-xl bg-river-surface px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-river-border"
            />
            <button
              type="submit"
              className="mt-2 w-full rounded-full border-2 border-neon-pink bg-neon-pink px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
            >
              作成
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ChannelRail — 左ガターに sticky 配置するナビゲーション
   Server Component から channels を受け取る
   ───────────────────────────────────────────── */

export function ChannelRail({
  channels,
}: {
  channels: { id: string; name: string }[];
}) {
  return (
    <nav
      aria-label="Channel navigation"
      className="sticky top-1/2 ml-auto mr-4 flex w-16 -translate-y-1/2 flex-col items-center gap-2 rounded-3xl bg-river-deep/60 py-4 backdrop-blur-lg"
    >
      {/* Scoops */}
      <ChannelRailItem
        href="/scoops"
        label="Scoops"
        icon={<Pin size={18} className="text-neon-pink" />}
      />
      <div className="my-1 h-px w-8 bg-river-border/50" />

      {/* Channels */}
      {channels.map((ch) => (
        <ChannelRailItem
          key={ch.id}
          href={`/channels/${ch.id}`}
          label={ch.name}
        />
      ))}
      <div className="my-1 h-px w-8 bg-river-border/50" />

      {/* 新規チャンネル */}
      <CreateChannelButton />
    </nav>
  );
}
