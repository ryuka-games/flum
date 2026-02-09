"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeedItem } from "@/components/feed-item";

type FeedItemData = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  feed_source_id: string;
};

export function FeedItemList({
  initialItems,
  feedSourceIds,
  sourceNameMap,
}: {
  initialItems: FeedItemData[];
  feedSourceIds: string[];
  sourceNameMap: Record<string, string>;
}) {
  const [items, setItems] = useState(initialItems);
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);

  // React 推奨: レンダリング中に prop 変更を検知して state を同期
  // useEffect ではなくこのパターンで余分な再レンダリングを回避
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  useEffect(() => {
    if (feedSourceIds.length === 0) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`feed-items:${feedSourceIds.join(",")}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "feed_items",
            filter: `feed_source_id=in.(${feedSourceIds.join(",")})`,
          },
          (payload) => {
            const newItem = payload.new as FeedItemData;
            setItems((prev) => {
              if (prev.some((item) => item.id === newItem.id)) {
                return prev;
              }
              return [newItem, ...prev];
            });
          },
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [feedSourceIds]);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-zinc-600">
        <div className="text-center">
          <p className="mb-2">フィードはまだありません</p>
          <p className="text-sm text-zinc-700">
            RSS ソースを追加するとここにフィードが表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {items.map((item) => (
        <FeedItem
          key={item.id}
          title={item.title}
          url={item.url}
          sourceName={sourceNameMap[item.feed_source_id] ?? ""}
          publishedAt={item.published_at}
          thumbnailUrl={item.thumbnail_url}
        />
      ))}
    </div>
  );
}
