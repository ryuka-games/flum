# 経年劣化システム（Decay System）仕様書

> 最終更新: 2026-02-18 / 現行バージョン: v5 (カラードレイン)

## 1. 概要

フィードカードの「鮮度」を視覚的に表現するシステム。
古い記事ほど色を失い、冷たく、透明になっていく。ホバーで瞬時にフルカラー復活。

**一言で**: 色 = エネルギー。失われた色がホバーで戻る = カラーフラッシュ。

---

## 2. 設計思想

### 根本原則

- **UI は絶対に汚れない** — 物理的ダメージ（穴・ひび・マスク）は使わない
- **色がエネルギーを表す** — フルカラー = 生きている、モノクロ = 消えかけている
- **差は劇的に** — subtle ではなく dramatic。stale はほぼ完全モノクロ
- **ホバーで復活** — 触ると一瞬でフルカラーが戻る（カラーフラッシュ）
- **コンテンツは常に読める** — テキストの可読性は全ステージで保証

### リファレンスゲーム

| ゲーム | 学んだこと |
|--------|----------|
| **ドーナドーナ** (Alicesoft) | UI は絶対に汚れない。ダメージはエフェクトレイヤーで。段階的物理劣化は存在しない |
| **Splatoon** (Nintendo) | Splattercolor Screen: 彩度剥奪 = 弱体化。ポップな世界で「色を奪う」が最も直感的 |
| **Persona 5** (Atlus) | 日常=低彩度/パレス=高彩度。彩度+色温度シフトで感情状態を表現。UI は常にクリーン |
| **Hi-Fi Rush** (Tango) | パルス = 生きている感。動いているものにエネルギーがある |
| **Danganronpa** (Spike) | ピンクの血 = 暴力をポップに変換。瞬間的破壊はあるが段階的劣化はない |

### なぜ「カラードレイン」に至ったか（v1〜v4 の失敗から）

| ver | アプローチ | 結果 | 学び |
|-----|----------|------|------|
| v1 | SVG grunge（侵食・ひび割れ・カスレ等 6層エフェクト） | 西洋グランジ。ドーナドーナと正反対 | 物理的劣化は日本ポップと合わない |
| v2 | 彩度 + 不透明度のみ（控えめ: stale で saturate 0.55） | 正しい方向だが退屈。差が小さすぎ | 「ちょっと暗い」程度では認知的に「古い」と感じない |
| v3 | ランダム丸穴 + シアン縁取り + ピンクハーフトーン | 「ただ丸が並んでるだけ」 | ランダムな穴に連続性・方向性・グラデーションがない |
| v4 | ハーフトーン dissolve（均一→方向性マスク合成） | ダーク背景上で「テクスチャ」にしか見えない | CSS mask によるカード表面の物理的破壊は、どう工夫しても「テクスチャ」として認知される |
| **v5** | **カラードレイン（CSS filter + 色温度シフト + 非対称トランジション）** | **採用** | Splatoon/Persona 5 が証明: 色の変化だけで状態を劇的に表現できる |

**根本的な学び**: CSS で「カード表面が物理的に壊れていく」を表現しようとすること自体が、ダーク UI 上では機能しない。ソースマテリアル（ドーナドーナ）にも段階的物理ダメージは存在しない。色の変化こそが最もクリーンで効果的な方法。

---

## 3. 鮮度ステージ

記事の経過時間で 5 段階に分類。

| ステージ | 経過時間 | 状態 |
|---------|---------|------|
| `fresh` | < 1時間 | フルカラー。ピンクのパルスアニメーション（2回） |
| `recent` | 1〜6時間 | わずかに彩度低下 |
| `aging` | 6〜12時間 | 彩度低下 + 寒色シフト開始 |
| `old` | 12〜24時間 | 大幅に彩度低下 + 明確な寒色シフト |
| `stale` | 24時間超 | ほぼモノクロ + 強い寒色シフト + グリッチ |

`publishedAt` が null の場合は `stale` として扱う。

---

## 4. パラメータ詳細

### CSS filter（色の変化）

| ステージ | saturate | brightness | sepia | hue-rotate | opacity |
|---------|----------|-----------|-------|-----------|---------|
| fresh | 1.0 | 1.0 | — | — | 1.0 |
| recent | 0.85 | 0.97 | — | — | 0.95 |
| aging | 0.45 | 0.92 | 0.15 | 190deg | 0.8 |
| old | 0.15 | 0.85 | 0.25 | 190deg | 0.65 |
| stale | 0.05 | 0.78 | 0.3 | 200deg | 0.5 |

**寒色シフトの仕組み**: `sepia()` で暖色トーンを作り、`hue-rotate(190deg)` で寒色に回転。
結果として青みがかった冷たい色調になる。Persona 5 の「日常世界の灰色」と同じ発想。

### ホバーシャドウの色温度（Persona 5 式）

| ステージ | シャドウ色 | CSS 変数 | 意味 |
|---------|----------|---------|------|
| fresh | ピンク | `--accent-pink` | 熱い、エネルギーがある |
| recent | ピンク | `--accent-pink` | まだ暖かい |
| aging | パープル | `--accent-purple` | 冷え始め |
| old | シアン | `--accent-cyan` | 冷たい |
| stale | ダークブルー | `--old-color` | ほぼ消失 |

### 非対称トランジション（Splatoon 式）

- **色を失う方向**: `transition: 1.2s ease-out` — ゆっくり
- **ホバー復帰**: `transition: 0.08s ease-out` — 瞬間

0.08s = 人間が「瞬時」と感じる閾値。Splatoon の Splattercolor Screen が解除されたときの「色が戻る快感」を再現。

### fresh パルス（Hi-Fi Rush 式）

