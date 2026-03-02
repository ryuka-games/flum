# フィードエラー表示 — 調査結果

## 他のフィードリーダーの手法

| アプリ | エラー表示 | エラー回復 |
|--------|-----------|-----------|
| Miniflux | フィード一覧に `parsing_error_count` + メッセージ。メニュー横にエラー数バッジ（赤）。3回連続エラーでポーリング停止 | CLI で reset。後に「エラーフィードだけ再試行」追加（停止が不評だったため） |
| FreshRSS | ソース管理画面にエラーアイコン + 最終成功日時。フィード一覧には影響なし | 次回ポーリングで自動リトライ |
| Feedly | ユーザーにはほぼ見せない。裏でサーバー処理。壊れたフィードは静かに更新停止 | サーバーサイド自動リカバリ |
| Inoreader | ソース設定画面に「Feed status: OK / Error」 | サーバーサイドリトライ |
| NetNewsWire | 明示的なエラー表示なし。「更新が来ない」状態 | 次回リフレッシュで自動リトライ |

**共通パターン**: タイムライン（フィード一覧）にはエラーを出さない。管理/設定画面に隔離する。

## エラー種別と深刻度

| エラー種別 | 現在のメッセージ | ユーザーに見せるべきか |
|-----------|----------------|---------------------|
| HTTP 4xx/5xx | `サーバーがエラーを返しました (HTTP xxx)` | はい（404 = 死んだ URL） |
| タイムアウト | `接続がタイムアウトしました` | 繰り返す場合のみ |
| 接続不可 | `接続できませんでした` | 繰り返す場合のみ |
| パース失敗 | `有効な RSS/Atom フィードではありません` | はい |
| サイズ超過 | `レスポンスが大きすぎます` | はい |

## DB 設計

`feed_sources` テーブルに3カラム追加:

```sql
ALTER TABLE feed_sources
  ADD COLUMN last_error_message TEXT,
  ADD COLUMN last_error_at TIMESTAMPTZ,
  ADD COLUMN consecutive_error_count INTEGER NOT NULL DEFAULT 0;
```

- 成功時: 3カラムをクリア（`null, null, 0`）
- エラー時: メッセージ・日時を書き込み、カウントをインクリメント
- `last_fetched_at` は成功時のみ更新（= 実質 `last_successful_at`）

## UI 提案

### 1. ChannelSettingsPanel のソースリスト（主要）

3回以上連続エラーのソースにエラー表示:

```
Zenn Trending                     [×]    ← 正常
Hatena Bookmark    ⚠ 3回失敗     [×]    ← エラー
└ 接続がタイムアウトしました
  最終成功: 2時間前    [再試行]
Dead Blog RSS      ⚠ 10回失敗    [×]    ← 長期エラー
└ サーバーがエラーを返しました (404)
  最終成功: 3日前      [再試行] [削除]
```

- `⚠` は `text-amber-400`（3回以上）
- 10回超えは `text-red-400`（`int-danger`）

### 2. ChannelRail のドットインジケータ

エラーソースがあるチャンネルのアイコンに小さな amber ドット（`w-2 h-2 rounded-full bg-amber-400`）。

## ベストプラクティス

- **1回のエラーでは騒がない** — `consecutive_error_count >= 3` で初めて表示
- **停止しない** — Miniflux の「3回で停止」は不評。リトライし続ける
- **エラー履歴は持たない** — 直近1件のみ
- **アクションを明示** — 「URLを確認」「再試行」「削除」

## 実装箇所

- `refreshChannelById`（`src/app/actions/feed.ts`）— エラー時に DB 書き込み、成功時にクリア
- `ChannelSettingsPanel`（`src/components/channel-settings-panel.tsx`）— ソースリストにエラー表示
- `ChannelRail`（`src/components/channel-rail.tsx`）— amber ドット

## 技術的背景

- フィードフェッチは Server Action（CORS 制約のためクライアントサイドでは不可）
- ソースメタデータは Supabase `feed_sources`（`last_fetched_at`, `etag` 等）に既に保存されているため、エラー情報も同じテーブルが適切
- 記事データは IndexedDB（クライアント側キャッシュ）
