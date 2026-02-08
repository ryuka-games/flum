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

## 参照

- 前プロジェクト: [Lokup](https://github.com/ryuka-games/lokup) — GitHub リポジトリ健康診断ツール（Go）
