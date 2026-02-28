# Tokens — CSS カスタムプロパティ一覧

> `src/app/globals.css` から抽出。全トークンはここに集約。

## アクセントカラー（`:root`、テーマ問わず固定）

| 変数 | 値 | 用途 |
|------|-----|------|
| `--accent-pink` | `#ff3b9a` | シグネチャーカラー。fresh パルス、Scoop ピン |
| `--accent-pink-light` | `#ff6bc1` | recent ステージのシャドウ |
| `--accent-purple` | `#a855f7` | セカンダリ。aging シャドウ |
| `--accent-yellow` | `#ffdd00` | ターシャリ。ハイライト |
| `--accent-cyan` | `#00e5ff` | アクションホバー、Float System グロー |

## 鮮度カラー（`:root`）

| 変数 | 値 | 用途 |
|------|-----|------|
| `--fresh-color` | `#ff3b9a` | fresh ステージのインジケーター色 |
| `--fresh-glow` | `0 0 10px ...` | fresh パルスの box-shadow |
| `--recent-color` | `#ff6bc1` | recent ステージ |
| `--recent-glow` | `0 0 6px ...` | recent グロー |
| `--aging-color` | `#ffdd00` | aging ステージ |
| `--aging-glow` | `0 0 6px ...` | aging グロー |

## Float System トークン（`:root`）

| 変数 | 値 | 用途 |
|------|-----|------|
| `--glow-cyan-subtle` | `rgba(0,229,255,0.08)` | 静止時のシアン反射光 |
| `--glow-cyan-soft` | `rgba(0,229,255,0.12)` | ホバー時の中間グロー |
| `--glow-cyan-medium` | `rgba(0,229,255,0.18)` | ホバー時の強グロー |
| `--lift-sm` | `-2px` | ボタン・アイコンのホバー浮上量 |
| `--lift-md` | `-3px` | カードのホバー浮上量 |
| `--scale-sm` | `1.08` | ボタン・アイコンのホバー拡大 |
| `--scale-md` | `1.01` | カードのホバー拡大 |
| `--ease-float` | `0.2s ease-out` | 浮遊トランジション速度 |
| `--ease-decay-slow` | `1.2s ease-out` | ドレイン（色が失われる）速度 |
| `--ease-decay-fast` | `0.08s ease-out` | カラーフラッシュ（色が戻る）速度 |
| `--spring` | `cubic-bezier(0.34,1.56,0.64,1)` | バウンスカーブ |
| `--neo-sm/md/lg` | `Npx Npx 0 cyan` | ネオブルータリスト影（2/3/4px） |
| `--float-amplitude` | `3px` | 水面ボブ振幅 |

## ダークテーマカラー（`:root, [data-theme="dark"]`）

| 変数 | 値 | 用途 |
|------|-----|------|
| `--river-deep` | `#0a0a10` | 最深部背景 |
| `--river-bg` | `#101018` | メイン背景 |
| `--river-surface` | `#18182a` | カード表面、ホバー背景 |
| `--river-border` | `#2a2a40` | 区切り線 |
| `--text-primary` | `#e8e8f0` | メインテキスト |
| `--text-secondary` | `#8888a8` | セカンダリテキスト |
| `--text-muted` | `#606078` | ミュートテキスト |
| `--text-faded` | `#404058` | 最薄テキスト |
| `--old-color` | `#1e3a58` | old ステージのシャドウ色 |
| `--stale-color` | `#0f1f38` | stale ステージのシャドウ色 |
| `--glass-bg` | `rgba(0,0,0,0.95)` | フロストガラス背景 |
| `--glass-overlay` | `rgba(0,0,0,0.50)` | 壁紙オーバーレイ |

## Tailwind テーマトークン（`@theme inline`）

| Tailwind クラス | CSS 変数 | マップ先 |
|----------------|---------|---------|
| `bg-river-deep` | `--color-river-deep` | `--river-deep` |
| `bg-river-bg` | `--color-river-bg` | `--river-bg` |
| `bg-river-surface` | `--color-river-surface` | `--river-surface` |
| `border-river-border` | `--color-river-border` | `--river-border` |
| `text-neon-pink` | `--color-neon-pink` | `--accent-pink` |
| `text-neon-pink-light` | `--color-neon-pink-light` | `--accent-pink-light` |
| `text-neon-purple` | `--color-neon-purple` | `--accent-purple` |
| `text-neon-yellow` | `--color-neon-yellow` | `--accent-yellow` |
| `text-neon-cyan` | `--color-neon-cyan` | `--accent-cyan` |
| `text-int-accent` | `--color-int-accent` | `--accent-cyan` |
| `text-int-danger` | `--color-int-danger` | `#f87171` |
| `shadow-neo-sm/md/lg` | `--shadow-neo-*` | ネオブルータリスト影 |