- 1時間以内の記事のみ
- ピンクの `box-shadow` が 1.5s かけて 2回パルス
- `animation-iteration-count: 2` — ループしない
- `prefers-reduced-motion: reduce` で無効化

### グリッチ（stale のみ）

- 5秒に1回、シアン+ピンクの `text-shadow` + 微細な `translateX` + `skewX`
- 94%→95% の 0.25s だけ発動（一瞬のノイズ）
- `prefers-reduced-motion: reduce` で無効化

---

## 5. ファイル構成

```
src/lib/decay.ts           — 型定義、鮮度判定、スタイル計算
src/components/feed-item.tsx — カードコンポーネント（decay スタイル適用）
src/app/globals.css         — ホバー復帰ルール、パルス、グリッチ keyframes
```

### `src/lib/decay.ts`

| エクスポート | 役割 |
|------------|------|
| `FreshnessStage` | `"fresh" \| "recent" \| "aging" \| "old" \| "stale"` |
| `DecayStyle` | filter, opacity, shadowColor, className, freshness |
| `getFreshnessStage()` | publishedAt + now → ステージ判定 |
| `getDecayStyle()` | publishedAt + now → DecayStyle \| null |

### `src/components/feed-item.tsx`

- `getDecayStyle()` でスタイルを取得
- `data-decay="true"` — decay が適用されているカード（CSS ルールのセレクタ）
- `data-freshness="fresh|recent|..."` — 鮮度ステージ（fresh パルスのセレクタ）
- `--decay-shadow` CSS 変数 — ホバーシャドウの色をインラインで渡す
- `noDecay` prop — Scoops ページ等で劣化を無効にする

### `src/app/globals.css`

| ルール | 役割 |
|-------|------|
| `[data-decay="true"]` | 非対称トランジション（色失い 1.2s） |
| `[data-decay="true"]:hover` | 瞬間復帰（0.08s）+ filter/opacity リセット |
| `[data-freshness="fresh"]` | fresh パルスアニメーション |
| `.glitch-text` | stale のグリッチエフェクト |
| `@media (prefers-reduced-motion)` | アニメーション無効化 |

---

## 6. データフロー

```
記事の publishedAt
    ↓
getFreshnessStage(publishedAt, now)
    ↓
FreshnessStage ("fresh" | "recent" | "aging" | "old" | "stale")
    ↓
DECAY_STAGES[stage]  →  DecayStyle | null
    ↓
FeedItem コンポーネント
    ├─ style={{ filter, opacity, --decay-shadow }}  (インライン)
    ├─ data-decay="true"                            (CSS トランジション用)
    ├─ data-freshness="..."                         (fresh パルス用)
    └─ className に glitch-text                     (stale グリッチ用)
    ↓
globals.css のルールがホバー復帰・パルス・グリッチを処理
```

---

## 7. 調整ガイド

### 色の減衰を変えたい

`src/lib/decay.ts` の `DECAY_STAGES` を編集。

- **もっとドラスティックに**: saturate の値を下げる（0 に近いほどモノクロ）
- **もっと控えめに**: saturate の値を上げる
- **寒色シフトの強さ**: sepia と hue-rotate の値を調整
  - sepia を上げると色が付く / hue-rotate で色相を回す
  - `sepia(0.3) hue-rotate(200deg)` = 青みがかった冷たい色
  - hue-rotate を変えると別の色味に（例: 170deg でもっと緑寄り）

### トランジション速度を変えたい

`src/app/globals.css` を編集。

- **色を失う速さ**: `[data-decay="true"]` の `transition` duration
- **ホバー復帰の速さ**: `[data-decay="true"]:hover` の `transition` duration
- 0.08s が「瞬間」、0.3s が「スムーズ」、1.0s+ が「ゆっくり」

### 鮮度の時間区分を変えたい

`src/lib/decay.ts` の `getFreshnessStage()` の閾値を変更。

```typescript
if (ageHours < 1) return "fresh";    // ← ここの数値
if (ageHours < 6) return "recent";
if (ageHours < 12) return "aging";
if (ageHours < 24) return "old";
return "stale";
```

### fresh パルスを変えたい

`src/app/globals.css` の `@keyframes fresh-pulse` を編集。

- **強さ**: `box-shadow` の spread と opacity を変更
- **速さ**: animation duration を変更（現在 1.5s）
- **回数**: `animation: ... 2` の数値を変更（現在 2回）
- **消したい**: `[data-freshness="fresh"]` ルールをコメントアウト

### 特定のページで劣化を無効にしたい

`FeedItem` に `noDecay` prop を渡す。Scoops ページで使用中。

---

## 8. Scoops（お気に入り）との関係

Scoops ページでは `noDecay={true}` で劣化を無効化。
お気に入りに保存した記事は「永続保存」なので、時間経過で色あせるのは意味的に矛盾する。

---

## 9. アクセシビリティ

- `prefers-reduced-motion: reduce` でパルスとグリッチアニメーションを無効化
- filter による色変化はアニメーションではないので `reduced-motion` の対象外
- テキストの可読性は全ステージで保証（opacity 0.5 でもダーク背景上で十分なコントラスト）

---

## 10. 既知の制約・将来の検討事項

- **パラメータの微調整**: 現在の値はリサーチベースの初期値。実際の使用感を見ながら調整予定
- **ライトテーマでの見え方**: 現在のパラメータはダークテーマ前提。ライトテーマでは寒色シフトの見え方が変わる可能性
- **画像への影響**: filter はカード全体に適用されるため、OGP 画像も一緒に彩度が落ちる。これは意図的（カード全体の「エネルギー」を表現）
- **パフォーマンス**: CSS filter は GPU アクセラレーション対象。大量のカードでも問題なし
