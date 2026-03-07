# Components — クラス & エフェクト チートシート

> globals.css で定義されているユーティリティクラス・セレクタの一覧。

---

## Float System

川面に浮かぶ表現。ホバーでリフト + シアングローが滲む。

### `.float-water[-delay-N]` — 水面ボブ

上下に揺れる ambient アニメーション。delay バリアントで非同期化。

```css
animation: float-water 3.6–4.4s ease-in-out infinite;
```

- `-delay-1/2/3`: 周期と位相が異なる（自然な水面感）
- **reduced-motion**: `animation: none`

### `.float-shadow` — ボタン・アイコン用

静止時: 影 + 微シアングロー。ホバー: リフト(`--lift-sm`) + スケール(`--scale-sm`) + 強グロー。

### `.float-active` — アクティブ状態（選択中チャンネル等）

ホバーで neo 影 + リフト + グロー。静止時の影は呼び出し元で付与。

### `.float-shadow-lg` — コンテナ用

大きめの影。ホバーリフトなし。

### `.card-float` — フィードカード

影 + ホバーリフト(`--lift-md`, `--scale-md`) + シアン水面グロー。

**transition 統合管理**（CSS の transition は後勝ちのため一箇所で管理）:
- `.card-float`: translate, scale, box-shadow
- `.card-float[data-decay="true"]`: 上記 + filter, opacity（slow: 1.2s）
- `.card-float[data-decay="true"]:hover`: 上記 + filter, opacity（fast: 0.08s）

### `.click-ripple` — クリック波紋

`::before` でシアン光輪。`:active` で 1px 沈み込み + 波紋アニメーション。
- **reduced-motion**: `animation: none`

---

## Decay（経年劣化）

`src/lib/decay.ts` で計算 → インライン style で適用。globals.css はホバー復帰を担当。

### セレクタ

| セレクタ | 役割 |
|---------|------|
| `[data-decay="true"]` | opacity を CSS 変数 `--decay-opacity` で適用 |
| `[data-decay="true"]:hover/active` | `filter: none !important; opacity: 1 !important`（瞬時復帰） |
| `@media (hover: none)` | filter 無効、opacity は `max(値, 0.6)` で下限保証 |

### 鮮度ステージ（`src/lib/decay.ts` DECAY_STAGES）

| ステージ | 経過時間 | filter | opacity |
|---------|---------|--------|---------|
| fresh | < 1h | なし | 1.0 |
| recent | 1–6h | `saturate(0.85) brightness(0.97)` | 0.95 |
| aging | 6–12h | `saturate(0.45) brightness(0.92) sepia(0.15) hue-rotate(190deg)` | 0.8 |
| old | 12–24h | `saturate(0.15) brightness(0.85) sepia(0.25) hue-rotate(190deg)` | 0.65 |
| stale | 24h+ | `saturate(0.05) brightness(0.78) sepia(0.3) hue-rotate(200deg)` | 0.5 |

**非対称トランジション**: 色を失う = 1.2s（ゆっくり）、ホバー復帰 = 0.08s（瞬間）。

### データ属性

- `data-decay="true"` — CSS トランジション用セレクタ
- `data-freshness="fresh|recent|..."` — fresh パルス等のセレクタ
- `data-card-enter` — 入場アニメーション
- `--decay-shadow` — ホバーシャドウ色（インライン CSS 変数）

---

## Animations

### `card-pop` — フィードカード入場

```css
@keyframes card-pop {
  0%   { opacity: 0; transform: scale(0.92) translateY(8px); }
  50%  { opacity: 1; transform: scale(1.03) translateY(-2px); }
  100% { opacity: 1; transform: none; }
}
```
- duration: `0.35s`、easing: `--spring`
- `[data-card-enter]` で適用、`--enter-delay` でスタガー（120ms 刻み）
- **reduced-motion**: `animation: none !important`

### `fresh-pulse` — 新着パルス

```css
@keyframes fresh-pulse {
  50% { box-shadow: 0 0 8px 4px rgba(255, 59, 154, 0.3); }
}
```
- `[data-freshness="fresh"]` に適用、1.5s × 2回
- 入場ありの場合: card-pop 終了後に直列再生
- **reduced-motion**: `animation: none !important`

### `glitch` — stale テキストグリッチ

3.5s サイクル。25%/30% 付近でシアン+ピンクの text-shadow + translateX + skewX。
- `.glitch-text` クラスで適用
- **reduced-motion**: `animation: none !important`

### `tooltip-pop` — ツールチップ入場

```css
@keyframes tooltip-pop {
  0%   { opacity: 0; scale: 0.9; }
  50%  { opacity: 1; scale: 1.04; }
  100% { opacity: 1; scale: 1; }
}
```
- 200ms、`--spring` easing
- `@media (hover: none)`: `display: none`
- **reduced-motion**: `animation: none; opacity: 1`

---

## 背景デコ — River at Night（デフォルト背景）

壁紙未設定時に表示。CSS gradient + mask + animation。SVG ゼロ。

### 星空

| クラス | 役割 | ドットサイズ | グリッド | opacity |
|--------|------|-----------|---------|---------|
| `.river-stars-far` | 遠い星 | 0.5px | 11×13px | 0.04 |
| `.river-stars-mid` | 中距離 | 0.8px | 29×31px | 0.06 |
| `.river-stars-near` | 近い星 | 1.2px | 67×71px | 0.07 |

素数ベースの grid-size で Moiré 効果（規則的パターンが見えない）。

- `.river-sky` — 上半分マスク（星空を上に集中）
- `.river-reflection` — 水面反射（blur + scaleX(3) + scaleY(-1) で光が横に滲む）

### 揺らめき・水流

| クラス | 役割 |
|--------|------|
| `.river-shimmer` + `.river-shimmer-1~4` | 楕円パルス（ピンク/シアン/白/パープル）|
| `.river-flow` + `.river-flow-1~3` | 水平に漂う光の筋（20–30s 周期） |
| `.river-glow-pink/cyan` | 環境光（blur(60px) のカラーブロブ）|
| `.river-horizon` | 空と水面の境界（1px グラデーション）|

- **reduced-motion**: `.river-shimmer, .river-flow { animation: none }`
