"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";
import { refreshChannelById, type RefreshResult } from "@/app/actions/feed";
import {
  saveAndNotify,
  getItemsBySourceIds,
  pruneExpiredItems,
  getItemsSnapshot,
  subscribeFeedItems,
} from "@/lib/feed/store";
import { setFeedErrors } from "@/lib/feed/error-store";
import { FeedItemList } from "@/components/feed-item-list";
import { KeyboardHelp } from "@/components/keyboard-help";
import { useKeyboardNav } from "@/lib/use-keyboard-nav";
import { isExpired } from "@/lib/decay";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function ChannelFeedView({
  channelId,
  channelName,
  feedSourceIds,
  sourceNameMap,
  scoopMap,
}: {
  channelId: string;
  channelName: string;
  feedSourceIds: string[];
  sourceNameMap: Record<string, string>;
  scoopMap: Record<string, string>;
}) {
  const [isRefreshing, startTransition] = useTransition();

  // feedSourceIds は Server Component から毎回新しい配列参照で渡されるため、
  // 内容ベースの文字列に変換して useEffect の依存配列を安定化する
  const sourceIdsKey = feedSourceIds.join(",");

  const items = useSyncExternalStore(
    subscribeFeedItems,
    () => getItemsSnapshot(feedSourceIds),
    () => getItemsSnapshot([]),
  );

  // 初回ロード: IDB キャッシュを即表示 + バックグラウンドで最新をフェッチ
  // キャッシュがあっても裏で更新する = ページを開けば勝手に流れてくる
  useEffect(() => {
    if (feedSourceIds.length === 0) return;

    let cancelled = false;

    async function init() {
      await pruneExpiredItems();
      // IDB キャッシュを読み込み（即表示用）
      await getItemsBySourceIds(feedSourceIds);

      if (cancelled) return;

      // バックグラウンドで最新をフェッチ（キャッシュの有無に関わらず）
      startTransition(async () => {
        const result = await refreshChannelById(channelId).catch(
          (): RefreshResult => ({ items: [], errors: {}, succeededSourceIds: [] }),
        );
        if (cancelled) return;
        setFeedErrors(channelId, result.errors, result.succeededSourceIds);
        if (result.items.length === 0) return;
        await saveAndNotify(result.items, feedSourceIds);
      });
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceIdsKey, channelId]);

  // 自動更新（30分間隔）
  useEffect(() => {
    if (feedSourceIds.length === 0) return;

    const id = setInterval(() => {
      startTransition(async () => {
        const result = await refreshChannelById(channelId).catch(
          (): RefreshResult => ({ items: [], errors: {}, succeededSourceIds: [] }),
        );
        setFeedErrors(channelId, result.errors, result.succeededSourceIds);
        if (result.items.length > 0) {
          await saveAndNotify(result.items, feedSourceIds);
        }
      });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceIdsKey, channelId]);

  // 期限切れを除外してマッピング
  const now = Date.now();
  const feedItems = items
    .filter((item) => !isExpired(item.publishedAt, item.fetchedAt, now))
    .map((item) => ({
      id: `${item.feedSourceId}-${item.url}`,
      title: item.title,
      url: item.url,
      thumbnail_url: item.thumbnailUrl,
      published_at: item.publishedAt,
      feed_source_id: item.feedSourceId,
      og_image: item.ogImage,
    }));

  const returnPath = `/channels/${channelId}`;

  const { selectedIndex, helpOpen, setHelpOpen } = useKeyboardNav({
    items: feedItems,
    channelId,
    feedSourceIds,
    scoopMap,
    sourceNameMap,
    channelName,
    returnPath,
  });

  if (isRefreshing && feedItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-secondary)]">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <FeedItemList
        items={feedItems}
        sourceNameMap={sourceNameMap}
        favoritedUrls={Object.keys(scoopMap)}
        channelName={channelName}
        returnPath={returnPath}
        selectedIndex={selectedIndex}
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
