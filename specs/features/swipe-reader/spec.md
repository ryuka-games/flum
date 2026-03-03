# スワイプリーダー（プレビュー機能）

記事を開かずに「読む価値があるか」を判断するためのプレビュー。カードのクリック動作（→ 外部サイト）は一切変えず、別レイヤーでプレビューを提供する。

## データソース

RSS の `content` / `description`（IDB に `content` として保存）と OGP の `ogDescription`。優先順位: `content` > `ogDescription`。どちらもない場合は「プレビューなし」表示。HTML タグは `stripHtml()` でプレーンテキスト化。

## UI パターン

### PC: ホバーポップオーバー（右ガター）

カードに 300ms ホバー → カード右側にポップオーバーが出現。

```
                              ┌─────────────────┐
┌──────────────────┐          │ OG Description  │
│ Article Title... │  ──►     │ 2-3行の要約     │
│ source · 2h ago  │          │ テキスト。      │
└──────────────────┘          └─────────────────┘
  クリック → 外部サイト         右ガターに表示
  ホバー → ポップオーバー       Floating UI
```

**表示条件**: `(hover: hover)` AND `(min-width: 1024px)` の両方を満たす場合のみ。右ガターに十分なスペースがないとポップオーバーがコンテンツに被るため。

**配置**: `placement: right-start`、`middleware: [offset(16), flip(), shift({ padding: 16 })]`。`flip()` でスペースがなければ `left-start` にフォールバック。

**DOM**: `FloatingPortal` でレンダリング。decay の `filter` が作る containing block の影響を回避。

**アニメーション**: `.preview-pop` — 右から滑り込み + scale バウンス（200ms）。`@media (hover: none)` で非表示。`prefers-reduced-motion` でアニメーション無効化。

**j/k 連動**: カードが選択されると 350ms 後に自動表示。選択解除で閉じる。scrollIntoView 完了を待つためのディレイ。

### モバイル: カード内スワイプ

左スワイプ → カード内容がスライドし裏面（プレビュー）に切り替わる。カード枠は動かない。

```
【表面】        ← swipe          【裏面】
┌────────────┐                ┌────────────┐
│ 🖼 Image   │                │            │
│ Title...   │  ◄━━━━━━━━━   │ OG Desc... │
│ src · 2h   │                │ 要約文。   │
│      📌 🔗 │                │            │
└────────────┘                │  タップ→開く│
                              └────────────┘
```

**構造**: `overflow-hidden` でクリップされた `.card-slide-track`（`flex`）の中に表面・裏面を並べる。`translateX` で切り替え。

**スワイプ判定** (`use-card-swipe.ts`):
- デッドゾーン: 10px（移動量がこれ未満なら方向未確定）
- 角度判定: `|deltaX| > |deltaY|` → 水平ロック。それ以外 → 垂直（スクロール）としてスルー
- 方向制限: 表面では左スワイプのみ、裏面では右スワイプのみ受付
- 閾値: 50px 以上の水平移動で確定フリップ
- ドラッグ追従: `dragOffset` で指に追従するライブオフセット。ドラッグ中は `transition: none`

**裏面**: `<a href={url}>` でラップ。タップで記事を開ける。`flipped` が `false` のときは `max-h-0 overflow-hidden` で潰す。

**遷移**: `.card-slide-track { transition: transform 0.25s var(--spring); }`

### キーボード: `p` キー

選択中のカードで `p` → `toggle-preview` カスタムイベントを dispatch。

- PC（ポップオーバー有効時）: `previewOpen` をトグル
- モバイル / 狭い画面: `flipped` をトグル

## デバイス判定

### `useIsHoverDevice()` (`use-hover-device.ts`)

`useSyncExternalStore` + `matchMedia("(hover: hover)")` でリアクティブに判定。

- `MediaQueryList` はモジュールレベルでキャッシュ（`useSyncExternalStore` の無限ループ防止）
- SSR では `true`（ホバー対応）をデフォルト

### 右ガター判定

`useSyncExternalStore` + `matchMedia("(min-width: 1024px)")` で判定。同じく MQL キャッシュ。

### 分岐ロジック

```
popoverEnabled = isHoverDevice AND hasGutter
```

- `popoverEnabled = true` → ホバーポップオーバー有効、スワイプハンドラ無効
- `popoverEnabled = false` → スワイプハンドラ有効

## Props パイプライン

```
IDB (content, ogDescription)
  → channel-feed-view.tsx: item.content, item.ogDescription をマッピング
    → feed-item-list.tsx: FeedItemData.content, .og_description
      → feed-item.tsx: content={...} ogDescription={...}
        → PreviewText コンポーネント
        → ポップオーバー内テキスト
```

Scoops では `og_description: null`, `content: null`（Scoops テーブルにこれらのフィールドがないため）。「プレビューなし」が表示される。

## イベント連携

| イベント | 発行元 | リスナー | 用途 |
|---------|--------|---------|------|
| `toggle-preview` (CustomEvent) | `use-keyboard-nav.ts` (`p` キー) | `feed-item.tsx` (カード div) | プレビュー表示/非表示トグル |

## ref マージ

`feed-item.tsx` のカード div には2つの ref が必要:

1. `cardRef` — `data-feed-item-index` + `toggle-preview` イベントリスナー用
2. `refs.setReference` — Floating UI のアンカー

`useCallback` で `setCardRef` にマージ:

```typescript
const setCardRef = useCallback(
  (node: HTMLDivElement | null) => {
    cardRef.current = node;
    refs.setReference(node);
  },
  [refs],
);
```

## アクセシビリティ

- ポップオーバー: `prefers-reduced-motion: reduce` でアニメーション無効
- スワイプ: `prefers-reduced-motion: reduce` で transition 無効
- カード全面リンクの `<a>`: `tabIndex={-1}` + `aria-label={title}`（ホバーアシスティブテキストとして機能）

## 実装ファイル

| ファイル | 役割 |
|---------|------|
| `src/components/feed-item.tsx` | ポップオーバー + スワイプ + PreviewText コンポーネント |
| `src/lib/use-card-swipe.ts` | モバイルスワイプ hook（方向ロック + 閾値判定） |
| `src/lib/use-hover-device.ts` | `matchMedia("(hover: hover)")` のリアクティブ判定 |
| `src/lib/use-keyboard-nav.ts` | `p` キーハンドラ（`toggle-preview` イベント発行） |
| `src/components/keyboard-help.tsx` | ヘルプに `p` キー表示 |
| `src/components/feed-item-list.tsx` | `FeedItemData` 型定義（`og_description`, `content`） |
| `src/components/channel-feed-view.tsx` | IDB → `FeedItemData` マッピング |
| `src/components/scoops-feed-view.tsx` | `og_description: null`, `content: null` フォールバック |
| `src/app/globals.css` | `.preview-pop`, `.card-slide-track` アニメーション |
