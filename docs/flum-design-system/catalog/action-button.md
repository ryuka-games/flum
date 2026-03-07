# Action Button

> テキストラベルを持つ操作ボタン。チャンネル作成、ログアウト、削除など。

## 見た目

- 形状: 角丸 (`rounded-xl` or `rounded-full`)
- 背景: 用途により異なる（プライマリ / セカンダリ / ゴースト）
- ボーダー: プライマリは `border-2 border-neon-pink`
- 影: プライマリは `shadow-[2px_2px_0_var(--accent-cyan)]`（ネオブルータリスト）

## クラスバンドル

### プライマリ（強い操作: 作成、送信）

```html
<button class="rounded-full border-2 border-neon-pink bg-neon-pink
               px-3 py-1.5 text-xs font-bold text-white
               shadow-[2px_2px_0_var(--accent-cyan)]
               hover:translate-x-[1px] hover:translate-y-[1px]
               hover:shadow-[1px_1px_0_var(--accent-cyan)]">
  作成
</button>
```

ホバーで影が 2px→1px に縮み、ボタンが 1px 沈む。「押した」フィードバック。

### セカンダリ（穏やかな操作: 変更、設定）

```html
<button class="rounded-xl border-2 border-river-border
               px-3 py-1.5 text-xs text-[var(--text-secondary)]
               hover:border-int-accent hover:text-int-accent">
  変更
</button>
```

### ゴースト（軽い操作: ログアウト、閉じる）

```html
<button class="rounded-xl px-3 py-1.5 text-xs
               text-[var(--text-secondary)]
               hover:bg-river-surface hover:text-[var(--text-primary)]">
  ログアウト
</button>
```

### 破壊（危険な操作: 削除）

```html
<button class="rounded-lg p-1 text-int-danger hover:brightness-110">
  <Trash2 size={14} />
  チャンネルを削除
</button>
```

### フルワイド（ログインボタン等）

```html
<button class="inline-flex w-full items-center justify-center gap-3
               rounded-full border border-[#8E918F] bg-[#131314]
               px-6 py-3 text-sm font-medium text-[#E3E3E3]
               hover:bg-[#1f1f1f]">
  <GoogleIcon /> Google でログイン
</button>
```

ログインページ専用。River UI のトークンではなく、各プロバイダのブランドガイドラインに準拠。

## バリアント

| バリアント | 角丸 | 背景 | ボーダー | 用途 |
|-----------|------|------|---------|------|
| プライマリ | `rounded-full` | `bg-neon-pink` | `border-2 border-neon-pink` | 作成、送信 |
| セカンダリ | `rounded-xl` | transparent | `border-2 border-river-border` | 変更、設定 |
| ゴースト | `rounded-xl` | transparent → `hover:bg-river-surface` | なし | ログアウト、閉じる |
| 破壊 | `rounded-lg` | transparent | なし | 削除 |
| フルワイド | `rounded-full` | `bg-[#131314]` | `border` | ログイン |

## 状態

| 状態 | プライマリ | セカンダリ | ゴースト | 破壊 |
|------|----------|-----------|---------|------|
| default | ピンク背景 + neo影 | ボーダーのみ | テキストのみ | 赤テキスト |
| hover | 1px沈み + 影縮小 | ボーダー・テキストがシアンに | 背景出現 + 白テキスト | brightness-110 |
| active | — | — | — | — |
| disabled | `opacity-50 cursor-not-allowed` | 同左 | 同左 | 同左 |

## インタラクションカラー

| バリアント | ホバー色 | 理由 |
|-----------|---------|------|
| プライマリ | 色変化なし（沈み込みで表現） | 既にピンク背景で目立つ |
| セカンダリ | シアン（`hover:text-int-accent`） | アクション |
| ゴースト | 白（`hover:text-[var(--text-primary)]`） | ナビゲーション寄り |
| 破壊 | 赤（`text-int-danger`） | 常時赤、hover で brightness |

## レスポンシブ

- サイズ・デザインはモバイル/デスクトップ共通
- ログインボタンのみ `w-full` でフルワイド

## 使用箇所

| ファイル | バリアント | ラベル |
|---------|-----------|--------|
| `src/components/channel-rail.tsx` | プライマリ | 作成 |
| `src/components/mobile-menu-fab.tsx` | プライマリ | 作成 |
| `src/components/channel-settings-panel.tsx` | 破壊 | チャンネルを削除 |
| `src/components/avatar-menu.tsx` | ゴースト | ログアウト / OPML |
| `src/components/mobile-menu-fab.tsx` | ゴースト | ログアウト |
| `src/components/wallpaper-picker.tsx` | セカンダリ | 設定 / 変更 / クリア |
| `src/components/keyboard-help.tsx` | ゴースト | 閉じる |
| `src/components/add-feed-form.tsx` | プライマリ | 追加 |
| `src/app/error.tsx` | プライマリ | リトライ |
| `src/app/not-found.tsx` | プライマリ | ホームに戻る |
| `src/app/login/page.tsx` | フルワイド | Google / GitHub ログイン |

## 注意点

- プライマリの neo 影 `shadow-[2px_2px_0_var(--accent-cyan)]` はホバーで `1px_1px` に変化。`translate` と `shadow` を同時に変える
- `disabled` 状態は `opacity-50` + `cursor-not-allowed` で統一（個別実装、共通クラスなし）
- ログインボタンは River UI トークンを使わない（プロバイダのブランドガイドライン優先）
