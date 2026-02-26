/**
 * 経年劣化システム v5 — カラードレイン
 *
 * 色 = エネルギー。古い記事は色を失い、冷たくなる。
 * ホバーで瞬時にフルカラー復活（カラーフラッシュ）。
 *
 * リファレンス:
 *   Splatoon — Splattercolor Screen: 彩度剥奪 = 弱体化
 *   Persona 5 — 彩度 + 色温度シフト = 感情状態の変化
 *   Hi-Fi Rush — パルス = 生きている感
 *   ドーナドーナ — UI は絶対に汚れない
 */

const DISPLAY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type FreshnessStage = "fresh" | "recent" | "aging" | "old" | "stale";

export type DecayStyle = {
  /** CSS filter 文字列 */
  filter: string;
  opacity: number;
  /** ホバーシャドウの色（鮮度で変わる: warm → cold） */
  shadowColor: string;
  /** CSS class（glitch 等） */
  className: string;
  /** data-freshness 属性値 */
  freshness: FreshnessStage;
};

/**
 * 鮮度ステージごとのカラードレイン設定
 *
 * シャドウ色の温度遷移（Persona 5 式）:
 *   pink(熱い) → purple(冷え始め) → cyan(冷たい) → 消失
 */
const DECAY_STAGES: Record<FreshnessStage, DecayStyle | null> = {
  fresh: null,
  recent: {
    filter: "saturate(0.85) brightness(0.97)",
    opacity: 0.95,
    shadowColor: "var(--accent-pink)",
    className: "",
    freshness: "recent",
  },
  aging: {
    filter: "saturate(0.45) brightness(0.92) sepia(0.15) hue-rotate(190deg)",
    opacity: 0.8,
    shadowColor: "var(--accent-purple)",
    className: "",
    freshness: "aging",
  },
  old: {
    filter: "saturate(0.15) brightness(0.85) sepia(0.25) hue-rotate(190deg)",
    opacity: 0.85,
    shadowColor: "var(--accent-cyan)",
    className: "",
    freshness: "old",
  },
  stale: {
    filter: "saturate(0.05) brightness(0.78) sepia(0.3) hue-rotate(200deg)",
    opacity: 0.75,
    shadowColor: "var(--old-color)",
    className: "glitch-text",
    freshness: "stale",
  },
};

/** 記事の経過時間から鮮度ステージを判定 */
export function getFreshnessStage(
  publishedAt: string | null,
  now: number,
): FreshnessStage {
  if (!publishedAt) return "stale";
  const ageMs = now - new Date(publishedAt).getTime();
  if (isNaN(ageMs)) return "fresh";
  const ageHours = ageMs / 3_600_000;
  if (ageHours < 1) return "fresh";
  if (ageHours < 6) return "recent";
  if (ageHours < 12) return "aging";
  if (ageHours < 18) return "old";
  return "stale";
}

/** publishedAt が24時間超なら true。null の場合は fetchedAt でフォールバック。 */
export function isExpired(
  publishedAt: string | null,
  fetchedAt: number,
  now: number,
): boolean {
  const ageMs = publishedAt
    ? now - new Date(publishedAt).getTime()
    : now - fetchedAt;
  if (isNaN(ageMs)) return false;
  return ageMs >= DISPLAY_MAX_AGE_MS;
}

/** 鮮度からスタイルを取得 */
export function getDecayStyle(
  publishedAt: string | null,
  now: number,
  noDecay?: boolean,
): DecayStyle | null {
  if (noDecay) return null;
  return DECAY_STAGES[getFreshnessStage(publishedAt, now)];
}
