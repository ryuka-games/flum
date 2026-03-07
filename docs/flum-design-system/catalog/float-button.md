# Float Button

> 川面に浮かぶ石。アイコンだけのボタンで、ホバーすると水面から浮き上がる。

## 見た目

- 形状: 円形 (`rounded-full`)
- サイズ: `h-8 w-8`（32px）
- 背景: `bg-river-deep/85` + `backdrop-blur-md`
- テキスト色: `text-[var(--text-secondary)]`（アイコン）
- 影: Float System による水面影 + シアングロー

## クラスバンドル

```html
<button class="click-ripple float-shadow float-water-delay-{N}
               h-8 w-8 rounded-full bg-river-deep/85 backdrop-blur-md
               text-[var(--text-secondary)]">
  <Icon size={18} />
</button>
```

必須クラス:
- `click-ripple` — クリック波紋フィードバック
- `float-shadow` — 影 + ホバーリフト + シアングロー
- `float-water-delay-{N}` — 水面ボブ（`1`/`2`/`3` でずらす）
- `rounded-full` — 円形
- `bg-river-deep/85 backdrop-blur-md` — フロストガラス背景

## バリアント

### 標準（32px）

設定ギア、アバタートリガー等。上記のクラスバンドルそのまま。

### チャンネルレールアイテム（48px）

```html
<button class="click-ripple float-shadow
               h-12 w-12 rounded-2xl bg-river-deep/85
               text-[var(--text-secondary)]">
```

- サイズ: `h-12 w-12`（48px）
- 角丸: `rounded-2xl`（円形ではなくスクエア寄り）
- 水面ボブなし（レール内は静止）

### モバイル FAB

| FAB | サイズ | 角丸 | 用途 |
|-----|------|------|------|
| メニューFAB | `h-10 w-10`（40px） | `rounded-full` | ハンバーガーメニュー |
| チャンネルFAB | `h-14 w-14`（56px） | `rounded-2xl` | チャンネル切替 |

## 状態

| 状態 | 変化 |
|------|------|
| default | `text-[var(--text-secondary)]` + Float System 影 |
| hover | リフト(`--lift-sm: -2px`) + スケール(`--scale-sm: 1.08`) + シアングロー強化 + アイコン色変化（下記参照） |
| active | `click-ripple` で 1px 沈み + シアン波紋 |
| disabled | N/A（現状未使用） |

## インタラクションカラー

ボタンの**意図**でホバー色が決まる:

| 意図 | ホバー色 | 例 |
|------|---------|-----|
| アクション（何かを実行） | `hover:text-int-accent`（シアン） | 設定ギア、リフレッシュ、コピー、共有 |
| ナビゲーション（移動） | `hover:text-[var(--text-primary)]`（白） | サイドバー開閉、メニュートリガー |
| 保存 | `hover:text-neon-pink` | Scoop ピン |
| 破壊 | `hover:text-int-danger`（赤） | ソース削除 |

## レスポンシブ

- デスクトップ / モバイル共通デザイン
- `@media (hover: none)`: Float System のホバーリフトが無効化される（タップで浮き上がらない）
- `safe-area-inset` を `fixed` 配置時に考慮

## 使用箇所

| ファイル | 用途 | ホバー色 |
|---------|------|---------|
| `src/components/avatar-menu.tsx` | アバタートリガー | ナビゲーション（白） |
| `src/components/channel-settings-panel.tsx` | 設定ギアトリガー | アクション（シアン） |
| `src/components/mobile-menu-fab.tsx` | メニューFAB | ナビゲーション（白） |
| `src/components/mobile-channel-fab.tsx` | チャンネルFAB | ナビゲーション（白） |
| `src/components/channel-rail.tsx` | チャンネルレールアイテム（48px） | ナビゲーション（白） |
| `src/components/channel-rail.tsx` | チャンネル作成ボタン | アクション（シアン） |

> **注記**: `refresh-button.tsx`、`copy-button.tsx`、`share-button.tsx`、`feed-item.tsx`（Scoop ピン）、`delete-feed-source.tsx` のアイコンボタンは Float Button ではなく**インラインアイコンアクション**（カード内やパネル内の小さなアイコンボタン）。インタラクションカラーのルール（シアン/ピンク/赤）は共有するが、Float System スタイリング（`float-shadow`, `click-ripple`, `float-water`, `bg-river-deep/85`）は適用しない。

## 注意点

- `click-ripple` は `position: relative` が必要（`::before` 疑似要素の基準）
- `float-water-delay-{N}` は同じ画面に複数 FAB がある場合に使い分ける。同じ delay だと同期して不自然
- `backdrop-blur-md` は containing block を生成する。子孫に `fixed` 要素がある場合は注意
- アイコンサイズは 18px が標準（16px だと小さすぎ、20px だとボタンに対して大きい）
- `float-active` — アクティブ状態（現在のチャンネル）。`float-shadow` のホバーリフトを無効化し、ピンクボーダー + ネオ影で「選択中」を示す
- `float-shadow-lg` — 大きめの影バリアント。Channel Rail の `<nav>` コンテナに使用
