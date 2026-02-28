# Architecture — レイアウト・レスポンシブ・CSS 基盤

## CSS Grid 3カラム

```
┌──────────────────────────────────────────┐
│  左ガター  │   コンテンツ    │  右ガター  │
│  (レール)  │  (フィード/川)  │  (将来用)  │
│   1fr      │ minmax(0,640px) │   1fr      │
└──────────────────────────────────────────┘
```

```css
grid-template-columns: 1fr minmax(0, 640px) 1fr;
```

### なぜ Grid か

Flum の decay システムは CSS `filter` を使う。`filter` は containing block を生成し、`position: fixed` の基準がビューポートから親要素に変わる。

Grid ガター + `position: sticky` なら構造的にこの問題が発生しない。

## Containing Block の罠

以下が `none` 以外のとき、子孫の `fixed` の基準が変わる:

| プロパティ | 例 |
|-----------|-----|
| `transform` | ホバーアニメーション |
| `filter` | decay の grayscale/sepia |
| `backdrop-filter` | フロストガラス |
| `perspective` | 3D 演出 |
| `will-change` | 上記を指定した場合 |
| `contain` | layout, paint, strict, content |
| `container-type` | size, inline-size |

### `overflow` の罠

```css
overflow-x: hidden;  /* → overflow-y が暗黙的に auto になる */
```
- sticky の基準ブロックが変わる
- Windows でスクロールバー gutter（15px）が出る
- **代替**: `overflow-x: clip`（overflow-y を暗黙変更しない）

## z-index レイヤー

```
z-50   FlowLine（進捗バー）
z-40   Sticky ヘッダー
z-30   ドロップダウン / ポップオーバー
z-20   フィードカード内コンテンツ
z-10   フィードカードコンテナ
z-0    壁紙 / デフォルト背景
```

## レスポンシブ

### ブレークポイント

```
< 768px   モバイル: FAB + ボトムシート
≥ 768px   デスクトップ: チャンネルレール + Grid ガター配置
```

### デスクトップ: sticky レール

```css
.channel-rail {
  grid-column: 1;
  justify-self: end;
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  width: 64px;
}
```

### モバイル: FAB（右下、サムゾーン準拠）

```css
.channel-fab {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  right: 24px;
}
```

### Viewport Units

| 単位 | 用途 |
|------|------|
| `svh` | Floating 要素の配置（ジャンプしない） |
| `lvh` | モーダル、オーバーレイ |

### Safe Area

`viewport-fit=cover` が必須（なしでは `env(safe-area-inset-*)` が全て 0）。
FAB、アバター、メインコンテンツ下部パディングで使用。

## DOM 構造

```html
<body>
  <div class="wallpaper">        <!-- fixed, pointer-events: none -->
  <div class="app-root">         <!-- CSS Grid 3カラム -->
    <nav class="channel-rail">   <!-- 左ガター, sticky -->
    <main class="feed-content">  <!-- 中央 -->
    <div class="fab-area">       <!-- 右ガター -->
  </div>
  <!-- Popover 要素は top layer にレンダリング -->
</body>
```

- Floating 要素は `filter` を持つ要素の子孫にしない
- `<nav>` は `<main>` の前（DOM 順 = スクリーンリーダーの読み順）
