"use client";

import { Pin } from "lucide-react";
import { FeedItemList, type FeedItemData } from "@/components/feed-item-list";
import { KeyboardHelp } from "@/components/keyboard-help";
import { useKeyboardNav } from "@/lib/use-keyboard-nav";

type ScoopData = {
  id: string;
  title: string;
  url: string;
  source_name: string | null;
  published_at: string | null;
  channel_name: string | null;
  og_image: string | null;
  thumbnail_url: string | null;
};

export function ScoopsFeedView({ scoops }: { scoops: ScoopData[] }) {
  // scoops → FeedItemData にマッピング
  const items: FeedItemData[] = scoops.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    thumbnail_url: s.thumbnail_url,
    published_at: s.published_at,
    feed_source_id: s.source_name ?? "", // ソース名をキーに使用
    og_image: s.og_image,
    og_description: null,
    content: null,
    favoriteId: s.id,
    channelName: s.channel_name ?? undefined,
  }));

  // 全アイテムが Scoop 済み → url → scoopId のマップ
  const scoopMap: Record<string, string> = {};
  for (const s of scoops) {
    scoopMap[s.url] = s.id;
  }

  // sourceNameMap: feed_source_id(= source_name) → 表示名
  const sourceNameMap: Record<string, string> = {};
  for (const s of scoops) {
    const key = s.source_name ?? "";
    sourceNameMap[key] = key;
  }

  const { selectedIndex, helpOpen, setHelpOpen } = useKeyboardNav({
    items,
    scoopMap,
    sourceNameMap,
    channelName: "",
    returnPath: "/scoops",
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-secondary)]">
        <div className="text-center">
          <p className="mb-2">Scoop した記事はまだありません</p>
          <p className="text-sm text-[var(--text-secondary)]">
            フィードの <Pin size={14} className="inline text-neon-pink" /> をクリックして流れから掬い上げましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FeedItemList
        items={items}
        sourceNameMap={sourceNameMap}
        favoritedUrls={Object.keys(scoopMap)}
        channelName=""
        returnPath="/scoops"
        selectedIndex={selectedIndex}
        noDecay
        showChannelLabel
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
