# Feed Card

> 川を流れる情報。Flum のコア体験。Decay（経年劣化）、Float System、入場アニメーションが統合されたコンポーネント。

## 見た目

- 形状: `rounded-2xl`（16px）
- 背景: `bg-[var(--glass-bg)]`（`rgba(0,0,0,0.95)`）+ `backdrop-blur-md`
- 影: ネオブルータリスト `3px 3px 0` + 鮮度色（`--decay-shadow`）
- パディング: デスクトップ `p-6`、モバイル `p-4`

## クラスバンドル

```html
<article
  class="card-float group relative overflow-hidden rounded-2xl
         bg-[var(--glass-bg)] backdrop-blur-md"
  data-decay="true"
  data-freshness="fresh"
  data-card-enter
  style="--decay-filter: ...; --decay-opacity: ...; --decay-shadow: ...; --enter-delay: 0ms;"
>
  <div class="card-content overflow-hidden rounded-2xl">
    <!-- カード内容 -->
  </div>
</article>
```

必須クラス:
- `card-float` — 影 + ホバーリフト + transition 統合管理
- `group` — 子要素の `group-hover:` 用
- `rounded-2xl` — 角丸
- `bg-[var(--glass-bg)] backdrop-blur-md` — フロストガラス

必須子要素:
- `.card-content` — Decay の `filter`/`opacity` 適用先。`box-shadow`（鮮度影）が filter の影響を受けないよう分離

## バリアント

### Decay カード（フィード記事）

標準。`data-decay="true"` で経年劣化が有効。

### Non-Decay カード（Scoops）

`noDecay` prop で `data-decay` なし。影は固定ピンク、filter/opacity 変化なし。

## 状態

| 状態 | 変化 |
|------|------|
| default | 鮮度に応じた影色 + filter + opacity |
| hover | リフト(`--lift-md: -3px`) + スケール(`--scale-md: 1.01`) + シアングロー追加 + Decay 瞬時復帰 |
| selected (`data-selected`) | hover と同じ（キーボードナビ用） |
| entering (`data-card-enter`) | `card-pop` アニメーション（350ms spring） |

### Decay ステージ別の見た目

| ステージ | 経過時間 | 影色 (`--decay-shadow`) | filter | opacity |
|---------|---------|----------------------|--------|---------|
| fresh | < 1h | `--accent-pink` (#ff3b9a) | なし | 1.0 |
| recent | 1-6h | `--accent-pink-light` (#ff6bc1) | `saturate(0.85) brightness(0.97)` | 0.95 |
| aging | 6-12h | `--accent-yellow` (#ffdd00) | `saturate(0.45) brightness(0.92) sepia(0.15) hue-rotate(190deg)` | 0.8 |
| old | 12-24h | `--old-color` (#1e3a58) | `saturate(0.15) brightness(0.85) sepia(0.25) hue-rotate(190deg)` | 0.65 |
| stale | 24h+ | `--stale-color` (#0f1f38) | `saturate(0.05) brightness(0.78) sepia(0.3) hue-rotate(200deg)` | 0.5 |

### ホバー復帰（カラーフラッシュ）

- Decay → hover: `0.08s`（瞬時復帰）。`filter: none; opacity: 1;`
- hover → Decay: `1.2s`（ゆっくり色を失う）
- 非対称トランジションが「色が戻る快感」を生む（Splatoon のインク表現）

## インタラクションカラー

カード内のボタンに適用:

| 要素 | ホバー色 | 理由 |
|------|---------|------|
| タイトルリンク | N/A（カード全体がクリッカブル） | — |
| 共有ボタン | `hover:text-int-accent`（シアン） | アクション |
| Scoop ピン（未保存） | `hover:text-neon-pink` | 保存 |
| Scoop ピン（保存済み） | `hover:text-[var(--text-muted)]`（解除方向） | 破壊寄り |

## レスポンシブ

| | デスクトップ | モバイル |
|---|---|---|
| パディング | `p-6` | `p-4` |
| ホバー | リフト + シアングロー + Decay 復帰 | 無効（`@media (hover: none)`） |
| プレビュー | 右側ポップオーバー（Floating UI） | カードスワイプ（表裏切替） |
| Decay filter | 有効 | 無効（opacity のみ、下限 0.6） |

### モバイルのホバー抑制

```css
@media (hover: none) {
  .card-float:hover:not([data-selected]) {
    translate: none;
    scale: none;
    /* タップで :hover が発火し浮き上がるのを防止 */
  }
}
```

## アニメーション

### 入場: card-pop

```css
@keyframes card-pop {
  0%   { opacity: 0; transform: scale(0.92) translateY(8px); }
  50%  { opacity: 1; transform: scale(1.03) translateY(-2px); }
  100% { opacity: 1; transform: none; }
}
```

- 350ms、spring カーブ
- `--enter-delay` で 120ms 刻みのスタガー（最初の 6 件のみ）
- `transform` を使用（`translate`/`scale` 個別プロパティはホバーリフト用に温存）

### fresh パルス

```css
@keyframes fresh-pulse {
  50% { box-shadow: 0 0 8px 4px rgba(255, 59, 154, 0.3); }
}
```

- 1.5s × 2回
- 入場ありの場合: card-pop 終了後に直列再生
- 入場なしの場合: 即時再生

### stale グリッチ

- `.glitch-text` クラスをタイトルに適用
- 3.5s サイクル、シアン+ピンクの text-shadow + translateX + skewX

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/feed-item.tsx` | フィードカード本体 |
| `src/components/feed-item-list.tsx` | カードリスト + タイムグループ区切り |

## 注意点

- **transition 統合管理**: CSS の `transition` はマージされない。`card-float` / `card-float[data-decay]` / `.card-content` で一括定義。個別に transition を足すと上書きされる
- **`transform` vs `translate`/`scale`**: card-pop は `transform` を使い、ホバーリフトは `translate`/`scale` 個別プロパティを使う。独立なので競合しない
- **`.card-content` 分離**: Decay の `filter` を `.card-content` に適用し、`box-shadow`（鮮度影）は `card-float` に残す。filter は box-shadow にも影響するため
- **`backdrop-blur-md`**: containing block を生成。カード内に `fixed` 要素を置かないこと
- **画像**: `w-full rounded-xl` のみ。`object-cover` + 固定高さは使わない（アスペクト比を壊す）
