"use client";

import { useSyncExternalStore } from "react";
import { Pin } from "lucide-react";
import { toggleFavorite, removeFavorite } from "@/app/actions/favorite";
import { ShareButtons } from "@/components/share-button";
import { getDecayStyle } from "@/lib/decay";

/** useSyncExternalStore 用: 購読不要（静的スナップショット） */
const noopSubscribe = () => () => {};

/**
 * クライアント専用の現在時刻。
 * getSnapshot はキャッシュ必須（毎回異なる値を返すと無限ループ）。
 * モジュールロード時に一度だけ Date.now() を計算して以降は同じ値を返す。
 *
 * getServerSnapshot = 0 → SSR/ハイドレーション時はdecay/timeAgoなし（安定HTML）
 * getSnapshot = cachedNow → ハイドレーション後に同期再レンダリング
 */
let cachedNow = 0;
function getClientNow(): number {
  if (!cachedNow) cachedNow = Date.now();
  return cachedNow;
}

function useClientNow(): number {
  return useSyncExternalStore(noopSubscribe, getClientNow, () => 0);
}

function timeAgo(dateStr: string, now: number): string {
  if (!now) return "";
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

function extractDomain(articleUrl: string): string {
  try {
    return new URL(articleUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&apos;": "'", "&nbsp;": " ",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, (m) => HTML_ENTITIES[m] ?? m);
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}

export function FeedItem({
  title,
  url,
  sourceName,
  publishedAt,
  fetchedAt,
  channelName,
  returnPath,
  isFavorited,
  favoriteId,
  ogImage,
  ogDescription,
  thumbnailUrl,
  content,
  noDecay,
  enterIndex,
  hideChannelLabel,
}: {
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string | null;
  fetchedAt?: number;
  channelName?: string;
  returnPath?: string;
  isFavorited?: boolean;
  favoriteId?: string;
  ogImage?: string;
  ogDescription?: string;
  thumbnailUrl?: string;
  content?: string;
  noDecay?: boolean;
  enterIndex?: number;
  hideChannelLabel?: boolean;
}) {
  const now = useClientNow();
  const domain = extractDomain(url);
  const imageUrl = ogImage ?? thumbnailUrl;
  const description = ogDescription ?? (content ? stripHtml(content) : undefined);

  const decay = now ? getDecayStyle(publishedAt, now, noDecay) : null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl hover:shadow-[3px_3px_0_var(--decay-shadow,var(--accent-pink))]"
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
      <div className={`pointer-events-none relative z-20 px-4 py-4 group-hover:bg-river-surface/60 ${decay?.className ?? ""}`}>
        {/* ソース情報（上） */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
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
              <span className="flex-shrink-0 text-[var(--text-secondary)]">{domain}</span>
            </>
          )}
          {publishedAt ? (
            <>
              <span>·</span>
              <span className="flex-shrink-0">{timeAgo(publishedAt, now)}</span>
            </>
          ) : fetchedAt ? (
            <>
              <span>·</span>
              <span className="flex-shrink-0 italic text-[var(--text-secondary)]" title="取得日時（公開日不明）">
                {timeAgo(new Date(fetchedAt).toISOString(), now)}
              </span>
            </>
          ) : null}
        </div>

        {/* タイトル */}
        <a
          href={url}
          className="mt-1 line-clamp-2 block text-base font-medium leading-normal text-[var(--text-primary)]"
        >
          {title}
        </a>

        {/* 概要文 */}
        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        )}

        {imageUrl && (
          <img src={imageUrl} alt="" className="mt-3 max-h-64 w-full rounded-xl object-contain" loading="lazy" />
        )}

        {/* アクション行（下） */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          {channelName && !hideChannelLabel && <span className="truncate"># {channelName}</span>}
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
                <input type="hidden" name="og_description" value={ogDescription ?? ""} />
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
