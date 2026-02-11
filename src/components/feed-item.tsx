import { Star } from "lucide-react";
import { toggleFavorite, removeFavorite } from "@/app/actions/favorite";
import { ShareButtons } from "@/components/share-button";

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

// ソース名からハッシュベースの色を生成（Discord のデフォルトアバター風）
const INITIAL_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length];
}

/** 記事 URL からドメイン名を抽出 */
function extractDomain(articleUrl: string): string {
  try {
    return new URL(articleUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** HTML タグを除去 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function FeedItem({
  title,
  url,
  sourceName,
  publishedAt,
  channelName,
  returnPath,
  isFavorited,
  favoriteId,
  ogImage,
  ogDescription,
  thumbnailUrl,
  content,
}: {
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string | null;
  channelName?: string;
  returnPath?: string;
  isFavorited?: boolean;
  favoriteId?: string;
  ogImage?: string;
  ogDescription?: string;
  thumbnailUrl?: string;
  content?: string;
}) {
  const domain = extractDomain(url);
  const imageUrl = ogImage ?? thumbnailUrl;
  const description = ogDescription ?? (content ? stripHtml(content) : undefined);

  return (
    <div
      className="group relative hover:bg-zinc-800/40"
    >
      {/* 行全体をカバーするリンク */}
      <a
        href={url}
        className="absolute inset-0 z-0 border-l-2 border-blue-500 visited:border-transparent"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="px-4 py-4">
        {/* ソース情報（上） */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {sourceName && (
            <>
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white/90 ${getColorForName(sourceName)}`}
              >
                {sourceName.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{sourceName}</span>
            </>
          )}
          {domain && (
            <>
              <span>·</span>
              <span className="flex-shrink-0 text-zinc-600">{domain}</span>
            </>
          )}
          {publishedAt && (
            <>
              <span>·</span>
              <span className="flex-shrink-0">{timeAgo(publishedAt)}</span>
            </>
          )}
        </div>

        {/* タイトル + 説明 + 画像 */}
        <a
          href={url}
          className="mt-1 line-clamp-2 block text-base font-medium leading-normal text-white visited:text-zinc-300"
        >
          {title}
        </a>
        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="mt-3 w-full rounded-lg"
            loading="lazy"
          />
        )}

        {/* アクション行（下） */}
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          {channelName && (
            <span className="truncate"># {channelName}</span>
          )}
          <span className="ml-auto flex flex-shrink-0 items-center gap-1.5">
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              <ShareButtons title={title} url={url} />
            </span>
            {favoriteId ? (
              <form
                action={removeFavorite}
                className="relative z-10 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={favoriteId} />
                <button
                  type="submit"
                  className="cursor-pointer text-yellow-400 hover:text-zinc-500"
                  title="お気に入り解除"
                >
                  <Star size={14} fill="currentColor" />
                </button>
              </form>
            ) : (
              <form
                action={toggleFavorite}
                className={`relative z-10 ${isFavorited ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
              >
                <input type="hidden" name="url" value={url} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="source_name" value={sourceName} />
                <input type="hidden" name="channel_name" value={channelName ?? ""} />
                <input type="hidden" name="published_at" value={publishedAt ?? ""} />
                <input type="hidden" name="return_path" value={returnPath ?? "/"} />
                <input type="hidden" name="og_image" value={ogImage ?? ""} />
                <input type="hidden" name="og_description" value={ogDescription ?? ""} />
                <button
                  type="submit"
                  className={`cursor-pointer ${isFavorited ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"}`}
                  title={isFavorited ? "お気に入り解除" : "お気に入りに追加"}
                >
                  <Star size={14} fill={isFavorited ? "currentColor" : "none"} />
                </button>
              </form>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
