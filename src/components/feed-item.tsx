import { toggleFavorite } from "@/app/actions/favorite";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";

  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 30) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

export function FeedItem({
  title,
  url,
  sourceName,
  publishedAt,
  thumbnailUrl,
  channelName,
  returnPath,
  isFavorited,
}: {
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  channelName?: string;
  returnPath?: string;
  isFavorited?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded px-3 py-2 hover:bg-zinc-800/50">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 gap-3"
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-12 w-12 flex-shrink-0 rounded object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{title}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
            <span className="truncate">{sourceName}</span>
            {publishedAt && (
              <>
                <span>·</span>
                <span className="flex-shrink-0">{timeAgo(publishedAt)}</span>
              </>
            )}
          </div>
        </div>
      </a>
      <form action={toggleFavorite} className="flex-shrink-0">
        <input type="hidden" name="url" value={url} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="source_name" value={sourceName} />
        <input type="hidden" name="channel_name" value={channelName ?? ""} />
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl ?? ""} />
        <input type="hidden" name="published_at" value={publishedAt ?? ""} />
        <input type="hidden" name="return_path" value={returnPath ?? "/"} />
        <button
          type="submit"
          className={`text-lg ${isFavorited ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"}`}
          title={isFavorited ? "お気に入り解除" : "お気に入りに追加"}
        >
          {isFavorited ? "★" : "☆"}
        </button>
      </form>
    </div>
  );
}
