/** 経年劣化システム — 鮮度判定・設定・計算ロジック */

export type FreshnessStage = "fresh" | "recent" | "aging" | "old" | "stale";

export type DecayConfig = {
  scale: number;
  freq: string;
  color: string;
  creases?: { count: number; opacity: number; warp: number };
  kasure?: { baseFreq: string; slope: number; intercept: number };
  glitch?: "subtle" | "strong";
  halftone?: number;
};

/**
 * 経年劣化の設定
 *  scale: 端の侵食の強さ（displacement）
 *  freq: 侵食ノイズの細かさ
 *  color: 破れ・ひび割れから覗くネオン色
 *  creases: 折り目/しわ線（CSS linear-gradient + SVG displacement）
 *  kasure: テキストのインク剥がれ（ソース情報 + タイトル + 概要文に適用）
 *  glitch: RGB スプリット + 揺れアニメーション
 *  halftone: ドットトーン（最上位オーバーレイ）
 */
export const DECAY_CONFIG: Record<FreshnessStage, DecayConfig | null> = {
  fresh: null,
  recent: { scale: 6, freq: "0.035", color: "var(--accent-pink)" },
  aging: {
    scale: 10, freq: "0.04", color: "var(--accent-pink)",
    creases: { count: 2, opacity: 0.15, warp: 15 },
    kasure: { baseFreq: "1.5", slope: 3, intercept: -0.8 },
    halftone: 0.15,
  },
  old: {
    scale: 14, freq: "0.045", color: "var(--accent-pink)",
    creases: { count: 3, opacity: 0.2, warp: 25 },
    kasure: { baseFreq: "1.2", slope: 3.5, intercept: -0.6 },
    glitch: "subtle",
    halftone: 0.25,
  },
  stale: {
    scale: 20, freq: "0.05", color: "var(--accent-pink)",
    creases: { count: 5, opacity: 0.3, warp: 35 },
    kasure: { baseFreq: "1.0", slope: 4, intercept: -0.4 },
    glitch: "strong",
    halftone: 0.35,
  },
};

/** 記事の経過時間から鮮度ステージを判定 */
export function getFreshnessStage(publishedAt: string | null, now: number): FreshnessStage {
  if (!publishedAt) return "stale";
  const ageMs = now - new Date(publishedAt).getTime();
  if (isNaN(ageMs)) return "fresh";
  const ageHours = ageMs / 3_600_000;
  if (ageHours < 1) return "fresh";
  if (ageHours < 6) return "recent";
  if (ageHours < 12) return "aging";
  if (ageHours < 24) return "old";
  return "stale";
}

/** 文字列から決定論的ハッシュを生成（SVG filter の seed に使用） */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export type CreaseLine = { angle: number; pos: number };

/** 折り目線の角度・位置をハッシュから決定論的に生成 */
export function generateCreaseLines(hash: number, count: number): CreaseLine[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: ((hash >>> (i * 7)) & 0xff) % 160 + 10,    // 10-170° (水平すぎない)
    pos: 20 + (((hash >>> (i * 5 + 3)) & 0xff) % 60), // 20-80% の位置
  }));
}

/** Decay の計算結果 */
export type DecayState = {
  decay: DecayConfig;
  seed: number;
  filterId: string;
  creaseFilterId: string;
  creaseLines: CreaseLine[];
  kasureId: string;
  glitchClass: string;
  kasureStyle: { filter: string } | undefined;
};

/** URL・鮮度から全 decay パラメータを計算 */
export function computeDecay(
  url: string,
  publishedAt: string | null,
  now: number,
  noDecay?: boolean,
): DecayState | null {
  const stage = noDecay ? "fresh" : getFreshnessStage(publishedAt, now);
  const decay = DECAY_CONFIG[stage];
  if (!decay) return null;

  const hash = hashCode(url);
  const seed = hash % 1000;
  const filterId = `decay-${hash}`;
  const creaseFilterId = decay.creases ? `crease-${hash}` : "";
  const creaseLines = decay.creases ? generateCreaseLines(hash, decay.creases.count) : [];
  const kasureId = decay.kasure ? `kasure-${hash}` : "";
  const glitchClass =
    decay.glitch === "strong" ? "glitch-text-strong" :
    decay.glitch === "subtle" ? "glitch-text" : "";
  const kasureStyle = kasureId ? { filter: `url(#${kasureId})` } : undefined;

  return { decay, seed, filterId, creaseFilterId, creaseLines, kasureId, glitchClass, kasureStyle };
}
