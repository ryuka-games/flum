# Accessibility — Floating UI のアクセシビリティ

## 前提

Floating UI でもアクセシビリティ要件は変わらない。WCAG 2.2 はナビゲーションの**配置**ではなく、**発見可能性・操作可能性・予測可能性**を要求する。

## 1. WCAG 2.2 の関連基準

| 基準 | レベル | Floating UI での意味 |
|------|:------:|---------------------|
| 2.4.1 Bypass Blocks | A | `<main>` ランドマークで OK。skip link は依然推奨 |
| 2.4.3 Focus Order | A | DOM 順 = フォーカス順。CSS position は影響しない |
| **2.4.11 Focus Not Obscured** | **AA** | floating 要素がフォーカスされた要素を完全に隠してはならない |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | 部分的にも隠してはならない |
| **2.5.8 Target Size Minimum** | **AA** | 最小 24x24px。推奨 48x48px |

## 2. ARIA ランドマーク

CSS `position: fixed/sticky` はランドマークの機能に影響しない。

```html
<!-- 複数の nav には aria-label で区別 -->
<nav aria-label="Channel navigation" class="channel-rail">
  <!-- チャンネル一覧 -->
</nav>

<main id="main-content">
  <!-- フィードコンテンツ -->
</main>

<nav aria-label="Actions" class="fab-container">
  <!-- FAB -->
</nav>
```

スクリーンリーダーのランドマーク一覧（NVDA: D キー）で floating 要素も正しく表示される。

## 3. DOM 順序

**最重要原則**: スクリーンリーダーとキーボードは **DOM 順** でコンテンツに到達する。CSS の視覚的位置は無関係。

### 推奨 DOM 順序

```html
<body>
  <!-- 1. Skip link（最初のフォーカス可能要素） -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- 2. チャンネルナビ（main の前 → 先に発見される） -->
  <nav aria-label="Channel navigation">

  <!-- 3. メインコンテンツ -->
  <main id="main-content">

  <!-- 4. FAB（コンテンツの後 → 最後に到達） -->
  <div class="fab-container">
</body>
```

### Skip Link（ヘッダーなしでも必要）

```html
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
          focus:bg-zinc-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
  Skip to main content
</a>
```

Tailwind の `sr-only` で視覚的に隠し、フォーカス時のみ表示。

## 4. キーボードパターン

### Disclosure パターン（チャンネルレール、FAB メニュー）

ナビゲーション要素には **Menu パターンではなく Disclosure パターン** を使う（WAI-ARIA APG の明確な推奨）。

```html
<button
  aria-expanded="false"
  aria-controls="channel-nav"
  aria-label="Toggle channel navigation"
>
  Ch
</button>

<nav id="channel-nav" aria-label="Channels" hidden>
  <ul>
    <li><a href="/channels/1" aria-current="page">Tech News</a></li>
    <li><a href="/channels/2">Gaming</a></li>
  </ul>
</nav>
```

**キーボード操作**:
- `Enter` / `Space`: パネル開閉
- `Escape`: パネルを閉じ、トリガーにフォーカスを戻す
- `Tab`: パネル内の要素を順にフォーカス

### Menu パターン（アクションリストのみ）

`role="menu"` は**アクションのリスト**にのみ使う（ナビゲーションリンクには使わない）:

```html
<button
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="action-menu"
  aria-label="Feed actions"
>
  +
</button>

<div id="action-menu" role="menu" aria-label="Feed actions" hidden>
  <button role="menuitem">Add RSS feed</button>
  <button role="menuitem">Import OPML</button>
</div>
```

追加のキーボード操作:
- `ArrowDown` / `ArrowUp`: メニュー項目間を移動
- `Home` / `End`: 最初/最後の項目にジャンプ

## 5. フォーカス管理

### Disclosure パネル

- フォーカストラップ**しない**（ページの一部であり、モーダルではない）
- パネルが開いたら最初のインタラクティブ要素にフォーカスを移動
- `Escape` でパネルを閉じ、トリガーにフォーカスを戻す

### モーダル/ダイアログ

ネイティブ `<dialog>` + `.showModal()` を使う:

