# Tooltip

> 水面に浮かぶ吹き出し。ホバーで表示される補足情報。デスクトップ専用。

## 見た目

- 形状: `rounded-xl`
- 背景: `bg-river-deep`
- ボーダー: `border-2 border-neon-pink`
- 影: `shadow-[2px_2px_0_var(--accent-cyan)]`（ネオブルータリスト sm）
- テキスト: `text-xs font-semibold text-[var(--text-primary)]`
- 最大幅: `max-w-[200px]`

## クラスバンドル

```html
<div class="tooltip-pop z-50
            rounded-xl border-2 border-neon-pink bg-river-deep
            px-3 py-1.5
            shadow-[2px_2px_0_var(--accent-cyan)]"
     style="position: absolute; top: ...; left: ...;"
     role="tooltip">
  <span class="block max-w-[200px] break-all text-xs
               font-semibold text-[var(--text-primary)]">
    ツールチップテキスト
  </span>
</div>
```

必須クラス:
- `tooltip-pop` — 入場アニメーション（200ms spring scale）
- `border-2 border-neon-pink` — ネオブルータリストボーダー
- `shadow-[2px_2px_0_var(--accent-cyan)]` — ネオブルータリスト影

## バリアント

バリアントなし。配置（上/下/左/右）は Floating UI の `placement` prop で制御。

## 状態

| 状態 | 変化 |
|------|------|
| hidden | 非表示（DOM に存在しない） |
| entering | `tooltip-pop` アニメーション（200ms） |
| visible | 静的表示 |

## アニメーション

```css
@keyframes tooltip-pop {
  0%   { opacity: 0; scale: 0.9; }
  50%  { opacity: 1; scale: 1.04; }
  100% { opacity: 1; scale: 1; }
}
```

- 200ms、spring カーブ（`--spring`）
- card-pop のミニ版

### グループディレイ

- 初回表示: 150ms の遅延（意図しないホバーを防止）
- 連続ホバー（300ms 以内）: 遅延なしで即表示
- ツールチップ間を素早く移動する UX を改善

## インタラクションカラー

ツールチップ自体にインタラクションカラーはない（情報表示のみ）。

## レスポンシブ

- **デスクトップ専用**。`@media (hover: none)` で `display: none`
- モバイルではツールチップは表示されない（タップ = アクション、ツールチップは邪魔）

## Floating UI 設定

```typescript
{
  placement: 'top',        // デフォルト。コンポーネントで変更可能
  middleware: [
    offset(8),             // 8px の間隔
    flip(),                // 画面端で反転
    shift({ padding: 8 }), // 画面端でずらし
  ],
  transform: false,        // top/left で配置（CSS transform を使わない）
}
```

`transform: false` にしているのは、containing block 問題を回避するため。

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/tooltip.tsx` | 汎用ツールチップコンポーネント |
| `src/components/channel-rail.tsx` | チャンネル名ツールチップ |
| `src/components/channel-settings-panel.tsx` | 設定項目説明 |
| `src/components/refresh-button.tsx` | "リフレッシュ" ラベル |
| `src/components/feed-presets.tsx` | エラー時ツールチップ |

## 注意点

- `transform: false` は必須。Floating UI のデフォルトは CSS `transform` で配置するが、親要素に `filter` や `transform` があると位置がずれる（containing block 問題）
- `break-all` は長い URL がツールチップを横に伸ばすのを防止
- `z-50` で FlowLine と同じ最上位レイヤー
- アクセシビリティ: `role="tooltip"` + `aria-describedby`（トリガー側）
