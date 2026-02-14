# Flum

Discord 風チャンネル UI のリアルタイムフィードリーダー。

## 概要

RSS フィードをチャンネルごとに整理し、リアルタイムで新着記事を受信するフィードリーダーです。Feedly の整理力と Discord のリアルタイム感を両立します。

名前の由来: Flume（水路）から e を引いた造語。情報がチャンネルを通じて流れるイメージ。

<!-- スクリーンショットをここに追加 -->

## 主な機能

- **GitHub OAuth ログイン** — Supabase Auth による認証
- **チャンネル管理** — カテゴリごとにフィードを整理
- **RSS ソース登録** — チャンネルに RSS/Atom/JSON Feed を紐づけ
- **リアルタイム更新** — Supabase Realtime で新着記事を即時表示
- **OGP カード表示** — 画像 + 説明文で記事を流し見できる
- **お気に入り保存** — 気になった記事を永続的に保存
- **共有** — X / LINE / URL コピー（Intent URL パターン）
- **サイドバー折りたたみ** — 画面を広く使える

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript 5 |
| スタイリング | Tailwind CSS v4 |
| バックエンド | Supabase (PostgreSQL, Auth, Realtime) |
| RSS パース | [feedsmith](https://github.com/nickvdyck/feedsmith) |
| ホスティング | Vercel + Supabase Cloud |

## セットアップ

```bash
git clone https://github.com/ryuka-games/flum.git
cd flum
npm install
cp .env.example .env.local
npm run dev
```

### 環境変数

`.env.local` に以下を設定:

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の Publishable Key (anon) |

### Supabase 側の準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Auth > Providers で GitHub OAuth App を設定
3. `supabase/migrations/` 内の SQL をマイグレーション順に実行

## プロジェクト構成

```
src/
├── app/
│   ├── (app)/          # 認証済みレイアウト
│   │   ├── channels/   # チャンネル詳細
│   │   └── favorites/  # お気に入り一覧
│   ├── actions/        # Server Actions
│   └── login/          # ログインページ
├── components/         # UI コンポーネント
└── lib/
    ├── feed/           # RSS/OGP フェッチ
    └── supabase/       # Supabase クライアント
```

## 関連プロジェクト

- [Lokup](https://github.com/ryuka-games/lokup) — GitHub リポジトリ健康診断ツール（Go）
