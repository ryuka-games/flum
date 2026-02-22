# Flum ビジュアルデザイン仕様書

> 最終更新: 2026-02-21

## 1. デザインの柱

Flum のビジュアルは3つの柱で構成される。

| 柱 | 概要 | ドキュメント |
|----|------|------------|
| **テーマカラー** | Neon Pop × Blue River。ダーク背景にビビッドアクセント | 本ドキュメント §2 |
| **経年劣化（Decay）** | 時間経過で色が失われ、ホバーで復活する | [decay-system-spec.md](./decay-system-spec.md) |
| **背景レイヤー** | 壁紙 / デフォルト背景 / フロストガラスの3層構成 | 本ドキュメント §4-6 |

フローライン（FlowLine）の仕様は [flow-line-spec.md](./flow-line-spec.md) を参照。

---

## 2. カラーシステム

### Neon Pop × Blue River

背景は「川」（blue river = ダーク近黒）、コンテンツは「流れる情報」（neon pop = ビビッドアクセント）。

```
背景レイヤー:  --river-deep   #0a0a10  （サイドバー、ヘッダー）
               --river-bg     #101018  （メイン背景）
               --river-surface #18182a  （ホバー、カード表面）
               --river-border #2a2a40  （区切り線）

アクセント:    --accent-pink   #ff3b9a  （シグネチャー。シャドウ、fresh パルス）
               --accent-purple #a855f7  （セカンダリ。フローライン中間色）
               --accent-yellow #ffdd00  （ターシャリ。ハイライト）
               --accent-cyan   #00e5ff  （ターシャリ。冷色アクセント）
```

### 設計原則

1. **中間トーンなし** — ダーク背景からビビッドカラーへ直接ジャンプ。灰色の中間がない = 「光っている」知覚
2. **色温度ミックス** — 暖色（ピンク）+ 寒色（シアン）の共存
3. **1つの支配的アクセント** — ピンクを規律を持って使い、イエロー/シアンは控えめに
4. **テーマ別の変数** — ダーク/ライト両対応。ライトテーマでもサイドバーはダーク維持

### ドーナドーナとの関係

