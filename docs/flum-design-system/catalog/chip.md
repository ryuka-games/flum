# Chip

> 川面に浮かぶ小さな葉。タグ、ソース名、プリセットなどの情報チップ。

## 見た目

- 形状: `rounded-full`（ピル型）
- サイズ: `text-xs px-2.5 py-1`
- 背景: `bg-river-surface`
- テキスト色: `text-[var(--text-secondary)]`

## クラスバンドル

### ソースチップ（フィードソース一覧）

```html
<span class="flex items-center gap-1 rounded-full
             bg-river-surface px-2.5 py-1 text-xs
             text-[var(--text-secondary)]">
  ソース名
  <button class="text-[var(--text-muted)] hover:text-int-danger">
    &times;
  </button>
</span>
```

### プリセットチップ（フィード追加の候補）

```html
<button class="rounded-full bg-river-surface px-2.5 py-1
               text-xs text-[var(--text-secondary)]
               hover:bg-white/10 hover:text-int-accent">
  プリセット名
</button>
```

### キーワードタグ

```html
<span class="flex items-center gap-1 rounded-full
             bg-river-surface px-2.5 py-1 text-xs text-int-accent">
  キーワード
  <button class="hover:text-int-danger">&times;</button>
</span>
```

### ソースバッジ（カード内）

```html
<span class="flex h-4 w-4 items-center justify-center
             rounded-full bg-neon-{color}
             text-[8px] font-bold text-white/90">
  A
</span>
```

極小（16px）。ソース名の頭文字。背景色はソースごとにカラーバリエーション。

## バリアント

| バリアント | 背景 | テキスト色 | 用途 |
|-----------|------|----------|------|
| ソースチップ | `bg-river-surface` | `text-[var(--text-secondary)]` | アクティブソース一覧 |
| プリセットチップ | `bg-river-surface` | `text-[var(--text-secondary)]` | フィード追加候補 |
| キーワードタグ | `bg-river-surface` | `text-int-accent` | キーワードフィルタ |
| エラーチップ | `bg-river-surface ring-1 ring-amber-400/50` | `text-[var(--text-secondary)]` | エラー状態のソース |
| ソースバッジ | `bg-neon-{color}` | `text-white/90` | カード内ソース表示 |

## 状態

| 状態 | ソースチップ | プリセットチップ | キーワードタグ |
|------|------------|----------------|--------------|
| default | 静的表示 | 静的表示 | 静的表示 |
| hover | 削除ボタンが赤に | 背景明るく + シアンテキスト | 削除ボタンが赤に |
| error | amber リング追加 | N/A | N/A |

## インタラクションカラー

| 要素 | ホバー色 | 理由 |
|------|---------|------|
| プリセットチップ | `hover:text-int-accent`（シアン） | アクション（フィード追加） |
| 削除ボタン（×） | `hover:text-int-danger`（赤） | 破壊 |

## レスポンシブ

モバイル/デスクトップ共通デザイン。サイズ変更なし。

## 使用箇所

| ファイル | バリアント |
|---------|-----------|
| `src/components/channel-settings-panel.tsx` | ソースチップ、キーワードタグ、エラーチップ |
| `src/components/feed-presets.tsx` | プリセットチップ |
| `src/components/feed-item.tsx` | ソースバッジ |

## 注意点

- エラーチップの `ring-1 ring-amber-400/50` は `box-shadow` ベース。`float-shadow` の `box-shadow` と競合する可能性があるが、チップは Float System 外なので問題なし
- ソースバッジの `text-[8px]` は Tailwind の標準サイズ外。極小なので例外的に使用
- キーワードタグのテキスト色が `text-int-accent`（シアン）なのは、フィルタ条件が「アクティブに働いている」ことを示すため