```html
<dialog id="add-feed-dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Add Feed Source</h2>
  <form method="dialog">
    <input type="url" aria-label="Feed URL" />
    <button type="submit">Add</button>
    <button type="button" onclick="this.closest('dialog').close()">Cancel</button>
  </form>
</dialog>
```

`.showModal()` が自動的に:
- フォーカスをダイアログ内にトラップ
- 背景に `inert` を適用（スクリーンリーダーからも隠す）
- `Escape` で閉じる

### `inert` 属性

`<dialog>` 以外のオーバーレイでは手動で `inert` を適用:

```html
<main id="main-content" inert>
  <!-- オーバーレイの背後 → 操作もスクリーンリーダーも無効 -->
</main>
```

## 6. スクリーンリーダー

### ルート遷移の通知

Next.js はクライアント遷移時にルートアナウンサーを内蔵。`document.title` → `<h1>` → URL の順に読み上げる。

チャンネルページに意味のある `<title>` を設定:
```tsx
export const metadata = { title: `# ${channel.name} — Flum` };
```

### 動的な状態変化の通知

```html
<div aria-live="polite" aria-atomic="true" class="sr-only" id="route-announcer">
  <!-- チャンネル切替時に動的更新 -->
</div>
```

```typescript
announcer.textContent = `${channelName} チャンネルに移動しました`;
```

### アイコンボタン

```html
<!-- ✅ アイコン + aria-label -->
<button aria-label="Add feed source" class="fab">
  <svg aria-hidden="true"><!-- + icon --></svg>
</button>

<!-- ❌ aria-label なし -->
<button class="fab">
  <svg><!-- + icon --></svg>
</button>
```

## 7. タッチターゲット

| 基準 | 最小サイズ |
|------|-----------|
| WCAG 2.5.8 (AA) | 24x24px |
| WCAG 2.5.5 (AAA) | 44x44px |
| Material Design / Apple HIG | 48x48px |

**Flum の FAB は 48px 以上** を採用（プライマリインタラクションポイントのため）。

```css
.fab {
  min-width: 48px;
  min-height: 48px;
}
```

### 隣接ターゲット間のスペーシング

WCAG 2.5.8 は周囲の空白をターゲットサイズに含めることを許可。
隣接するインタラクティブ要素間は最低 8px の間隔を確保。

### `scroll-padding-bottom`

Floating 要素の背後にフォーカスが隠れるのを防ぐ:

```css
main {
  scroll-padding-bottom: 104px;  /* FAB 高さ + マージン + 安全余白 */
  padding-bottom: 104px;
}
```

## 8. チェックリスト

### HTML 構造
- [ ] Skip link が最初のフォーカス可能要素
- [ ] `<nav>` が `<main>` の前に配置
- [ ] FAB が `<main>` の後に配置
- [ ] 全 `<nav>` にユニークな `aria-label`
- [ ] アクティブチャンネルに `aria-current="page"`

### Floating ナビ（Disclosure パターン）
- [ ] トグルボタン: `aria-expanded`, `aria-controls`
- [ ] パネル: `hidden` 属性
- [ ] `Escape` でパネル閉じ + フォーカス戻し

### FAB / メニュー
- [ ] 最小 48x48px タッチターゲット
- [ ] `aria-label` で動作を説明
- [ ] メニュー: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
- [ ] キーボード: Enter/Space トグル、Arrow 移動、Escape 閉じ

### フォーカス管理
- [ ] `scroll-padding-bottom` で floating 要素の背後のフォーカスを回避
- [ ] モーダルは `<dialog>` + `.showModal()`
- [ ] メニュー/ダイアログ閉じ時にトリガーにフォーカスを戻す

### スクリーンリーダー
- [ ] ルート遷移で `<title>` または `<h1>` が更新される
- [ ] 装飾アイコン: `aria-hidden="true"`
- [ ] アイコンのみボタン: `aria-label`

### Motion
- [ ] `@media (prefers-reduced-motion: reduce)` で ambient animation を停止
- [ ] opacity/color トランジションは残す
- [ ] 5秒以上のアニメーションに pause コントロール
- [ ] 3回/秒以上のフラッシュなし
