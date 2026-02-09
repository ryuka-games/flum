# Flum

Discord風チャンネルUIのリアルタイムフィードリーダー。

名前の由来: Flume（水路）- e。情報がチャンネルを通じて流れるイメージ。読み: フルム。

---

## 協働の原則

> Lokup プロジェクトから引き継ぎ。

### 忖度しない

- 間違っていると思ったら正直に言う
- 「それは良くないと思う」と言える関係
- ユーザーの意見に合わせるだけでなく、より良い提案をする

### ベストプラクティスを常に意識

- 2025-2026年時点の最新のベストプラクティスを優先
- 分からなければネットで調べる（WebSearch を使う）
- 「なんとなく」ではなく、根拠を持って提案する

### 議論を大切にする

- 選択肢があれば提示して議論する
- トレードオフを明確にする

### 学びを重視

- なぜその選択をしたか説明する
- ユーザーが後で他の人に説明できるようにする

---

## WHAT

Discord/Teams風のチャンネルUIで、RSS等のフィードをカテゴリ別にリアルタイム表示するアプリ。

### 差別化ポイント

- **Feedly系**: 整理は得意だがリアルタイム感がない
- **Discord系**: リアルタイムだがフィードがチャットに埋もれる
- **Flum**: 両方のいいとこ取り。チャンネル型に整理されたリアルタイムフィード

### 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **バックエンド**: Supabase（PostgreSQL + Auth + Realtime）
- **RSS パース**: feedsmith（TypeScript ネイティブ、RSS/Atom/JSON Feed 対応）
- **ホスティング**: Vercel（フロント）+ Supabase Cloud（バックエンド）
- **リアルタイム**: Supabase Realtime（WebSocket ベース）
- **ツール**: ESLint + Prettier, Turbopack

### MVP機能

1. GitHub ログイン（Supabase Auth）
2. チャンネル作成・管理（カテゴリ分け）
3. RSSソース登録（チャンネルに紐づけ）
4. フィード取得 + リアルタイム表示（Supabase Realtime）

### やらないこと（v2以降）

- チャット・コメント機能
- 複数ユーザー・共有
- AIによる要約・分類

---

## WHY

ポートフォリオ第2弾。Lokup（Go CLI）と合わせて技術の幅を示す。
「AI を使ってどこまで速く作れるか」のテストも兼ねる。

### ユーザー背景

- 実務は C# / .NET バックエンド
- 転職活動中（フリーランスも検討中）
- Lokup（Go）に続き、Next.js + TypeScript で幅を見せたい
- リアルタイム通信（WebSocket）は未経験 → 学びたい

---

## DB 設計

```
auth.users (Supabase 管理)
    │
profiles ── ユーザープロフィール
    │
channels ── チャンネル（1ユーザー : 多チャンネル）
    │
feed_sources ── RSS ソース（1チャンネル : 多ソース）
    │
feed_items ── フィードアイテム（1ソース : 多アイテム）
```

- 全テーブル RLS 有効（自分のデータのみアクセス可）
- feed_items で Supabase Realtime を有効化
- マイグレーション SQL: `supabase/migrations/`

---

## HOW

### セットアップ

```bash
npm install
npm run dev
```

### リント

```bash
npx eslint .
```

### テスト

```bash
npm test
```

---

## コーディング規約

- **フォーマッタ**: Prettier + ESLint
- **命名**: キャメルケース（変数・関数）、パスカルケース（コンポーネント）
- **コミットメッセージ**: Lokup と同じ形式（`feat:`, `fix:`, `docs:`, `refactor:`, `test:`）

---

## 踏んだ罠と教訓

### Supabase Realtime + `@supabase/ssr` で認証トークンが WebSocket に渡らない

**現象**: RLS を有効にすると Realtime イベントが届かない（SUBSCRIBED はするが INSERT が来ない）。RLS を無効にすると動く。

**誤診**: JOIN ベースの複雑な RLS ポリシーが WALRUS（Realtime の RLS 評価エンジン）の再帰評価で失敗していると結論。`feed_items` に `user_id` を非正規化して JOIN を排除 → まだ動かない。

**本当の原因**: `@supabase/ssr` の `createBrowserClient` は Cookie ベース認証だが、**WebSocket 接続には Cookie が自動で載らない**。結果、Realtime の RLS 評価で `auth.uid()` が常に NULL を返していた。JOIN の複雑さは無関係。

**修正**: `supabase.realtime.setAuth(session.access_token)` を subscribe 前に呼ぶ。

**教訓**:
- 「動かない」のデバッグは**最も基本的な前提**（認証トークンが渡っているか）から検証する
- ポリシーの複雑さを疑う前に `auth.uid()` が正しい値を返しているか確認する
- HTTP と WebSocket は認証の仕組みが異なることを意識する

---

## 参照

- 前プロジェクト: [Lokup](https://github.com/ryuka-games/lokup) — GitHub リポジトリ健康診断ツール（Go）
