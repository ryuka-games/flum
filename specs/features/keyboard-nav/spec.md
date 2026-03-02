# キーボードナビゲーション

チャンネルフィード画面でのキーボード操作。フィードリーダーの「速さ」の差別化。

## ショートカット

### フィード操作

| キー | 動作 |
|------|------|
| `j` / `k` | 次/前のアイテムへ（選択 + スクロール追従） |
| `o` / `Enter` | 選択中のアイテムを新タブで開く |
| `s` | Scoop トグル |
| `r` | チャンネルをリフレッシュ（FlowLine 連携） |
| `?` | ショートカットヘルプ表示 |
| `Esc` | 選択解除 / ヘルプ閉じる |

### アプリレベルナビゲーション

| キー | 動作 |
|------|------|
| `H` (Shift+h) | 前のチャンネルへ |
| `L` (Shift+l) | 次のチャンネルへ |
| `1`〜`9` | チャンネル1〜9へ直接ジャンプ |
| `S` (Shift+s) | Scoops ページへ |

## 仕様

### 選択状態

- `selectedIndex` で管理。初期値 `null`（未選択）
- `j` で初めて押すと index 0 を選択
- 先頭で `k` / 末尾で `j` → 何も起きない（クランプ）
- アイテム数が変わったら `selectedIndex` をクランプ
- 選択中のカードに `ring-1 ring-int-accent/60`（シアンリング）表示
- 選択カードに `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`

### 無効化条件

- `input` / `textarea` / `select` / `contenteditable` にフォーカス中
- ヘルプ以外の `dialog[open]` が存在する場合

### Scoop（`s` キー）

- `scoopMap: Record<url, scoopId>` で Scoop 済み判定 + 解除用 ID を保持
- 未 Scoop → `toggleFavorite()` に FormData を渡して追加
- Scoop 済み → `removeFavorite()` に scoopId を渡して解除

### リフレッシュ（`r` キー）

- `flowline:start` / `flowline:done` カスタムイベントで FlowLine と連携
- `refreshChannelById()` → `saveAndNotify()` の流れ

### アプリナビ仕様

- **H/L**: 現在のチャンネル index を channels 配列から特定 → ±1
  - Scoops にいる場合: H → 最後のチャンネル、L → 最初のチャンネル
  - 端でクランプ（先頭で H → 何もしない、末尾で L → 何もしない）
- **1-9**: `channels[n-1]` が存在すれば `/channels/{id}` へ遷移。存在しなければ無視
- **S**: `/scoops` へ遷移
- **小文字 s**（Scoop トグル）と**大文字 S**（Scoops ページ）は別の操作

## 実装ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/use-keyboard-nav.ts` | フィード操作フック（j/k/o/s/r） |
| `src/lib/use-app-keyboard-nav.ts` | アプリレベルナビフック（H/L/1-9/S） |
| `src/components/keyboard-help.tsx` | `?` ヘルプモーダル（`<dialog>`） |
| `src/components/feed-item.tsx` | `isSelected` prop → リング表示 |
| `src/components/feed-item-list.tsx` | `selectedIndex` prop + `data-feed-item-index` |
| `src/components/channel-feed-view.tsx` | フィードフック接続 |
| `src/components/channel-rail.tsx` | アプリナビフック接続 |
| `src/app/(app)/channels/[id]/page.tsx` | `scoopMap` 生成 |
