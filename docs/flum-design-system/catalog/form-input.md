# Form Input

> 川に投げ入れるメッセージボトル。テキスト入力フィールド。

## 見た目

- 形状: `rounded-xl`（標準）/ `rounded-lg`（ボーダー付き）
- 背景: `bg-river-surface`
- ボーダー: 標準はなし。ボーダー付きバリアントのみ `border border-river-border`
- テキスト: `text-sm text-[var(--text-primary)]`
- プレースホルダー: `placeholder-[var(--text-muted)]`

## クラスバンドル

### 標準（フィード URL、チャンネル名 — デスクトップ）

```html
<input
  type="text"
  class="w-full rounded-xl bg-river-surface
         px-3 py-1.5 text-sm
         text-[var(--text-primary)]
         placeholder-[var(--text-muted)]
         outline-none focus:ring-1 focus:ring-river-border"
  placeholder="プレースホルダー"
/>
```

ボーダーなし。`bg-river-surface` の面だけで入力領域を示す。

### モバイル（チャンネル名 — Bottom Sheet 内）

```html
<input
  type="text"
  class="min-w-0 flex-1 rounded-xl bg-river-surface
         px-3 py-2 text-sm
         text-[var(--text-primary)]
         placeholder-[var(--text-muted)]
         outline-none focus:ring-1 focus:ring-river-border"
  placeholder="チャンネル名"
/>
```

標準と同じだが `py-2`（タッチ最適化）。

### ボーダー付き（キーワード入力）

```html
<input
  type="text"
  class="w-full rounded-lg border border-river-border
         bg-river-surface px-3 py-1.5 text-xs
         text-[var(--text-primary)]
         placeholder:text-[var(--text-secondary)]/50
         focus:border-int-accent/50 focus:outline-none"
  placeholder="キーワード"
/>
```

キーワードフィルタ入力専用。`rounded-lg` + `border` + `text-xs` でコンパクト。フォーカス時はシアンボーダー。

## バリアント

| バリアント | 角丸 | ボーダー | サイズ | フォーカス | 用途 |
|-----------|------|---------|------|----------|------|
| 標準 | `rounded-xl` | なし | `text-sm px-3 py-1.5` | `ring-1 ring-river-border` | フィード URL、チャンネル名 |
| モバイル | `rounded-xl` | なし | `text-sm px-3 py-2` | `ring-1 ring-river-border` | Bottom Sheet 内チャンネル名 |
| ボーダー付き | `rounded-lg` | `border border-river-border` | `text-xs px-3 py-1.5` | `border-int-accent/50` | キーワードフィルタ |

## 状態

| 状態 | 変化 |
|------|------|
| default | `bg-river-surface`（標準はボーダーなし） |
| focus | `ring-1 ring-river-border`（標準）/ `border-int-accent/50`（ボーダー付き） |
| disabled | `opacity-50`（送信中） |
| error | 実装なし（バリデーションはサーバー側） |

## インタラクションカラー

フォーム入力自体にインタラクションカラーは適用しない。フォーカスリングで状態を示す。

## レスポンシブ

モバイル Bottom Sheet 内では `py-2` でタップターゲットを拡大。それ以外は共通。

## 使用箇所

| ファイル | バリアント | 用途 |
|---------|-----------|------|
| `src/components/add-feed-form.tsx` | 標準 | フィード URL 入力 |
| `src/components/channel-rail.tsx` | 標準 | チャンネル名入力 |
| `src/components/mobile-menu-fab.tsx` | モバイル | チャンネル名入力 |
| `src/components/mobile-channel-fab.tsx` | モバイル | チャンネル名入力 |
| `src/components/channel-settings-panel.tsx` | ボーダー付き | キーワードフィルタ入力 |

## 注意点

- 標準バリアントはボーダーなし。`bg-river-surface` の面だけで十分に入力領域が認識できる
- `focus:outline-none` で標準のフォーカスリングを消し、`focus:ring-1` でカスタムリングを出す
- 送信中は `disabled` + `opacity-50`。`aria-disabled` ではなく HTML `disabled` を使用
