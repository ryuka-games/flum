import { FeedItem } from "@/components/feed-item";

type FeedItemData = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  feed_source_id: string;
  og_image: string | null;
  og_description: string | null;
  content: string | null;
  fetchedAt?: number;
};

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
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-[var(--text-muted)]">
        <div className="text-center">
          <p className="mb-2">フィードはまだありません</p>
          <p className="text-sm text-[var(--text-faded)]">
            RSS ソースを追加するとここにフィードが表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl divide-y divide-river-border/50 bg-[var(--glass-bg)] backdrop-blur-md">
      {items.map((item) => (
        <FeedItem
          key={item.id}
          title={item.title}
          url={item.url}
          sourceName={sourceNameMap[item.feed_source_id] ?? ""}
          publishedAt={item.published_at}
          fetchedAt={item.fetchedAt}
          channelName={channelName}
          returnPath={returnPath}
          isFavorited={favoritedUrls.includes(item.url)}
          ogImage={item.og_image ?? undefined}
          ogDescription={item.og_description ?? undefined}
          thumbnailUrl={item.thumbnail_url ?? undefined}
          content={item.content ?? undefined}
        />
      ))}
    </div>
  );
}
