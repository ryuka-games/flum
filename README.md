# Flum

自分だけのタイムラインを、好きな情報源で作る。

## 概要

Flum は RSS フィードを「川の流れ」として体験するフィードリーダーです。情報は溜めずに流す。気になったものだけ Scoop（掬い上げ）して手元に残す。

既存の RSS リーダーが「未読を消化する」ストレスモデルなのに対し、Flum は「流れに身を置く」体験を目指しています。

名前の由来: Flume（水路）- e。情報がチャンネルを通じて流れるイメージ。

<!-- スクリーンショットをここに追加 -->

## コンセプト

- **情報は流れるもの** — 古い記事は時間とともに薄くなり、やがて消える
- **未読カウントなし** — 読み逃しという概念がない。開いたときが「今」
- **Scoop** — 流れの中から掬い上げた記事だけが永続的に残る
- **チャンネル** — 自分の関心に合わせて情報の水路を作る

## 主な機能

- **チャンネル管理** — カテゴリごとにフィードを整理
- **RSS ソース登録** — プリセットからワンクリック、または URL 直接入力
- **OGP カード表示** — 画像 + 説明文で記事を流し見できる
- **時間減衰** — 記事の鮮度が視覚的にわかる（古い記事は薄くなる）
- **Scoop** — 流れから掬い上げた記事を永続保存
- **自動リフレッシュ** — 30 分ごとに新着を取得（条件付きリクエスト対応）
- **共有** — X / LINE / URL コピー
- **GitHub OAuth ログイン** — Supabase Auth による認証

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript 5 |
| スタイリング | Tailwind CSS v4 |
| バックエンド | Supabase (PostgreSQL, Auth) |
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
│   │   └── scoops/     # Scoops（掬い上げた記事）
│   ├── actions/        # Server Actions
│   └── login/          # ログインページ
├── components/         # UI コンポーネント
└── lib/
    ├── feed/           # RSS/OGP フェッチ
    └── supabase/       # Supabase クライアント
```

## 関連プロジェクト

- [Lokup](https://github.com/ryuka-games/lokup) — GitHub リポジトリ健康診断ツール（Go）
