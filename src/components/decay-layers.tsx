/** 経年劣化の視覚レイヤー — SVG filter 定義 + 背景 + オーバーレイ */

import type { DecayState } from "@/lib/decay";

/**
 * Layer 0-1.5: SVG filter 定義 + ネオン基板 + カード表面侵食 + 折り目/しわ
 * コンテンツの下に配置する
 */
export function DecayBackground({ state }: { state: DecayState }) {
  const { decay, seed, filterId, creaseFilterId, creaseLines, kasureId } = state;

  return (
    <>
      {/* SVG filter 定義（アイテムごとに固有の seed でパターンが変わる） */}
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          {/* 端の侵食フィルター（Layer 1 用） */}
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="turbulence"
              baseFrequency={decay.freq}
              numOctaves={4}
              seed={seed}
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale={decay.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {/* 折り目ワープフィルター（直線を有機的に歪ませる） */}
          {decay.creases && (
            <filter id={creaseFilterId} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves={2}
                seed={seed + 700}
              />
              <feDisplacementMap
                in="SourceGraphic"
                scale={decay.creases.warp}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {/* カスレフィルター（Layer 2 テキスト用 — インク剥がれ） */}
          {decay.kasure && (
            <filter id={kasureId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency={decay.kasure.baseFreq}
                numOctaves={4}
                seed={seed + 300}
                result="noise"
              />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="lumAlpha" />
              <feComponentTransfer in="lumAlpha" result="mask">
                <feFuncA type="linear" slope={decay.kasure.slope} intercept={decay.kasure.intercept} />
              </feComponentTransfer>
              <feComposite in="SourceGraphic" in2="mask" operator="in" />
            </filter>
          )}
        </defs>
      </svg>

      {/* Layer 0: ネオン基板 — 破れから覗く色 */}
      <div className="absolute inset-0" style={{ backgroundColor: decay.color }} />

      {/* Layer 1: カード表面 — displacement で端が有機的に侵食される */}
      <div
        className="absolute inset-0 bg-[var(--river-bg)]"
        style={{ filter: `url(#${filterId})` }}
      />

      {/* Layer 1.5: 折り目/しわ — CSS gradient の直線を SVG displacement で歪ませる */}
      {creaseLines.length > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: creaseLines
              .map(({ angle, pos }) =>
                `linear-gradient(${angle}deg, transparent ${pos - 0.3}%, ${decay.color} ${pos}%, transparent ${pos + 0.3}%)`
              )
              .join(", "),
            opacity: decay.creases!.opacity,
            filter: `url(#${creaseFilterId})`,
          }}
        />
      )}
    </>
  );
}

/**
 * Layer 3: スクリーントーン — 漫画の影ドットパターン
 * コンテンツの上に配置する（pointer-events: none）
 */
export function DecayOverlay({ state }: { state: DecayState }) {
  const { decay } = state;
  if (!decay.halftone) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.7) 0.8px, transparent 0.8px), " +
          "radial-gradient(circle, rgba(0,0,0,0.7) 0.8px, transparent 0.8px)",
        backgroundSize: "5px 5px",
        backgroundPosition: "0 0, 2.5px 2.5px",
        opacity: decay.halftone,
      }}
    />
  );
}
