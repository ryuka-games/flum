# フィードパイプライン仕様

フィードアイテムが RSS ソースからユーザーの画面に届くまでの全ステップと、各レイヤーのフィルタリングルール。

---

## パイプライン全体像

```
RSS ソース（外部）
  │  fetch + parse（fetch-feed.ts）
  │  ── タイムアウト 10s、サイズ上限 5MB、SSRF 保護
  ▼
全アイテム（数件〜数百件）
  │  filterRecentItems（feed.ts）
  │  ── publishedAt 48h 以内 + 日付なし通過 + 上限 50 件
  ▼
直近アイテム（〜50件）
  │  fetchOgpBatch（fetch-ogp.ts）
  │  ── 同時 8 件バッチ、各 3s タイムアウト
  ▼
アイテム + OGP データ
  │  saveAndNotify → putItems（store.ts）
  │  ── IndexedDB に保存、dedupKey [feedSourceId, url] で重複スキップ
  ▼
IndexedDB キャッシュ
  │  isExpired（decay.ts）
  │  ── publishedAt 24h 超 → 非表示（日付なしは fetchedAt でフォールバック）
  ▼
画面表示（〜24h 以内の記事のみ）
  │
  │  pruneExpiredItems（store.ts）
  │  ── 7 日超のレコードを IDB から物理削除（ハウスキーピング）
  ▼
削除
```

---

## 各レイヤー詳細

### 1. RSS フェッチ + パース

- **ファイル**: `src/lib/feed/fetch-feed.ts`
- タイムアウト: 10 秒（`AbortSignal.timeout`）
- サイズ上限: 5MB（ストリーミング読み取りで強制）
- SSRF 保護: URL バリデーション + プライベート IP ブロック
- 条件付きリクエスト: `ETag` / `If-Modified-Since` で 304 対応
- エンコーディング自動検出: Content-Type → XML 宣言 → UTF-8 フォールバック
- 日付正規化: `pubDate`（RSS）、`published`/`updated`（Atom）、`dc:date`（Dublin Core）→ 全て `publishedAt` に統合

### 2. アイテムフィルタ（取得時）

- **ファイル**: `src/app/actions/feed.ts` — `filterRecentItems()`
- **条件**:
  - `publishedAt` が 48h 以内 → 通過
  - `publishedAt` が `null`（日付なしフィード）→ 通過
  - 上記を満たしても 50 件を超えたら先頭 50 件で打ち切り
- **定数**: `ITEM_CUTOFF_MS`（48h）、`ITEM_MAX_COUNT`（50）
- **理由**: 表示は 24h フィルタなので、48h 超の記事は画面に出ない。334 件のフィードで全件 OGP フェッチするとサーバーがハングする（実際にハングした）
- **適用箇所**: `addFeedSource`（ソース追加時）、`refreshChannelById`（更新時）の両方

### 3. OGP フェッチ

- **ファイル**: `src/lib/feed/fetch-ogp.ts`
- 同時実行数: 8 件バッチ（`OGP_CONCURRENCY`）
- 各リクエストタイムアウト: 3 秒
- `<head>` だけ読み取り（`</head>` 検出で打ち切り、最大 500KB）
- 失敗時は空オブジェクト（パイプラインを止めない）
- 取得対象: `og:image`、`og:description`（Twitter Card フォールバック付き）

### 4. IndexedDB 保存

- **ファイル**: `src/lib/feed/store.ts`
- DB 名: `flum-feed-items`、ストア: `feed-items`
- 重複排除: `[feedSourceId, url]` の複合ユニークインデックス（`dedupKey`）
- `fetchedAt`: 保存時に `Date.now()` を自動付与
- `saveAndNotify()`: 書き込み → キャッシュ更新 → イベント発火（`useSyncExternalStore` 連携）

### 5. 表示フィルタ（描画時）

- **ファイル**: `src/lib/decay.ts` — `isExpired()`
- **条件**: `publishedAt` から 24h 超 → 非表示
- `publishedAt` が `null` の場合は `fetchedAt` でフォールバック
- この判定は `channel-feed-view.tsx` のレンダリング時に毎回実行

### 6. IDB ハウスキーピング

- **ファイル**: `src/lib/feed/store.ts` — `pruneExpiredItems()`
- **条件**: 7 日超のレコードを物理削除
- `publishedAt` が `null` の場合は `fetchedAt` でフォールバック
- 実行タイミング: チャンネルページの `init()` 時（ページ表示ごと）

---

## 定数一覧

| 定数 | 値 | ファイル | 用途 |
|------|-----|---------|------|
| `FETCH_TIMEOUT_MS` | 10,000ms | fetch-feed.ts | RSS フェッチタイムアウト |
| `MAX_RESPONSE_BYTES` | 5MB | fetch-feed.ts | RSS レスポンスサイズ上限 |
| `ITEM_CUTOFF_MS` | 48h | feed.ts | 取得時アイテムフィルタ |
| `ITEM_MAX_COUNT` | 50 | feed.ts | 取得時アイテム上限 |
| `OGP_CONCURRENCY` | 8 | fetch-ogp.ts | OGP 同時フェッチ数 |
| `OGP_TIMEOUT_MS` | 3,000ms | fetch-ogp.ts | OGP フェッチタイムアウト |
| `OGP_MAX_BYTES` | 500KB | fetch-ogp.ts | OGP レスポンスサイズ上限 |
| `DISPLAY_MAX_AGE_MS` | 24h | decay.ts | 表示フィルタ（これ超えたら非表示） |
| `HOUSEKEEPING_MAX_AGE_MS` | 7 日 | store.ts | IDB 物理削除 |
| `REFRESH_INTERVAL_MS` | 30 分 | channel-feed-view.tsx | 自動更新間隔 |

---

## タイムライン（アイテムの一生）

```
0h          取得 → IDB 保存 → 画面表示（fresh: ピンクパルス）
1h          recent: 色がわずかに褪せる
6h          aging: 彩度低下 + 寒色シフト
12h         old: ほぼモノクロ
18h         stale: グリッチエフェクト
24h         ── 表示フィルタで非表示 ──
48h         ── 次回取得時にフィルタで除外（新規取得されない）──
7日         ── IDB から物理削除 ──
```
