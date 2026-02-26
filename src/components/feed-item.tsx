"use client";

import { Pin } from "lucide-react";
import { toggleFavorite, removeFavorite } from "@/app/actions/favorite";
import { ShareButtons } from "@/components/share-button";
import { getDecayStyle } from "@/lib/decay";
import { useClientNow } from "@/lib/client-now";

// ソース名からハッシュベースの色を生成（ネオンカラー）
const INITIAL_COLORS = [
  "bg-neon-pink", "bg-neon-purple", "bg-neon-cyan", "bg-emerald-500",
  "bg-neon-pink-light", "bg-indigo-500", "bg-teal-500", "bg-violet-500",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length];
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
  thumbnailUrl,
  noDecay,
  enterIndex,
  hideChannelLabel,
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
  thumbnailUrl?: string;
  noDecay?: boolean;
  enterIndex?: number;
  hideChannelLabel?: boolean;
}) {
  const now = useClientNow();
  const imageUrl = ogImage ?? thumbnailUrl;

  const decay = now ? getDecayStyle(publishedAt, now, noDecay) : null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-[var(--glass-bg)] backdrop-blur-md hover:bg-river-surface/60 hover:shadow-[3px_3px_0_var(--decay-shadow,var(--accent-pink))]"
      data-decay={decay ? "true" : undefined}
      data-freshness={decay?.freshness ?? "fresh"}
      data-card-enter={enterIndex != null ? "" : undefined}
      style={
        {
          ...(decay && {
            filter: decay.filter,
            "--decay-opacity": decay.opacity,
            "--decay-shadow": decay.shadowColor,
          }),
          ...(enterIndex != null && {
            "--enter-delay": `${enterIndex * 120}ms`,
          }),
        } as React.CSSProperties
      }
    >
      {/* カード全体をクリッカブルにするリンク */}
      <a href={url} className="absolute inset-0 z-10" aria-hidden="true" tabIndex={-1} />

      {/* コンテンツ */}
      <div className={`pointer-events-none relative z-20 px-4 py-4 ${decay?.className ?? ""}`}>
        {/* タイトル（最上段） */}
        <a
          href={url}
          className="line-clamp-2 block text-base font-medium leading-normal text-[var(--text-primary)]"
        >
          {title}
        </a>

        {imageUrl && (
          <img src={imageUrl} alt="" className="mt-3 max-h-40 w-full rounded-xl object-contain" loading="lazy" />
        )}

        {/* フッター: ソース情報 + アクション */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          {sourceName && (
            <>
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white/90 ${getColorForName(sourceName)}`}
              >
                {sourceName.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{sourceName}</span>
            </>
          )}
          {channelName && !hideChannelLabel && (
            <>
              {sourceName && <span>·</span>}
              <span className="truncate"># {channelName}</span>
            </>
          )}
          <span className="ml-auto flex flex-shrink-0 items-center gap-1.5">
            <span className="pointer-events-auto opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <ShareButtons title={title} url={url} />
            </span>
            {favoriteId ? (
              <form
                action={removeFavorite}
                className="pointer-events-auto relative z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={favoriteId} />
                <button
                  type="submit"
                  className="cursor-pointer text-neon-pink hover:text-[var(--text-muted)]"
                  aria-label="Scoop 解除"
                >
                  <Pin size={14} fill="currentColor" />
                </button>
              </form>
            ) : (
              <form
                action={toggleFavorite}
                className={`pointer-events-auto relative z-10 ${isFavorited ? "" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"} transition-opacity`}
              >
                <input type="hidden" name="url" value={url} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="source_name" value={sourceName} />
                <input type="hidden" name="channel_name" value={channelName ?? ""} />
                <input type="hidden" name="published_at" value={publishedAt ?? ""} />
                <input type="hidden" name="return_path" value={returnPath ?? "/"} />
                <input type="hidden" name="og_image" value={ogImage ?? ""} />
                <button
                  type="submit"
                  className={`cursor-pointer ${isFavorited ? "text-neon-pink" : "text-[var(--text-muted)] hover:text-neon-pink"}`}
                  aria-label={isFavorited ? "Scoop 解除" : "Scoop"}
                >
                  <Pin size={14} fill={isFavorited ? "currentColor" : "none"} />
                </button>
              </form>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
