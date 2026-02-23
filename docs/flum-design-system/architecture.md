# Architecture — レイアウトと CSS 基盤

## レイアウト: CSS Grid 3カラム

ヘッダーもサイドバーもないため、レイアウトは **CSS Grid の3カラム構成** で実現する。

```
┌─────────────────────────────────────────────┐
│  左ガター   │    コンテンツ     │   右ガター   │
│  (レール)   │   (フィード/川)   │  (FAB/アバ)  │
│    1fr      │  minmax(0, 640px) │    1fr       │
└─────────────────────────────────────────────┘
```

```css
.app-root {
  display: grid;
  grid-template-columns: 1fr minmax(0, 640px) 1fr;
  min-height: 100svh;
}

.channel-rail { grid-column: 1; }
.feed-content { grid-column: 2; }
.fab-area     { grid-column: 3; }
```

### なぜ Grid か（`position: fixed` を避ける理由）

Flum の decay システムは CSS `filter`（grayscale, sepia, hue-rotate）を使う。
CSS 仕様で `filter` は `position: fixed` の containing block を生成する。

- `position: fixed` のレール → decay フィルタの子孫に入ると壊れる
- `position: sticky` in Grid → containing block 問題が構造的に発生しない

レールには `position: sticky` を使い、Grid のガターに配置する。

## Containing Block ルール（完全リスト）

以下のプロパティが `none` 以外の値を持つと、子孫の `position: fixed` の基準がビューポートからその要素に変わる:

| プロパティ | 危険な値 |
|-----------|---------|
| `transform` | `none` 以外すべて |
| `perspective` | `none` 以外すべて |
| `filter` | `none` 以外すべて |
| `backdrop-filter` | `none` 以外すべて |
| `will-change` | 上記プロパティを指定した場合 |
| `contain` | `layout`, `paint`, `strict`, `content` |
| `container-type` | `size`, `inline-size` |
| `content-visibility` | `auto` |

### `overflow` の罠

```css
overflow-x: hidden;  /* → overflow-y が暗黙的に auto になる */
```

これにより:
1. 要素が新しいスクロールコンテナになる
2. `sticky` の基準ブロックが変わる
3. Windows ではクラシックスクロールバー（15px）の gutter が生成される

**代替**: `overflow-x: clip` は `overflow-y` を暗黙変更しない。

## z-index トークンシステム

```css
:root {
  --z-wallpaper: 0;        /* 壁紙レイヤー */
  --z-content: 10;         /* フィードコンテンツ */
  --z-rail: 20;            /* チャンネルレール */
  --z-fab: 30;             /* FAB */
  --z-dropdown: 40;        /* ドロップダウン/ポップオーバー */
  --z-drawer-backdrop: 50; /* ドロワー背景 */
  --z-drawer: 55;          /* ドロワー本体 */
  --z-modal-backdrop: 60;  /* モーダル背景 */
  --z-modal: 70;           /* モーダル本体 */
  --z-toast: 90;           /* トースト通知 */
}
```

Tailwind v4 では `@theme inline` で統合:

```css
@theme inline {
  --z-index-wallpaper: 0;
  --z-index-content: 10;
  /* ... */
}
```

## Popover API（JS ゼロのドロップダウン）

**Baseline**: 2025年1月〜。Chrome 114+, Firefox 125+, Safari 17+。

```html
<button popovertarget="settings-menu">⚙</button>

<div id="settings-menu" popover="auto" class="...">
  <!-- メニュー内容 -->
</div>
```

### メリット

1. **Top Layer レンダリング**: 全ての stacking context の上に描画。z-index 不要
2. **Light Dismiss 組み込み**: 外側クリック、Escape で自動的に閉じる
3. **JS ゼロ**: `useState`, `useEffect`, クリック外判定が全部不要
4. **Containing Block 免疫**: top layer は `backdrop-filter` 等の影響を受けない

### 3つの popover タイプ

| タイプ | Light Dismiss | 排他制御 | 用途 |
|--------|:---:|:---:|------|
| `popover="auto"` | Yes | Yes（他の auto を閉じる） | メニュー、ドロップダウン |
| `popover="hint"` | Yes | hint 同士のみ | ツールチップ |
| `popover="manual"` | No | No | トースト、永続 UI |

## CSS Anchor Positioning

**Baseline**: 2026年1月〜。Chrome 125+, Firefox 149+, Safari 26+。

```css
.trigger-button {
  anchor-name: --my-menu;
}

.floating-menu {
  position: fixed;
  position-anchor: --my-menu;
  top: anchor(bottom);
  right: anchor(right);
  position-try-fallbacks: flip-block, flip-inline;
}
```

### Popover API と組み合わせ

```html
<button popovertarget="feed-menu" style="anchor-name: --feed-btn">+</button>

<div id="feed-menu" popover="auto" style="
  position-anchor: --feed-btn;
  top: anchor(bottom);
  left: anchor(left);
  position-try-fallbacks: flip-block;
">
  <ul>
    <li>Add Feed</li>
    <li>Import OPML</li>
  </ul>
</div>
```

JS のポジショニングライブラリ（Floating UI 等）が不要になる。

## React Portal

Popover API で解決できないケース（古いブラウザ対応、複雑なインタラクション）には React Portal を使う:

```tsx
"use client";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
```

**注意**: `createPortal` はクライアント専用。`document.body` は SSR 時に存在しないため、`mounted` ガードが必須。

## DOM 構造（推奨）

```html
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>

  <!-- 壁紙（fixed, pointer-events: none） -->
  <div class="wallpaper" style="position: fixed; inset: 0; z-index: var(--z-wallpaper);">

  <!-- Grid レイアウト -->
  <div class="app-root">
    <!-- 左ガター: チャンネルレール -->
    <nav aria-label="Channel navigation" class="channel-rail">

    <!-- 中央: フィードコンテンツ -->
    <main id="main-content" class="feed-content">

    <!-- 右ガター: FAB 等 -->
    <div class="fab-area">
  </div>

  <!-- Popover 要素（top layer にレンダリングされるため DOM 位置は重要ではない） -->
</body>
```

### 原則

- Floating 要素（壁紙、FAB）は `filter` を持つ要素の**子孫にしない**
- `<nav>` は `<main>` の**前**に配置（DOM 順 = スクリーンリーダーの読み順）
- FAB は `<main>` の**後**に配置（コンテンツを先に読む）
- `pointer-events: none` + `pointer-events: auto` で非インタラクティブ領域の透過
