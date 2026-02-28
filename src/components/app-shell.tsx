import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { FlowLine } from "@/components/flow-line";
import { WallpaperLayer } from "@/components/wallpaper-layer";
import { ChannelRail } from "@/components/channel-rail";
import { AvatarMenu } from "@/components/avatar-menu";
import { MobileChannelFab } from "@/components/mobile-channel-fab";

/* ─────────────────────────────────────────────
   AppShell — CSS Grid 3カラムレイアウト
   [左ガター 1fr] [コンテンツ max 640px] [右ガター 1fr]
   ───────────────────────────────────────────── */

export async function AppShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: channels } = await supabase
    .from("channels")
    .select("id, name")
    .order("created_at", { ascending: true });

  return (
    <>
      <FlowLine />
      <WallpaperLayer />

      <div className="relative z-10 grid min-h-[100svh] grid-cols-[1fr_minmax(0,640px)_1fr]">
        {/* 左ガター: デスクトップでチャンネルレール
            float-water はラッパーに適用（nav 内の Tooltip が containing block の影響を受けない） */}
        <div className="float-water hidden md:block">
          <ChannelRail channels={channels ?? []} />
        </div>

        {/* 中央: メインコンテンツ */}
        <main className="flex min-w-0 flex-col pt-6 pb-[calc(104px+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>

        {/* 右ガター: 空（将来の拡張用） */}
        <div />
      </div>

      {/* Floating 要素（Grid の外、fixed） */}
      {user && <AvatarMenu user={user} />}
      <MobileChannelFab channels={channels ?? []} />
    </>
  );
}
