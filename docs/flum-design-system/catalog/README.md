# Component Catalog

> River UI の全コンポーネント仕様。実装の参照仕様として使う。

## コンポーネント一覧

| コンポーネント | ファイル | 説明 |
|---|---|---|
| [Float Button](float-button.md) | 各所 | FAB・アイコンボタン（設定ギア、リフレッシュ、コピー等） |
| [Action Button](action-button.md) | 各所 | テキスト付きボタン（作成、削除、送信、ログイン等） |
| [Feed Card](feed-card.md) | `feed-item.tsx` | フィードカード（Decay・Float・入場アニメ統合） |
| [Side Panel](side-panel.md) | `side-panel.tsx` | 右サイドパネル / モバイルボトムシート |
| [Bottom Sheet](bottom-sheet.md) | `mobile-menu-fab.tsx`, `share-button.tsx` | モバイル専用ボトムシート |
| [Nav Link](nav-link.md) | `channel-rail.tsx`, `mobile-menu-fab.tsx` | チャンネルリンク・Scoops リンク |
| [Chip](chip.md) | `channel-settings-panel.tsx` | ソースチップ・プリセットチップ・キーワードタグ |
| [Form Input](form-input.md) | `channel-settings-panel.tsx`, `channel-rail.tsx` | テキスト入力・URL入力 |
| [Tooltip](tooltip.md) | `tooltip.tsx` | ホバーツールチップ（Floating UI） |
| [Channel Rail](channel-rail.md) | `channel-rail.tsx` | 左ガター縦ナビ（デスクトップ専用） |
| [Flow Line](flow-line.md) | `flow-line.tsx` | 画面上端プログレスバー |
| [Avatar](avatar.md) | `avatar-menu.tsx`, `mobile-menu-fab.tsx` | アバター表示（画像 / イニシャル fallback） |
| [Wallpaper](wallpaper.md) | `wallpaper-layer.tsx`, `wallpaper-picker.tsx` | 壁紙レイヤー + River at Night デフォルト背景 |

## カラーシステム（ダークテーマ）

River UI は独自のカラーシステムを持つ。インスピレーション源はドーナドーナ（Alicesoft, 2020）のポップアート色彩だが、River UI として再定義している。

### カラーロール

| ロール | CSS 変数 | 値 | 用途 |
|---|---|---|---|
| **プライマリ** | `--accent-pink` | `#ff3b9a` | シグネチャーカラー。鮮度（fresh）、Scoop、アクティブ状態、ボーダー |
| **セカンダリ** | `--accent-purple` | `#a855f7` | 鮮度（aging shadow）、FlowLine グラデーション |
| **ターシャリ** | `--accent-yellow` | `#ffdd00` | 鮮度（aging）、ハイライト |
| **アクション** | `--accent-cyan` | `#00e5ff` | Float System グロー、ホバーアクセント、ネオブルータリスト影 |
| **背景（深）** | `--river-deep` | `#0a0a10` | パネル背景、最深部 |
| **背景（標準）** | `--river-bg` | `#101018` | メイン背景 |
| **背景（浮上）** | `--river-surface` | `#18182a` | カード表面、ホバー背景 |

### シアンの特別な位置付け

シアンは River UI の独自色。ドーナドーナではターシャリだったが、Flum では「川の光」として**アクション専用色**に昇格した。Float System のグロー、ネオブルータリスト影、ホバーアクセントすべてがシアン。水のメタファーを視覚的に一貫させる役割。

### インスピレーション: ドーナドーナとの関係

色選びはドーナドーナのポップアート色彩に影響を受けているが、River UI として再解釈している:

| ドーナドーナ | River UI での変化 |
|---|---|
| ホットピンク — UI 全体のアクセント | プライマリ — 鮮度・保存・アクティブに意味を限定 |
| ディープブラック (#222) — 都市の夜 | リバーディープ (#0a0a10) — さらに深い「川底」の闇 + 青み |
| フラット背景 | 青紫を帯びた背景階層（deep/bg/surface の 3段） |
| シアン — 補助的 | シアン — アクション専用色に昇格（水のメタファー） |

受け継いだ設計原則:
- **中間トーンなし**: ダーク → ビビッドへ直接ジャンプ。「光っている」知覚
- **色温度ミックス**: 暖色（ピンク）+ 寒色（シアン）の共存
- **1つの支配的アクセント**: ピンクを規律を持って使い、他は控えめ
- **フラットカラーブロック**: グラデーションなし（FlowLine 除く）
- **UI は絶対に汚れない**: ダメージはエフェクトレイヤー（Decay の filter/opacity）で処理

### ライトテーマ（未実装）

現在はダークテーマ一本。方向性として「朝/昼の川」+ ドーナドーナの明るいシーンの色合いを想定。ダークテーマが完成した上で要望があれば検討。

詳細: [colors.md](../colors.md)

---

## 読み方

各ドキュメントは以下のセクションで構成:

- **見た目** — 形状・色・影
- **クラスバンドル** — 必ずセットで使うクラスの組み合わせ
- **バリアント** — サイズ・用途別のバリエーション
- **状態** — default / hover / active / disabled の変化
- **インタラクションカラー** — CLAUDE.md のルールに基づく hover 色
- **レスポンシブ** — モバイル / デスクトップでの差異
- **使用箇所** — 実際のファイルパス
- **注意点** — 既知の罠・制約

## 参照

- [classes.md](../classes.md) — CSS クラス・エフェクトのチートシート
- [tokens.md](../tokens.md) — CSS カスタムプロパティ
- [colors.md](../colors.md) — カラーパレット
- [architecture.md](../architecture.md) — レイアウト・レスポンシブ
