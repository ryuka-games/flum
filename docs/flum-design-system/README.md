# Flum Design System — River UI

> 川に浮かぶ UI。ヘッダーもサイドバーもない。画面全体が川で、操作は水面に浮かんでいる。

## ドキュメント構成

| ファイル | 内容 |
|---------|------|
| [tokens.md](tokens.md) | CSS カスタムプロパティ一覧（globals.css から抽出） |
| [components.md](components.md) | Float System クラス、Decay、アニメーション、背景デコ |
| [colors.md](colors.md) | カラーパレット + ドーナドーナとの対応 |
| [architecture.md](architecture.md) | CSS Grid、z-index、containing block、レスポンシブ |
| [references.md](references.md) | 事例研究、ソース一覧 |

## 設計原則

### 1. 画面全体が川

固定された構造物（ヘッダー、サイドバー）は存在しない。壁紙とフィードが川を構成し、UI 要素は川面に浮かぶ。

### 2. 操作頻度で UI を分離

| 頻度 | 操作 | UI パターン |
|------|------|------------|
| 毎回 | フィードを読む | 画面全体（川そのもの） |
| たまに | リフレッシュ、チャンネル切替 | Floating 要素（FAB、レール） |
| 稀 | フィード追加・削除、壁紙 | 設定パネル |
| ほぼ一度 | ログアウト | アバターメニュー |

### 3. メタファーに忠実

- FAB = 川面に浮かぶ石
- チャンネルレール = 川岸の杭
- フィードカード = 川を流れる情報
- 壁紙 = 川底

## 技術スタック

| 項目 | 選定 |
|------|------|
| アニメーション | CSS `@keyframes` + `transition` |
| ポジショニング | @floating-ui/react |
| レイアウト | CSS Grid 3カラム |
