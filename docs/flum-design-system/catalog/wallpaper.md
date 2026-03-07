# Wallpaper

> 川底。画面全体の背景レイヤー。ユーザー設定の壁紙か、デフォルトの River at Night。

## 見た目

- 配置: `fixed inset-0 z-0`（全画面背景）
- ポインターイベント: `pointer-events-none`

### ユーザー壁紙

- 画像: `bg-cover bg-center bg-no-repeat`（全画面カバー）
- オーバーレイ: `bg-[var(--glass-overlay)]`（`rgba(0,0,0,0.50)`）で暗くする

### River at Night（デフォルト）

CSS グラデーション + マスク + アニメーションで構成。SVG ゼロ。

## クラスバンドル

### 壁紙レイヤー（常時表示）

```html
<div class="pointer-events-none fixed inset-0 z-0">
  <!-- ユーザー壁紙の場合 -->
  <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
       style="background-image: url(...)">
  </div>
  <div class="absolute inset-0 bg-[var(--glass-overlay)]" />

  <!-- または River at Night -->
  <RiverNightDeco />
</div>
```

### River at Night の構成

```html
<div class="absolute inset-0 overflow-hidden">
  <!-- 星空（上半分） -->
  <div class="river-sky absolute inset-0">
    <div class="river-stars-far absolute inset-0" />
    <div class="river-stars-mid absolute inset-0" />
    <div class="river-stars-near absolute inset-0" />
  </div>

  <!-- 水面反射（下半分） -->
  <div class="river-reflection absolute inset-0">
    <div class="river-stars-far absolute inset-0" />
    <div class="river-stars-mid absolute inset-0" />
    <div class="river-stars-near absolute inset-0" />
  </div>

  <!-- 水平線 -->
  <div class="river-horizon" />

  <!-- 揺らめき -->
  <div class="river-shimmer river-shimmer-1" />
  <div class="river-shimmer river-shimmer-2" />
  <div class="river-shimmer river-shimmer-3" />
  <div class="river-shimmer river-shimmer-4" />

  <!-- 水流ライン -->
  <div class="river-flow river-flow-1" />
  <div class="river-flow river-flow-2" />
  <div class="river-flow river-flow-3" />

  <!-- 環境光 -->
  <div class="river-glow river-glow-pink" />
  <div class="river-glow river-glow-cyan" />
</div>
```

## バリアント

| バリアント | 条件 | 表示 |
|-----------|------|------|
| ユーザー壁紙 | IndexedDB に画像あり | 画像 + ダークオーバーレイ |
| River at Night | IndexedDB に画像なし | 星空 + 水面反射 + 揺らめき |

## 状態

| 状態 | 変化 |
|------|------|
| 壁紙あり | 画像表示 + `--glass-overlay` オーバーレイ |
| 壁紙なし | River at Night デコレーション |

### River at Night アニメーション

| 要素 | アニメーション | 周期 |
|------|-------------|------|
| 揺らめき（shimmer） | `shimmer-pulse`: scaleX + opacity 変化 | 4s |
| 水流ライン（flow） | `flow-drift`: translateX で水平移動 | 20-30s |
| 環境光（glow） | なし（静的） | — |

`@media (prefers-reduced-motion: reduce)` で shimmer/flow のアニメーション停止。

## インタラクションカラー

なし（インタラクティブ要素ではない）。

## レスポンシブ

モバイル/デスクトップ共通。`fixed inset-0` で常にビューポート全体をカバー。

## 壁紙ピッカー

壁紙の設定は [Action Button](action-button.md) のセカンダリバリアントで提供:

```html
<!-- 設定/変更 -->
<label class="rounded-xl border-2 border-river-border px-3 py-1.5
              text-xs text-[var(--text-secondary)]
              hover:border-int-accent hover:text-int-accent">
  <ImagePlus size={14} /> 設定
  <input type="file" accept="image/*" class="hidden" />
</label>

<!-- クリア -->
<button class="rounded-xl border-2 border-river-border px-3 py-1.5
               text-xs text-[var(--text-secondary)]
               hover:border-int-danger hover:text-int-danger">
  クリア
</button>
```

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/wallpaper-layer.tsx` | 背景レイヤー（WallpaperLayer + RiverNightDeco） |
| `src/components/wallpaper-picker.tsx` | 壁紙設定 UI |
| `src/components/app-shell.tsx` | レイアウトの最背面に配置 |

## 注意点

- `pointer-events-none` で背景へのクリックを透過。壁紙がインタラクションを妨げない
- `z-0` で最下層。他の全要素の背後
- ユーザー壁紙は IndexedDB に Base64 保存（Supabase には保存しない、v1）
- `--glass-overlay`（50% black）は壁紙が明るすぎる場合にテキスト可読性を確保
- River at Night の星のドットサイズ（11×13, 29×31, 67×71）は素数ベース。Moire 効果で規則的パターンが見えない
- `river-reflection` の `filter: blur(6px) + scaleX(3)` で星のドットが水面に映った横長の光筋になる
