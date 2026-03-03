"use client";

import { FeedItem } from "@/components/feed-item";
import { getFreshnessStage, type FreshnessStage } from "@/lib/decay";
import { useClientNow } from "@/lib/client-now";

/** 入場アニメーション対象の先頭アイテム数（ファーストビュー分） */
const ENTER_ANIM_COUNT = 6;

const STAGE_LABELS: Record<FreshnessStage, string> = {
  fresh: "たった今",
  recent: "数時間前",
  aging: "半日前",
  old: "かなり前",
  stale: "まもなく消失",
};

export type FeedItemData = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  feed_source_id: string;
  og_image: string | null;
  og_description: string | null;
  content: string | null;
  favoriteId?: string;
  channelName?: string;
};

function TimeGroupDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center px-4 py-2">
      <span className="rounded-full bg-black/60 px-3 py-0.5 text-xs text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

export function FeedItemList({
  items,
  sourceNameMap,
  favoritedUrls,
  channelName,
  returnPath,
  selectedIndex,
  noDecay,
  showChannelLabel,
}: {
  items: FeedItemData[];
  sourceNameMap: Record<string, string>;
  favoritedUrls: string[];
  channelName: string;
  returnPath: string;
  selectedIndex?: number | null;
  noDecay?: boolean;
  showChannelLabel?: boolean;
}) {
  const now = useClientNow();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-secondary)]">
        <div className="text-center">
          <p className="mb-2">フィードはまだありません</p>
          <p className="text-sm text-[var(--text-secondary)]">
            RSS ソースを追加するとここにフィードが表示されます
          </p>
        </div>
      </div>
    );
  }

  // アイテムを iterate しながらステージ境界に区切りを挿入
  let prevStage: FreshnessStage | null = null;
  const elements: React.ReactNode[] = [];

  items.forEach((item, i) => {
    if (!noDecay) {
      const stage = now
        ? getFreshnessStage(item.published_at, now)
        : "fresh" as FreshnessStage;

      if (stage !== prevStage) {
        elements.push(
          <TimeGroupDivider key={`divider-${stage}`} label={STAGE_LABELS[stage]} />
        );
        prevStage = stage;
      }
    }

    elements.push(
      <FeedItem
        key={item.id}
        title={item.title}
        url={item.url}
        sourceName={sourceNameMap[item.feed_source_id] ?? ""}
        publishedAt={item.published_at}
        channelName={item.channelName ?? channelName}
        hideChannelLabel={!showChannelLabel}
        returnPath={returnPath}
        isFavorited={favoritedUrls.includes(item.url)}
        favoriteId={item.favoriteId}
        ogImage={item.og_image ?? undefined}
        ogDescription={item.og_description ?? undefined}
        content={item.content ?? undefined}
        thumbnailUrl={item.thumbnail_url ?? undefined}
        enterIndex={i < ENTER_ANIM_COUNT ? i : undefined}
        isSelected={selectedIndex === i}
        itemIndex={i}
        noDecay={noDecay}
      />
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-2 pb-6">
      {elements}
    </div>
  );
}
