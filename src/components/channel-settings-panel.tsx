"use client";

import { useState, useEffect, useOptimistic, useTransition, useSyncExternalStore } from "react";
import { Settings, Trash2, AlertTriangle, X } from "lucide-react";
import {
  getFeedErrorsSnapshot,
  subscribeFeedErrors,
} from "@/lib/feed/error-store";
import { deleteChannel } from "@/app/actions/channel";
import { updateKeywordFilters } from "@/app/actions/feed";
import { AddFeedForm } from "@/components/add-feed-form";
import { PresetChips } from "@/components/feed-presets";
import { DeleteFeedSourceButton } from "@/components/delete-feed-source";
import { WallpaperPicker } from "@/components/wallpaper-picker";
import { SidePanel } from "@/components/side-panel";
import { Tooltip } from "@/components/tooltip";

const EMPTY_ERRORS: Record<string, string> = {};

/* ─────────────────────────────────────────────
   ChannelSettingsPanel — ⚙ ボタン + 右ガターパネル
   フィード追加 / ソース管理 / 壁紙 / チャンネル削除
   ───────────────────────────────────────────── */

export function ChannelSettingsPanel({
  channelId,
  channelName,
  sources,
  existingUrls,
  keywordFilters,
}: {
  channelId: string;
  channelName: string;
  sources: { id: string; name: string; url: string }[];
  existingUrls: string[];
  keywordFilters: string[];
}) {
  const [open, setOpen] = useState(false);

  // モバイルメニューからの open イベントを受信
  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("open-channel-settings", handleOpen);
    return () => window.removeEventListener("open-channel-settings", handleOpen);
  }, []);

  // 開閉をモバイルメニューに通知
  useEffect(() => {
    window.dispatchEvent(
      new Event(open ? "channel-settings-opened" : "channel-settings-closed"),
    );
  }, [open]);

  const feedErrors = useSyncExternalStore(
    subscribeFeedErrors,
    () => getFeedErrorsSnapshot(channelId),
    () => EMPTY_ERRORS,
  );

  return (
    <>
      {/* トリガー: ⚙ ボタン — アバターの左隣に fixed 配置
          デスクトップ: right-[72px] top-6（avatar は right-6 top-6, w-10）
          モバイル: left-[60px]（avatar は left-3, w-10）*/}
      <Tooltip content="チャンネル設定" placement="bottom">
        {(ref, props) => (
          <button
            ref={ref}
            {...props}
            onClick={() => setOpen(!open)}
            className="click-ripple float-shadow float-water-delay-2 fixed right-[64px] top-6 z-50 hidden h-8 w-8 items-center justify-center rounded-full bg-river-deep/85 text-[var(--text-secondary)] backdrop-blur-md hover:text-int-accent md:flex"
            aria-label="チャンネル設定"
          >
            <Settings size={18} />
          </button>
        )}
      </Tooltip>

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
              {sources.map((source) => {
                const error = feedErrors[source.id];
                const chip = (
                  <div
                    key={source.id}
                    className={`flex items-center gap-1 rounded-full bg-river-surface px-2.5 py-1 text-xs text-[var(--text-secondary)] ${error ? "ring-1 ring-amber-400/50" : ""}`}
                  >
                    {error && (
                      <AlertTriangle
                        size={12}
                        className="shrink-0 text-amber-400"
                      />
                    )}
                    <span className="max-w-[160px] truncate">
                      {source.name}
                    </span>
                    <DeleteFeedSourceButton
                      sourceId={source.id}
                      channelId={channelId}
                    />
                  </div>
                );

                if (error) {
                  return (
                    <Tooltip key={source.id} content={error} placement="bottom">
                      {(ref, props) => (
                        <div ref={ref} {...props}>
                          {chip}
                        </div>
                      )}
                    </Tooltip>
                  );
                }

                return chip;
              })}
            </div>
          </section>
        )}

        {/* 水門（キーワードフィルタ） */}
        <KeywordFilterSection
          channelId={channelId}
          initialKeywords={keywordFilters}
        />

        {/* 壁紙 */}
        <section className="mb-4">
          <WallpaperPicker channelId={channelId} />
        </section>

        {/* チャンネル削除 — 底部右寄せ（破壊的操作を空間的に隔離） */}
        <form
          action={deleteChannel}
          className="flex justify-end border-t border-river-border pt-3"
        >
          <input type="hidden" name="id" value={channelId} />
          <Tooltip content="チャンネルを削除">
            {(ref, props) => (
              <button
                ref={ref}
                {...props}
                type="submit"
                className="rounded-lg p-1 text-int-danger hover:brightness-110"
                aria-label="チャンネルを削除"
              >
                <Trash2 size={14} />
              </button>
            )}
          </Tooltip>
        </form>
      </SidePanel>
    </>
  );
}

/* ─────────────────────────────────────────────
   KeywordFilterSection — 水門キーワードタグエディタ
   ───────────────────────────────────────────── */

function KeywordFilterSection({
  channelId,
  initialKeywords,
}: {
  channelId: string;
  initialKeywords: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [optimisticKeywords, setOptimisticKeywords] =
    useOptimistic(initialKeywords);
  const [, startTransition] = useTransition();

  function saveKeywords(next: string[]) {
    startTransition(async () => {
      setOptimisticKeywords(next);
      const fd = new FormData();
      fd.set("channel_id", channelId);
      fd.set("keyword_filters", JSON.stringify(next));
      await updateKeywordFilters(fd);
    });
  }

  function addKeyword(raw: string) {
    const kw = raw.trim();
    if (!kw) return;
    if (optimisticKeywords.includes(kw)) {
      setInputValue("");
      return;
    }
    saveKeywords([...optimisticKeywords, kw]);
    setInputValue("");
  }

  function removeKeyword(kw: string) {
    saveKeywords(optimisticKeywords.filter((k) => k !== kw));
  }

  return (
    <section className="mb-4">
      <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
        水門（キーワードフィルタ）
      </p>

      {/* タグ一覧 */}
      {optimisticKeywords.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {optimisticKeywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1 rounded-full bg-river-surface px-2.5 py-1 text-xs text-int-accent"
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="text-[var(--text-secondary)] hover:text-int-danger"
                aria-label={`${kw} を削除`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 入力欄 */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword(inputValue);
          }
        }}
        placeholder="キーワードを追加…"
        className="w-full rounded-lg border border-river-border bg-river-surface px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-int-accent/50 focus:outline-none"
      />
      <p className="mt-1 text-[10px] text-[var(--text-secondary)]/60">
        マッチする記事だけ表示されます
      </p>
    </section>
  );
}
