# Flum Design System — River UI

> 川に浮かぶ UI。ヘッダーもサイドバーもない。画面全体が川で、操作は水面に浮かんでいる。

## 設計原則

### 1. 画面全体が川（世界）

従来の Web アプリは「ヘッダー + サイドバー + コンテンツ」の三分割。
Flum は違う。**画面全体が川**。壁紙とフィードが川を構成し、UI 要素は川面に浮かぶ。

固定された構造物（ヘッダー、サイドバー）は存在しない。

### 2. 操作頻度で UI を分離する

| 頻度 | 操作 | UI パターン |
|------|------|------------|
| 毎回 | フィードを読む | 画面全体（川そのもの） |
| たまに | リフレッシュ、チャンネル切替 | Floating 要素（FAB、チャンネルレール） |
| 稀 | フィード追加・削除、壁紙、OPML | フルページ設定画面 |
| ほぼ一度 | ログアウト、アカウント | アバターメニュー（ポップオーバー） |

**Figma の教訓**: 軽い操作（一瞬クリック）は floating が正しい。重い操作（じっくり設定）は別画面。
Figma は全パネルを floating にして失敗し、2ヶ月で元に戻した。

### 3. メタファーに忠実

「川に浮かぶ」は装飾ではなくアーキテクチャ。

- FAB = 川面に浮かぶ石
- チャンネルレール = 川岸の杭
- フィードカード = 川を流れる情報
- 壁紙 = 川底

すべての UI 要素が同じ物理法則（浮遊、ボビング、水面からの出現）に従う。

## ドキュメント構成

| ファイル | 内容 |
|---------|------|
| [architecture.md](architecture.md) | レイアウト、CSS Grid、z-index、Popover API、Anchor Positioning |
| [floating-system.md](floating-system.md) | FAB、チャンネルレール、アバターメニューの設計 |
| [animation.md](animation.md) | 浮遊アニメーション、入場/退場、マイクロインタラクション |
| [accessibility.md](accessibility.md) | ARIA、キーボード、スクリーンリーダー、タッチターゲット |
| [responsive.md](responsive.md) | ブレークポイント、モバイル FAB、デスクトップレール、ボトムシート |
| [references.md](references.md) | 事例研究（Figma、Google Maps、Current 等）、ソース一覧 |

## 技術スタック

| 項目 | 選定 | 理由 |
|------|------|------|
| アニメーション | CSS `@keyframes` + `transition` | JS ライブラリ不要。既存の globals.css を拡張 |
| ドロップダウン | Popover API + CSS Anchor Positioning | JS ゼロ、top layer、containing block 問題なし |
| ボトムシート | Vaul | unstyled、Radix ベース、Tailwind 互換、shadcn/ui 採用実績 |
| レイアウト | CSS Grid（3カラム） | レールをガターに配置、fixed 不要で filter 問題を回避 |
| レスポンシブ | メディアクエリ + コンテナクエリ | レール/FAB 切替は MQ、コンポーネント適応は CQ |
