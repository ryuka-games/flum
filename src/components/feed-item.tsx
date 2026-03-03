"use client";

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { Pin } from "lucide-react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { toggleFavorite, removeFavorite } from "@/app/actions/favorite";
import { SharePopover } from "@/components/share-button";
import { getDecayStyle } from "@/lib/decay";
import { useClientNow } from "@/lib/client-now";
import { useIsHoverDevice } from "@/lib/use-hover-device";
import { useCardSwipe } from "@/lib/use-card-swipe";

/** ポップオーバーを出せるだけの右ガターがあるか（コンテンツ 640px + ポップオーバー ~300px） */
const POPOVER_MIN_WIDTH = "(min-width: 1024px)";
let cachedGutterMql: MediaQueryList | null = null;
function getGutterMql() {
  if (!cachedGutterMql) cachedGutterMql = window.matchMedia(POPOVER_MIN_WIDTH);
  return cachedGutterMql;
}
function subscribeMediaQuery(cb: () => void) {
  const mql = getGutterMql();
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getHasGutter() { return getGutterMql().matches; }

// ソース名からハッシュベースの色を生成（ネオンカラー）
const INITIAL_COLORS = [
  "bg-neon-pink", "bg-neon-purple", "bg-neon-cyan", "bg-emerald-500",
  "bg-neon-pink-light", "bg-indigo-500", "bg-teal-500", "bg-violet-500",
];

/** HTML タグを除去してプレーンテキストにする。<br>, <p>, </p> は改行に変換。 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length];
}

function PreviewText({ content, ogDescription }: { content?: string; ogDescription?: string }) {
  const raw = content || ogDescription;
  const text = raw ? stripHtml(raw) : null;

  return (
    <p className="whitespace-pre-line p-4 text-sm leading-relaxed text-[var(--text-secondary)] md:p-6">
      {text || "プレビューなし"}
    </p>
  );
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
  content,
  thumbnailUrl,
  noDecay,
  enterIndex,
  hideChannelLabel,
  isSelected,
  itemIndex,
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
  content?: string;
  thumbnailUrl?: string;
  noDecay?: boolean;
  enterIndex?: number;
  hideChannelLabel?: boolean;
  isSelected?: boolean;
  itemIndex?: number;
}) {
  const now = useClientNow();
  const imageUrl = ogImage ?? thumbnailUrl;
  const decay = now ? getDecayStyle(publishedAt, now, noDecay) : null;
  const isHover = useIsHoverDevice();
  const hasGutter = useSyncExternalStore(subscribeMediaQuery, getHasGutter, () => true);
  const popoverEnabled = isHover && hasGutter;

  // --- PC ホバーポップオーバー ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // j/k 選択連動: 選択されたら表示、解除されたら閉じる
  // スクロールアニメーション完了後に表示（位置ジャンプ防止）
  useEffect(() => {
    if (!popoverEnabled) return;
    if (!isSelected) {
      setPreviewOpen(false);
      return;
    }
    const id = setTimeout(() => setPreviewOpen(true), 350);
    return () => clearTimeout(id);
  }, [isSelected, popoverEnabled]);

  const { refs, floatingStyles, context } = useFloating({
    open: previewOpen,
    onOpenChange: setPreviewOpen,
    placement: "right-start",
    transform: false,
    middleware: [offset(16), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: 300, close: 150 },
    enabled: popoverEnabled,
  });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    dismiss,
  ]);

  // --- モバイルスワイプ ---
  const { handlers: swipeHandlers, flipped, setFlipped, dragOffset } = useCardSwipe();

  // ref マージ: cardRef（data 属性参照） + Floating UI reference
  const setCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;
      refs.setReference(node);
    },
    [refs],
  );

  // --- `p` キー: toggle-preview カスタムイベント ---
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function handleToggle() {
      if (popoverEnabled) {
        setPreviewOpen((prev) => !prev);
      } else {
        setFlipped((prev) => !prev);
      }
    }

    el.addEventListener("toggle-preview", handleToggle);
    return () => el.removeEventListener("toggle-preview", handleToggle);
  }, [popoverEnabled, setFlipped]);

  // スワイプ中のライブオフセット（表面のみ。裏面はフリップ後なので dragOffset は裏面方向）
  const slideX = flipped ? -100 : 0;
  const liveOffset = dragOffset;

  return (
    <div
      ref={setCardRef}
      className={`card-float group relative rounded-2xl bg-[var(--glass-bg)] backdrop-blur-md${isSelected ? " ring-1 ring-int-accent/60" : ""}`}
      data-decay={decay ? "true" : undefined}
      data-freshness={decay?.freshness ?? "fresh"}
      data-card-enter={enterIndex != null ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
      data-feed-item-index={itemIndex ?? undefined}
      style={
        {
          ...(decay && {
            "--decay-filter": decay.filter,
            "--decay-opacity": decay.opacity,
            "--decay-shadow": decay.shadowColor,
          }),
          ...(enterIndex != null && {
            "--enter-delay": `${enterIndex * 120}ms`,
          }),
        } as React.CSSProperties
      }
      {...getReferenceProps()}
      {...(!isHover ? swipeHandlers : {})}
    >
      {/* スライドトラック（overflow-hidden でクリップ） */}
      <div className="card-content overflow-hidden rounded-2xl">
        <div
          className="card-slide-track flex"
          style={{
            transform: `translateX(calc(${slideX}% + ${liveOffset}px))`,
            ...(liveOffset !== 0 ? { transition: "none" } : {}),
          }}
        >
          {/* 表面 */}
          <div className="relative w-full flex-shrink-0">
            {/* カード全体をクリッカブルにするリンク（表面内に配置して stacking context を共有） */}
            <a href={url} className="click-ripple absolute inset-0 z-10 rounded-2xl" tabIndex={-1} aria-label={title} />
            <div className={`pointer-events-none relative z-20 p-4 md:p-6 ${decay?.className ?? ""}`}>
              {imageUrl && (
                <img src={imageUrl} alt="" className="mb-4 w-full rounded-xl" loading="lazy" />
              )}

              <a
                href={url}
                className="line-clamp-2 block text-base font-medium leading-normal text-[var(--text-primary)]"
              >
                {title}
              </a>

              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
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
                  <span
                    className="pointer-events-auto"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <SharePopover title={title} url={url} />
                  </span>
                  {favoriteId ? (
                    <form
                      action={removeFavorite}
                      className="pointer-events-auto relative z-10"
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
                      className="pointer-events-auto relative z-10"
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

          {/* 裏面: 非表示時は max-h-0 で潰す。タップで記事を開く */}
          <a
            href={url}
            className={`w-full flex-shrink-0 ${flipped ? "" : "max-h-0 overflow-hidden"}`}
          >
            <PreviewText content={content} ogDescription={ogDescription} />
          </a>
        </div>
      </div>

      {/* PC ホバーポップオーバー */}
      {previewOpen && popoverEnabled && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="preview-pop z-50 max-h-[60vh] max-w-[280px] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[var(--glass-bg)] p-4 shadow-[2px_2px_0_var(--accent-cyan)] backdrop-blur-xl"
          >
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
              {stripHtml(content || ogDescription || "") || "プレビューなし"}
            </p>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