Flum のネオンポップ美学は [ドーナドーナ（Alicesoft, 2020）](https://www.alicesoft.com/dohnadohna/) のデザイン言語を参照している。

**採用した要素:**
- 太ボーダー + 大きめ丸角（`rounded-2xl`）= 日本ポップの核心
- ソリッドオフセットシャドウ（ぼかしゼロ）
- フラットカラーブロック（グラデーションなし）
- UI は絶対に汚れない（ダメージはエフェクトレイヤーで表現）

**採用しなかった要素:**
- シャープな角（西洋ネオブルータリズム的）
- テクスチャ・ノイズ
- ぼかしシャドウ（Material Design 的）
- 物理的な破壊表現（SVG displacement, ひび割れ等）

詳細分析: [memory/dohna-dohna-design.md](../memory/dohna-dohna-design.md)

---

## 3. フォルム言語

### シェイプ規定

```
カード / パネル:       rounded-2xl  (16px) — 寛容な丸角
ボタン（プライマリ）:   rounded-full (pill) — 完全ピル型
ボタン（セカンダリ）:   rounded-xl   (12px)
タグ / チップ / バッジ:  rounded-full (pill)
インプット:            rounded-xl   (12px)
画像 / サムネイル:      rounded-xl   (12px)
サイドバー項目:         rounded-lg   (8px)

ボーダー幅: 2-3px（必ず太い）
シャドウ: ソリッドオフセットのみ（ぼかしゼロ）
```

### 区切りの原則

- **ボーダーよりスペーシング** — 線が多いと窮屈。余白で区切る
- 区切り線を使う場合は `divide-river-border/50`（半透明）
- ヘッダーとコンテンツの境界は FlowLine が担う

---

## 4. 背景レイヤーシステム

Flum の背景は3層で構成される。上層が下層を覆う。

```
z-10  コンテンツ        フィードカード（bg-black/95 backdrop-blur-md）
z-0   背景              壁紙 or デフォルト背景（River at Night）
      ベース            --river-bg（CSS）
```

### レイヤーの優先度

1. **壁紙あり** → ユーザー画像 + `bg-black/50` ダークオーバーレイ
2. **壁紙なし** → デフォルト背景（River at Night）
3. **チャンネル外**（Scoops 等）→ デフォルト背景

### フロストガラスフィード

フィードカードのコンテナ（`max-w-xl` = 576px）は半透明で、背景がうっすら透けて見える。

```css
bg-black/95 backdrop-blur-md
```

**`/95` に至った経緯:**

| 値 | 結果 |
|----|------|
| `/85` | 壁紙のオーバーレイ（50%）と合わせて実質 7.5% しか見えない。透けてる感なし |
| `/70` | 新しい記事は良いが、古い記事（decay: opacity 0.5〜0.65）が二重透過で読めない |
| `/75`〜`/80` | まだ古い記事が見えにくい |
| `/90` | 微妙に透ける。もう少し透明度を下げたい |
| **`/95`** | **採用。壁紙の存在感がギリギリ感じられ、テキストの可読性も維持** |

**学び:** 透過度は「コンテナ単体」ではなく「壁紙オーバーレイとの掛け算」で考える必要がある。

---

## 5. 壁紙システム

### 概要

チャンネルごとにユーザーがカスタム壁紙を設定できる。画像は **IndexedDB** にブラウザローカル保存。サーバーコストゼロ。

### 技術構成

```
IndexedDB "flum-wallpapers"
  └── store "wallpapers": key=channelId → value=Blob

In-memory cache: Map<channelId, objectURL>
Custom event: "wallpaper-change"
```

| ファイル | 責務 |
|---------|------|
| `src/lib/wallpaper/store.ts` | IndexedDB CRUD + objectURL キャッシュ + subscribe API |
| `src/components/wallpaper-layer.tsx` | 背景レンダラー（壁紙 or デフォルト背景） |
| `src/components/wallpaper-picker.tsx` | チャンネルヘッダーの設定 UI |

### API

| 関数 | 説明 |
|------|------|
| `loadWallpaper(channelId)` | IndexedDB → objectURL キャッシュ → イベント発火 |
| `setWallpaper(channelId, file)` | IndexedDB 保存 + キャッシュ更新 |
| `removeWallpaper(channelId)` | IndexedDB 削除 + objectURL revoke |
| `getWallpaperUrl(channelId)` | キャッシュから同期読み取り（`getSnapshot` 用） |
| `subscribeWallpaper(callback)` | `wallpaper-change` イベント購読（`subscribe` 用） |

### 設計判断

| 判断 | 理由 |
|------|------|
| IndexedDB（localStorage ではなく） | 画像 Blob は大きい。localStorage は 5MB 制限 |
| `idb` ライブラリ（~1KB） | 生 IndexedDB API のコールバック地獄を回避 |
| `useSyncExternalStore` | React 18+ の推奨パターン。useEffect + useState は ESLint 違反 |
| objectURL キャッシュ | IndexedDB 読み取りは非同期。同期的な `getSnapshot` のために in-memory キャッシュが必要 |
| `bg-cover bg-center` | 壁紙の業界標準。アスペクト比を保ちつつ全面カバー |
| `bg-black/50` オーバーレイ | テキスト可読性の保証。どんな画像でもコントラストを確保 |

### シングルユーザー前提

- クロスデバイス同期は不要（IndexedDB = ブラウザローカル）
- サーバーストレージ不要 = Supabase の無料枠を圧迫しない
- ユーザー1人なので競合状態を考える必要がない

---

## 6. デフォルト背景 — River at Night（夜の川）

### コンセプト

**Flum = Flume（水路）**。壁紙が設定されていないとき、「夜の川」をモチーフにした背景を表示する。

> 星空が川面に映り、光が水面で揺れる。情報が水路を流れるように、光の筋が横に漂う。

このコンセプトは「Flum とは何か」というプロダクトアイデンティティに直接結びついている:
- **星** = 情報（フィードの記事）
- **川面への反射** = 情報がチャンネルに流れ込む
- **水流ライン** = 情報の流れ（Flum の核心メタファー）
- **揺らめき** = リアルタイム性（光が絶えず動いている）

### ドーナドーナ的背景からの転換

初期のデフォルト背景はドーナドーナ準拠のポップアート（ハーフトーン + 集中線 + 斜めストライプ + クリップパス星）で実装した。

**転換の理由:**

1. **デザイン的な問題** — ハーフトーンや集中線は「漫画の印刷テクニック」であり、そのまま Flum に持ち込んでも意味がない。形だけの模倣になっていた
2. **星がださかった** — CSS `clip-path` で作った四芒星は汎用的で個性がない
3. **ドーナドーナ準拠の限界** — ドーナドーナのグラフィックテクニックはキャラクター/シーンの装飾として機能する。キャラがいない背景に単独で配置しても「Webデザインの散らかし」にしかならない
4. **Flum のアイデンティティとの乖離** — ポップアート要素は Flum の「水路・流れ」というコアメタファーと無関係だった

**学び:**
- デザインリファレンスから「テクニック」を借りるのではなく、自分のプロダクトの意味から形を導き出すべき
- ドーナドーナのカラーパレットとフォルム言語（丸角・太ボーダー・シャドウ）は Flum の UI クロムに適切だが、背景装飾の「モチーフ」はプロダクト固有であるべき

### レイヤー構成

CSS gradient + mask + animation で構成。SVG ゼロ。全6層:

```
Layer 6  環境光        大きな色のにじみ（街の灯りの映り込み）
Layer 5  水流ライン     水平に漂う光の筋（情報の流れ）
Layer 4  揺らめき      水面で踊る小さな光（リアルタイム感）
Layer 3  水平線        空と水面の境界（1px グラデーション）
Layer 2  水面反射      星空の反転ミラー（ぼかし + 横引き伸ばし）
Layer 1  星空          3層ドットグリッドの Moiré 効果
```

### Layer 1: 星空

3つの `radial-gradient` ドットグリッドを重ねて自然な星の散らばりを作る。

| 層 | ドットサイズ | グリッド間隔 | 不透明度 | 役割 |
|----|-----------|-----------|---------|------|
| far | 0.5px | 11×13px | 0.04 | 遠い星（密、小さい） |
| mid | 0.8px | 29×31px | 0.06 | 中距離の星 |
| near | 1.2px | 67×71px | 0.07 | 近い星（疎、大きい） |

**素数ベースの `background-size`** — グリッド間隔に素数を使うことで、3層が完全に重なる周期を極端に長くする（Moiré 効果）。結果として規則的なパターンが見えず、自然な星空に見える。

**マスク** — `mask-image: linear-gradient(to bottom, black 30%, transparent 65%)` で上半分にフェード。星空は画面の上側に集中する。

### Layer 2: 水面反射

Layer 1 と同じ3層ドットグリッドを `scaleY(-1)` で上下反転し、`blur(2px)` + `scaleX(1.5)` で水面に映った星を表現。

```css
filter: blur(2px);
transform: scaleX(1.5) scaleY(-1);
transform-origin: center 65%;
mask-image: linear-gradient(to top, black 20%, transparent 55%);
```

- 反転 + ぼかし → 水面に映った星は元より滲む
- 横引き伸ばし → 水面の揺れで光が横に伸びる
- 下半分にマスク → 水面は画面の下側

### Layer 3: 水平線

空と水面の境界。1px の `linear-gradient` で両端はフェードアウト。

```css
top: 55%;
height: 1px;
background: linear-gradient(90deg,
  transparent 5%, rgba(200,210,255,0.08) 30%,
  rgba(200,210,255,0.12) 50%,
  rgba(200,210,255,0.08) 70%, transparent 95%
);
```

### Layer 4: 揺らめき

楕円形の光が `scaleX` + `opacity` で呼吸パルス。水面で光が踊る様子を表現。

4つの光源、それぞれ異なる色（ピンク / シアン / 白 / パープル）・サイズ・`animation-delay` で自然な非同期感を出す。

```css
@keyframes shimmer-pulse {
  0%, 100% { transform: scaleX(1);   opacity: base; }
  50%      { transform: scaleX(1.4); opacity: base × 1.8; }
}
```

### Layer 5: 水流ライン

1px の水平グラデーションが `translateX` でゆっくり画面を横断する。**情報の流れ = 水の流れ** という Flum のコアメタファーを視覚化。

3本のライン、それぞれ異なる色・速度・`animation-delay` で非同期に漂う。

```css
@keyframes flow-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100vw + 20%)); }
}
```

20-30 秒のゆっくりした周期。情報が「流れている」という感覚を、意識させずに伝える。

### Layer 6: 環境光

大きな `blur(60px)` のカラーブロブ。街の灯りが川面に映り込む雰囲気。

- ピンク（右下）— ネオンサインの映り込み
- シアン（左上）— 月光の反射

非常に低い不透明度（0.03〜0.04）で、存在は感じるが主張しない。

### アクセシビリティ

```css
@media (prefers-reduced-motion: reduce) {
  .river-shimmer, .river-flow { animation: none; }
  .river-shimmer { opacity: 0.08; }  /* 静止状態の基準値 */
}
```

- 揺らめきと水流ラインのアニメーションを無効化
- 星空と反射は静的なので影響なし
- 環境光も静的

### ファイル構成

| ファイル | 責務 |
|---------|------|
| `src/components/wallpaper-layer.tsx` | `RiverNightDeco` コンポーネント（DOM 構造） |
| `src/app/globals.css` | `.river-*` クラス（スタイル定義 + アニメーション） |

---

## 7. Z-index 階層

```
z-50   FlowLine（ナビゲーションバー）
z-40   Sticky ヘッダー（bg-river-deep 不透明維持）
z-30   ドロップダウン
z-20   フィードカード内コンテンツ
z-10   フィードカードコンテナ（コンテンツ最外殻）
z-0    壁紙 / デフォルト背景（position: fixed）
```

---

## 8. ハイドレーションと時間依存レンダリング

### 問題

`Date.now()` をサーバーで計算してクライアントに渡すと、ハイドレーション時に `style` や `data-*` 属性がミスマッチする。`suppressHydrationWarning` は**テキストコンテンツ**のミスマッチしか抑制しない。

### 解決策

`FeedItem` を Client Component にし、`useSyncExternalStore` で `now` を管理:

```typescript
const noopSubscribe = () => () => {};

function useClientNow(): number {
  return useSyncExternalStore(noopSubscribe, () => Date.now(), () => 0);
}
```

| フェーズ | `now` の値 | 結果 |
|---------|-----------|------|
| SSR | `getServerSnapshot()` → `0` | decay なし、timeAgo なし（安定 HTML） |
| ハイドレーション | `getServerSnapshot()` → `0` | サーバー HTML と一致 → エラーなし |
| ハイドレーション後 | `getSnapshot()` → `Date.now()` | 同期再レンダリング（フラッシュなし） |

React は `getServerSnapshot` と `getSnapshot` が異なる値を返した場合、ハイドレーション直後に**同期的に**再レンダリングする（ブラウザ描画前）。視覚的なフラッシュは発生しない。

---

## 9. 設計哲学のまとめ

### 引き算の UX

> 「足し算ではなく引き算が UX」

- ボーダーよりスペーシング
- ★ボタンはホバー時のみ表示
- 情報量を減らすのではなく、**判断コストを下げる**（OGP カード = 「読む」から「見る」へ）

### コンテンツと UI クロムの分離

> 「コンテンツの本質と戦わない — UI クロムでコントラストを作る」

RSS フィードの記事自体は地味（テキスト一覧）。個性はフィードの中身ではなく、周囲の UI クロム（フローライン、壁紙、decay、サイドバー）が担う。コンテンツはクリーンで読みやすく保つ。

### プロダクトアイデンティティからデザインを導く

リファレンス（ドーナドーナ）からテクニックだけを借りても「形だけの模倣」になる。プロダクトの名前・コンセプト・メタファーからビジュアルモチーフを導き出す:

- **Flum = Flume（水路）** → 夜の川、水面の反射、水流ライン
- **「流れる情報」** → 水流ラインのアニメーション
- **リアルタイム** → 揺らめき（水面で踊る光）
- **Scoop（掬い上げる）** → 流れから記事を救い出す

色・角丸・シャドウ等の「文法」はリファレンスから学び、「語彙」（何を描くか）はプロダクト固有にする。
