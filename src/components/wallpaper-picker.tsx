"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  getWallpaperUrl,
  loadWallpaper,
  setWallpaper,
  removeWallpaper,
  subscribeWallpaper,
} from "@/lib/wallpaper/store";

export function WallpaperPicker({ channelId }: { channelId: string }) {
  const url = useSyncExternalStore(
    subscribeWallpaper,
    () => getWallpaperUrl(channelId),
    () => null,
  );

  useEffect(() => {
    loadWallpaper(channelId);
  }, [channelId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setWallpaper(channelId, file);
    e.target.value = "";
  };

  const handleRemove = () => {
    removeWallpaper(channelId);
  };

  return (
    <div className="mt-3 border-t border-river-border pt-3">
      <p className="mb-1.5 text-xs text-[var(--text-secondary)]">壁紙</p>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-xl border-2 border-river-border px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-int-accent hover:text-int-accent">
          <ImagePlus size={14} className="mr-1 inline" />
          {url ? "変更" : "設定"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>
        {url && (
          <button
            onClick={handleRemove}
            className="rounded-xl border-2 border-river-border px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-int-danger hover:text-int-danger"
          >
            <X size={14} className="mr-1 inline" />
            削除
          </button>
        )}
      </div>
      {url && (
        <img
          src={url}
          alt="壁紙プレビュー"
          className="mt-2 h-16 w-full rounded-lg object-cover"
        />
      )}
    </div>
  );
}
