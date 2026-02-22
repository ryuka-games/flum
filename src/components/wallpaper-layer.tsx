"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getWallpaperUrl,
  loadWallpaper,
  subscribeWallpaper,
} from "@/lib/wallpaper/store";

function useChannelId(): string | null {
  const pathname = usePathname();
  const match = pathname.match(/^\/channels\/([^/]+)/);
  return match?.[1] ?? null;
}

/**
 * 壁紙なし時のデフォルト背景 — 夜の川（River at Night）
 *
 * Flum = Flume（水路）。星空が川面に映り、光が水面で揺れる。
 *
 * レイヤー構成:
 * 1. 星空（3層 Moiré ドットグリッド — 上半分）
 * 2. 水面反射（星のぼかしミラー — 下半分）
 * 3. 水平線（空と水面の境界）
 * 4. 揺らめき（水面で踊る光 — パルスアニメーション）
 * 5. 水流ライン（漂う光の筋 — 情報の流れ）
 * 6. 環境光（街の灯りの映り込み）
 */
function RiverNightDeco({ sidebarWidth }: { sidebarWidth: string }) {
  return (
    <div
      className="wallpaper-left pointer-events-none fixed right-0 top-0 bottom-0 z-0 overflow-hidden"
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      {/* 星空 — 上半分にマスク */}
      <div className="absolute inset-0 river-sky">
        <div className="absolute inset-0 river-stars-far" />
        <div className="absolute inset-0 river-stars-mid" />
        <div className="absolute inset-0 river-stars-near" />
      </div>

      {/* 水面反射 — 星を反転 + ぼかし、下半分にマスク */}
      <div className="absolute inset-0 river-reflection">
        <div className="absolute inset-0 river-stars-far" />
        <div className="absolute inset-0 river-stars-mid" />
        <div className="absolute inset-0 river-stars-near" />
      </div>

      {/* 水平線 */}
      <div className="river-horizon" />

      {/* 揺らめき（水面の光） */}
      <div className="river-shimmer river-shimmer-1" />
      <div className="river-shimmer river-shimmer-2" />
      <div className="river-shimmer river-shimmer-3" />
      <div className="river-shimmer river-shimmer-4" />

      {/* 水流ライン */}
      <div className="river-flow river-flow-1" />
      <div className="river-flow river-flow-2" />
      <div className="river-flow river-flow-3" />

      {/* 環境光 */}
      <div className="river-glow river-glow-pink" />
      <div className="river-glow river-glow-cyan" />
    </div>
  );
}

export function WallpaperLayer({ sidebarWidth }: { sidebarWidth: string }) {
  const channelId = useChannelId();

  const url = useSyncExternalStore(
    subscribeWallpaper,
    () => (channelId ? getWallpaperUrl(channelId) : null),
    () => null,
  );

  // Async load from IndexedDB on channel change
  useEffect(() => {
    if (channelId) loadWallpaper(channelId);
  }, [channelId]);

  if (!url) return <RiverNightDeco sidebarWidth={sidebarWidth} />;

  return (
    <div
      className="wallpaper-left pointer-events-none fixed right-0 top-0 bottom-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{ "--sidebar-width": sidebarWidth, backgroundImage: `url(${url})` } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[var(--glass-overlay)]" />
    </div>
  );
}
