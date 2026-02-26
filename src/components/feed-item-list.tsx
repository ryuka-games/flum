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

type FeedItemData = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  feed_source_id: string;
  og_image: string | null;
};

function TimeGroupDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="h-px flex-1 bg-river-border/50" />
      <span className="rounded-full bg-black/60 px-3 py-0.5 text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="h-px flex-1 bg-river-border/50" />
    </div>
  );
}

export function FeedItemList({
  items,
  sourceNameMap,
  favoritedUrls,
  channelName,
  returnPath,
}: {
  items: FeedItemData[];
  sourceNameMap: Record<string, string>;
  favoritedUrls: string[];
  channelName: string;
  returnPath: string;
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
    const stage = now
      ? getFreshnessStage(item.published_at, now)
      : "fresh" as FreshnessStage;

    if (stage !== prevStage) {
      elements.push(
        <TimeGroupDivider key={`divider-${stage}`} label={STAGE_LABELS[stage]} />
      );
      prevStage = stage;
    }

    elements.push(
      <FeedItem
        key={item.id}
        title={item.title}
        url={item.url}
        sourceName={sourceNameMap[item.feed_source_id] ?? ""}
        publishedAt={item.published_at}
        channelName={channelName}
        hideChannelLabel
        returnPath={returnPath}
        isFavorited={favoritedUrls.includes(item.url)}
        ogImage={item.og_image ?? undefined}
        thumbnailUrl={item.thumbnail_url ?? undefined}
        enterIndex={i < ENTER_ANIM_COUNT ? i : undefined}
      />
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-2">
      {elements}
    </div>
  );
}
