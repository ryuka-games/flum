"use client";

import { useTransition, useState } from "react";
import { addFeedSource } from "@/app/actions/feed";
import { FEED_PRESETS, type FeedPreset } from "@/lib/feed/presets";
import { AddFeedForm } from "./add-feed-form";

/** プリセットをカテゴリごとにグループ化 */
function groupByCategory(
  presets: FeedPreset[],
): [string, FeedPreset[]][] {
  const map = new Map<string, FeedPreset[]>();
  for (const p of presets) {
    const list = map.get(p.category) ?? [];
    list.push(p);
    map.set(p.category, list);
  }
  return [...map.entries()];
}

/** 空チャンネルのプリセット画面 */
export function FeedPresets({
  channelId,
  existingUrls,
}: {
  channelId: string;
  existingUrls: string[];
}) {
  const categories = groupByCategory(FEED_PRESETS);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        フィードを追加しましょう
      </h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        おすすめから選ぶか、URL を直接入力できます
      </p>

      <div className="mt-8 space-y-5 text-left">
        {categories.map(([category, presets]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <PresetButton
                  key={preset.url}
                  channelId={channelId}
                  preset={preset}
                  isAdded={existingUrls.includes(preset.url)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-river-border/50 pt-6 text-left">
        <p className="mb-2 text-xs text-[var(--text-muted)]">URL を直接入力</p>
        <AddFeedForm channelId={channelId} />
      </div>
    </div>
  );
}

/** ドロップダウン用の小さめプリセット一覧 */
export function PresetChips({
  channelId,
  existingUrls,
}: {
  channelId: string;
  existingUrls: string[];
}) {
  const available = FEED_PRESETS.filter(
    (p) => !existingUrls.includes(p.url),
  );

  if (available.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs text-[var(--text-muted)]">おすすめ</p>
      <div className="flex flex-wrap gap-1.5">
        {available.map((preset) => (
          <PresetButton
            key={preset.url}
            channelId={channelId}
            preset={preset}
            isAdded={false}
            compact
          />
        ))}
      </div>
    </div>
  );
}

/** 個別のプリセットボタン */
function PresetButton({
  channelId,
  preset,
  isAdded,
  compact,
}: {
  channelId: string;
  preset: FeedPreset;
  isAdded: boolean;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(isAdded);
  const [error, setError] = useState<string>();

  function handleClick() {
    const formData = new FormData();
    formData.set("channel_id", channelId);
    formData.set("url", preset.url);
    startTransition(async () => {
      const result = await addFeedSource({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAdded(true);
      }
    });
  }

  const disabled = isPending || added;

  const baseStyle = compact
    ? "rounded px-2 py-0.5 text-xs"
    : "rounded-lg px-3 py-1.5 text-sm";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={error ?? preset.url}
      className={`${baseStyle} transition-colors ${
        added
          ? "bg-river-surface text-[var(--text-muted)]"
          : error
            ? "bg-red-900/30 text-red-400"
            : "bg-river-surface text-[var(--text-secondary)] hover:bg-river-border hover:text-[var(--text-primary)]"
      } disabled:cursor-default`}
    >
      {added ? "✓" : isPending ? "…" : "+"}{" "}
      {preset.name}
    </button>
  );
}
