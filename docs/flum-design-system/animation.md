# Animation — 浮遊アニメーションシステム

## 技術選定: Pure CSS

| 選択肢 | サイズ | 判定 | 理由 |
|--------|-------|:----:|------|
| CSS `@keyframes` | 0kb | **採用** | コンポジタースレッドで実行。JS 不要 |
| `motion/mini` | 2.3kb | 不要 | WAAPI ラッパー。今のスコープでは過剰 |
| Framer Motion | ~34kb | 不要 | Server Components と相性悪い。Next.js App Router で AnimatePresence が不安定 |
| GSAP | ~23kb | 不要 | ゲーム/インタラクティブ向け。ambient animation には過剰 |

**既存の CSS アニメーション基盤**（globals.css）を拡張する。

## 1. 浮遊キーフレーム（Ambient Float）

### 基本: 水面のボビング

水面に浮かぶ物体の動き: 上下 + 微回転。4点制御で非対称な自然な動きを実現。

```css
@keyframes float-water {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  30% {
    transform: translateY(calc(var(--float-y, -6px) * 0.6))
               rotate(calc(var(--float-rot, 0.4deg) * -0.5));
  }
  50% {
    transform: translateY(var(--float-y, -6px))
               rotate(var(--float-rot, 0.4deg));
  }
  70% {
    transform: translateY(calc(var(--float-y, -6px) * 0.7))
               rotate(calc(var(--float-rot, 0.4deg) * 0.3));
  }
}
```

### 非同期化（自然に見せるコツ）

複数の floating 要素が同期して動くと機械的に見える。
**素数ベースの duration + 負の delay** で位相をずらす:

```css
.float { animation: float-water var(--float-dur, 4s) ease-in-out infinite; }

.float:nth-child(5n+1) { --float-dur: 3.7s; animation-delay: -0.5s; }
.float:nth-child(5n+2) { --float-dur: 4.3s; animation-delay: -2.1s; }
.float:nth-child(5n+3) { --float-dur: 3.1s; animation-delay: -1.3s; }
.float:nth-child(5n+4) { --float-dur: 4.7s; animation-delay: -3.7s; }
.float:nth-child(5n+5) { --float-dur: 3.9s; animation-delay: -0.9s; }
```

負の `animation-delay` = ページ読み込み時に各要素がアニメーションの異なるフェーズから開始。

### 深度バリアント

「近い」ものほど大きく、ゆっくり揺れる:

```css
.float-near { --float-y: -8px; --float-rot: 0.5deg; } /* 前景: 大きな動き */
.float-mid  { --float-y: -5px; --float-rot: 0.3deg; } /* 中景 */
.float-far  { --float-y: -2px; --float-rot: 0.1deg; } /* 背景: 微細な動き */
```

## 2. イージング関数

### 「水っぽい」イージング

```css
/* 標準の ease-in-out は対称すぎる。以下がより水面的: */

/* ゆるやかなサイン波 — 連続的で滑らか */
--ease-gentle-sine: cubic-bezier(0.37, 0, 0.63, 1);

/* 浮力感 — わずかにオーバーシュートして沈む */
--ease-buoyant: cubic-bezier(0.22, 0.9, 0.36, 1.0);

/* 水面の揺らぎ — ゆっくり始まり、わずかに行き過ぎる */
--ease-water: cubic-bezier(0.45, 0.05, 0.35, 1.05);
```

### CSS `linear()` でスプリング物理

`linear()` は 40+ ポイントでカスタムイージングカーブを定義。
スプリングの「浮力 → オーバーシュート → 沈み込み → 安定」を表現できる。

