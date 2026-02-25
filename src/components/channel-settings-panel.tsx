"use client";

import { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { deleteChannel } from "@/app/actions/channel";
import { AddFeedForm } from "@/components/add-feed-form";
import { PresetChips } from "@/components/feed-presets";
import { DeleteFeedSourceButton } from "@/components/delete-feed-source";
import { WallpaperPicker } from "@/components/wallpaper-picker";
import { SidePanel } from "@/components/side-panel";

/* ─────────────────────────────────────────────
   ChannelSettingsPanel — ⚙ ボタン + 右ガターパネル
   フィード追加 / ソース管理 / 壁紙 / チャンネル削除
   ───────────────────────────────────────────── */

export function ChannelSettingsPanel({
  channelId,
  channelName,
  sources,
  existingUrls,
}: {
  channelId: string;
  channelName: string;
  sources: { id: string; name: string; url: string }[];
  existingUrls: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* トリガー: ⚙ ボタン — アバターの左隣に fixed 配置
          デスクトップ: right-[72px] top-6（avatar は right-6 top-6, w-10）
          モバイル: left-[60px]（avatar は left-3, w-10）*/}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-[64px] top-6 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-river-deep/85 text-[var(--text-secondary)] ring-1 ring-white/[0.06] backdrop-blur-md transition-all hover:bg-river-surface/90 hover:text-int-accent hover:ring-white/[0.10] max-md:left-[52px] max-md:right-auto max-md:top-[calc(12px+env(safe-area-inset-top,0px))]"
        title="チャンネル設定"
        aria-label="チャンネル設定"
      >
        <Settings size={18} />
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title={`# ${channelName}`}
      >
        {/* フィード追加 */}
        <section className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
            フィード追加
          </p>
          <AddFeedForm channelId={channelId} />
          <div className="mt-2">
            <PresetChips channelId={channelId} existingUrls={existingUrls} />
          </div>
        </section>

        {/* 登録済みソース */}
        {sources.length > 0 && (
          <section className="mb-4">
            <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
              登録済みソース
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-1 rounded-full bg-river-surface px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                >
                  <span className="max-w-[160px] truncate">{source.name}</span>
                  <DeleteFeedSourceButton
                    sourceId={source.id}
                    channelId={channelId}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 壁紙 */}
        <section className="mb-4">
          <WallpaperPicker channelId={channelId} />
        </section>

        {/* チャンネル削除 */}
        <form
          action={deleteChannel}
          className="border-t border-river-border pt-3"
        >
          <input type="hidden" name="id" value={channelId} />
          <button
            type="submit"
            className="flex w-full items-center gap-2 text-sm text-int-danger hover:brightness-110"
            title="チャンネル削除"
          >
            <Trash2 size={14} />
            チャンネルを削除
          </button>
        </form>
      </SidePanel>
    </>
  );
}
