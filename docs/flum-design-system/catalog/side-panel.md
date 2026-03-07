# Side Panel

> 川岸の東屋。設定や詳細情報を表示するパネル。デスクトップは右サイド、モバイルはボトムシート。

## 見た目

- 形状: `rounded-2xl`
- 背景: `bg-river-deep`
- ボーダー: `border-2 border-neon-pink`
- 影: `shadow-[4px_4px_0_var(--accent-cyan)]`（ネオブルータリスト lg）
- 最大幅: デスクトップ `w-80`（320px）

## クラスバンドル

```html
<!-- バックドロップ（モバイルのみ） -->
<div class="fixed inset-0 z-40 bg-black/60 md:hidden" />

<!-- パネル -->
<div class="fixed z-50 overflow-y-auto
            rounded-2xl border-2 border-neon-pink bg-river-deep p-4
            shadow-[4px_4px_0_var(--accent-cyan)]
            inset-x-3 bottom-3 max-h-[70vh]
            md:top-20 md:right-6 md:bottom-auto md:left-auto
            md:w-80 md:max-h-[calc(100vh-160px)]">
  <!-- ヘッダー -->
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-bold text-[var(--text-primary)]">タイトル</h2>
    <button class="rounded-lg p-1 text-[var(--text-muted)]
                   hover:text-[var(--text-primary)]">
      <X size={16} />
    </button>
  </div>
  <!-- コンテンツ -->
</div>
```

## バリアント

バリアントなし。単一パターン。コンテンツで差別化。

現在の使用: チャンネル設定パネル（フィード追加・ソース管理・壁紙・キーワードフィルタ・チャンネル削除）。

## 状態

| 状態 | 変化 |
|------|------|
| open | パネル表示 + バックドロップ（モバイル） |
| closed | 非表示（DOM に存在しない） |

### 閉じるトリガー

- Escape キー
- バックドロップクリック（モバイル）
- パネル外クリック（デスクトップ、`mousedown` + `requestAnimationFrame` で開くボタンとの競合回避）
- 閉じるボタン（X アイコン）

## インタラクションカラー

| 要素 | ホバー色 | 理由 |
|------|---------|------|
| 閉じるボタン | `hover:text-[var(--text-primary)]`（白） | ナビゲーション |

パネル内のボタン・チップ等は各コンポーネントの仕様に従う。

## レスポンシブ

| | デスクトップ | モバイル |
|---|---|---|
| 位置 | `fixed right-6 top-20` | `fixed inset-x-3 bottom-3` |
| 幅 | `w-80`（320px） | 画面幅 - 24px |
| 最大高さ | `calc(100vh - 160px)` | `70vh` |
| バックドロップ | なし | `bg-black/60` |

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/side-panel.tsx` | 汎用サイドパネルコンポーネント |
| `src/components/channel-settings-panel.tsx` | チャンネル設定（SidePanel を使用） |

## 注意点

- パネル外クリック検知は `mousedown`（`click` ではない）で実装。`click` だとトリガーボタンのクリックイベントと競合する
- `requestAnimationFrame` を挟んでいるのは、開くボタンの `click` → `mousedown` の順序問題を回避するため
- `overflow-y-auto` でスクロール可能。コンテンツが長い場合に対応
- z-index: パネル `z-50`、バックドロップ `z-40`