**生成ツール**:
- [Linear Easing Generator](https://linear-easing-generator.netlify.app/)
- [CSS Spring Generator](https://www.kvin.me/css-springs)

ブラウザサポート: ~88%（2023年12月〜全主要ブラウザ）。

## 3. 入場/退場アニメーション

### 入場: 水面からの浮上（Surface Rise）

```css
@keyframes surface-rise {
  0%   { opacity: 0; transform: translateY(20px) scale(0.95); filter: blur(3px); }
  40%  { opacity: 1; transform: translateY(-4px) scale(1.02); filter: blur(0); }
  60%  { transform: translateY(2px) scale(0.99); }
  80%  { transform: translateY(-1px) scale(1.005); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
```

`blur(3px) → blur(0)` = 水中から水面に出る屈折感。

### 退場: 水面への沈降（Submerge）

```css
@keyframes submerge {
  0%   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateY(15px) scale(0.96); filter: blur(3px); }
}
```

### `@starting-style` による CSS-only 入場

`display: none` からのトランジションを JS なしで実現（ブラウザサポート ~86%）:

```css
.floating-panel {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.4s, transform 0.4s, display 0.4s;
  transition-behavior: allow-discrete;
}

@starting-style {
  .floating-panel {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

## 4. マイクロインタラクション

### ホバー: 浮遊の一時停止 + 発光

```css
.float:hover {
  animation-play-state: paused;       /* 浮遊を停止 */
  transform: translateY(-3px);         /* 少し浮き上がる */
  filter: brightness(1.08);            /* わずかに発光 */
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.15s ease-out;
}
```

### 押下: 沈み込み + 波紋

```css
.float:active {
  transform: translateY(1px) scale(0.97);
  transition: transform 0.08s ease-out;
}

/* CSS-only リップルリング */
.float::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 2px solid var(--accent-cyan);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
}

.float:active::after {
  opacity: 0.5;
  transform: scale(1.15);
  transition: none;
}
```

### アクティブ状態: ピンクグロー

Flum のインタラクションカラーと統一:
```css
.float[aria-current="true"] {
  box-shadow: 0 0 8px 2px rgba(255, 59, 154, 0.3);
}
```

## 5. パフォーマンス

### コンポジター専用プロパティ

レイアウト/ペイントを発生させず GPU で処理できるプロパティ:
- `transform` ✅
- `opacity` ✅
- `filter` ✅
- `clip-path` ✅

**絶対に避ける**: `top`, `left`, `width`, `height` のアニメーション。

### 5-10 個の floating 要素は安全

- デスクトップ: 問題なし。GPU は数百のコンポジターレイヤーを処理可能
- モバイル: 安全。懸念は 30-50+ レイヤーから
- 目標: コンポジティングフェーズ 4-5ms 以内（Chrome DevTools Performance で計測）

### `will-change` の注意

```css
/* ✅ animation が適用されている要素: ブラウザが自動でレイヤー昇格 */
.float { animation: float-water 4s ... infinite; }

/* ✅ hover トランジション用のプリプロモーション */
.float { will-change: transform; }

/* ❌ will-change は containing block を生成する → fixed 子孫に注意 */
```

## 6. Reduced Motion 対応

```css
@media (prefers-reduced-motion: reduce) {
  /* ambient アニメーションを全停止 */
  .float,
  .river-shimmer,
  .river-flow,
  .glitch-text,
  [data-freshness="fresh"],
  [data-card-enter] {
    animation: none !important;
  }

  /* ホバーの transform も無効化 */
  .float:hover {
    transform: none;
    transition-duration: 0.01s !important;
  }

  /* decay の filter/opacity はそのまま残す（色変化は motion ではない） */
}
```

### 何を残し、何を消すか

| エフェクト | Reduced Motion | 理由 |
|-----------|:---------:|------|
| 浮遊ボビング | 削除 | ambient, decorative |
| 入場スライドアップ | 即座フェードに置換 | opacity < 100ms で代替 |
| ホバーグロー | 残す | 静的、motion ではない |
| カラードレイン（decay） | 残す | 色変化、motion ではない |
| グリッチエフェクト | 削除 | 激しい motion |
| Fresh パルス | 削除 | パルスは motion |
| 押下リップル | 削除 | 拡大リングは motion |
