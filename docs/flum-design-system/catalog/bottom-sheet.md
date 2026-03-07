# Bottom Sheet

> モバイル専用のスライドアップメニュー。画面下部から出現し、バックドロップで閉じる。

## 見た目

- 形状: 上部のみ角丸 `rounded-t-2xl`
- 背景: `bg-river-deep/95`
- ボーダー: 上辺のみ `border-t-2 border-neon-pink`
- パディング: `p-4`

## クラスバンドル

```html
<!-- バックドロップ -->
<div class="fixed inset-0 z-40 bg-black/60" />

<!-- シート -->
<div class="absolute bottom-0 left-0 right-0 z-50
            rounded-t-2xl border-t-2 border-neon-pink
            bg-river-deep/95 p-4
            pb-[calc(16px+env(safe-area-inset-bottom,0px))]
            backdrop-blur-md">
  <!-- コンテンツ -->
</div>
```

必須要素:
- バックドロップ: `fixed inset-0 bg-black/60`（クリックで閉じる）
- シート: `absolute bottom-0` + 上丸角 + ピンクボーダー（上辺のみ）
- セーフエリア: `pb-[calc(16px+env(safe-area-inset-bottom,0px))]`
- フロスト: `backdrop-blur-md`

### Side Panel との違い

| | Bottom Sheet | Side Panel |
|---|---|---|
| ボーダー | `border-t-2`（上辺のみ） | `border-2`（全辺） |
| 配置 | `bottom-0`（画面端フラッシュ） | `inset-x-3 bottom-3`（マージンあり） |
| ネオ影 | なし | `shadow-[4px_4px_0_var(--accent-cyan)]` |
| 背景 | `bg-river-deep/95`（半透明） | `bg-river-deep`（不透明） |

Bottom Sheet は画面端にフラッシュする軽い要素。横ボーダーやネオ影は不自然。Side Panel はフローティングパネルなので全辺ボーダー + 影で存在感を出す。

## バリアント

### メニューシート（MobileMenuFab）

フルナビゲーション。チャンネル一覧、Scoops、ユーザー情報、OPML、ログアウト。

```html
<div class="... max-h-[70vh] overflow-y-auto">
  <!-- ユーザー情報 -->
  <!-- セパレータ -->
  <!-- チャンネルリスト（スクロール可能） -->
  <!-- チャンネル作成 -->
  <!-- OPML / ログアウト -->
</div>
```

スクロール: チャンネルリスト部分に `max-h-[40vh] overflow-y-auto`。

### チャンネル切替シート（MobileChannelFab）

チャンネルリスト部分に `max-h-[50vh] overflow-y-auto`（メニューシートより高い）。

### 共有シート（SharePopover）

シンプルなアクションリスト。

```html
<div class="...">
  <h3 class="mb-3 text-center text-sm font-bold text-[var(--text-primary)]">
    共有
  </h3>
  <div class="space-y-1">
    <a class="flex items-center gap-3 rounded-xl px-3 py-3
              text-sm text-[var(--text-primary)] active:bg-white/10">
      𝕏 でシェア
    </a>
    <!-- 他のリンク -->
  </div>
</div>
```

## 状態

| 状態 | 変化 |
|------|------|
| open | バックドロップ + シート表示 |
| closed | 非表示（条件レンダリング） |

### 閉じるトリガー

- バックドロップクリック
- Escape キー（実装による）
- アクション実行後（共有リンククリック等）

## インタラクションカラー

シート内のリンク・ボタンは各コンポーネントの仕様に従う。

共有シートのリンク: `active:bg-white/10`（モバイルは `:active` を使用、`:hover` ではない）。

## レスポンシブ

- **モバイル専用**。デスクトップでは表示されない
- `env(safe-area-inset-bottom)` で iPhone のホームインジケータを回避
- `max-h-[70vh]` でシートが画面を覆いすぎないよう制限

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/mobile-menu-fab.tsx` | メニューシート（チャンネル一覧・設定） |
| `src/components/share-button.tsx` | 共有シート（モバイル時） |
| `src/components/mobile-channel-fab.tsx` | チャンネル切替シート |

## 注意点

- Side Panel（デスクトップ）とは別コンポーネント。Side Panel はモバイルでもボトムシート風だが、`border-2`（全辺）+ `inset-x-3 bottom-3`（マージンあり）。Bottom Sheet は `border-t-2`（上辺のみ）+ `bottom-0`（画面端にぴったり）
- `bg-river-deep/95`（95% 不透明）で背景が微かに透ける。Side Panel は `bg-river-deep`（100%）
- z-index はバックドロップ `z-40`、シート `z-50`（Side Panel と同じ階層）
