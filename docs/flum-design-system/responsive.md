# Responsive — レスポンシブ戦略

## ブレークポイント

```
< 768px   モバイル: FAB + ボトムシート
≥ 768px   デスクトップ: チャンネルレール + 直接配置
```

判断基準: レール（~64px） + コンテンツ（~640px） + マージン = ~750px 以上必要。

### CSS

```css
@media (min-width: 768px) {
  .channel-rail { display: flex; }
  .channel-fab  { display: none; }
}

@media (max-width: 767px) {
  .channel-rail { display: none; }
  .channel-fab  { display: flex; }
}
```

## モバイル設計

### FAB 配置（サム・ゾーン準拠）

```
+---------------------------+
|  HARD    |  HARD  | HARD  |   ← アバターメニュー
|----------|--------|-------|
|  STRETCH | EASY   |STRETCH|   ← フィードコンテンツ
|----------|--------|-------|
|  STRETCH | EASY   | EASY  |   ← FAB（右下が最適）
+---------------------------+
```

67% のユーザーが右手で片手操作。右下が最も自然な位置。

```css
.channel-fab {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  right: 24px;
  z-index: var(--z-fab);
  width: 56px;
  height: 56px;
}
```

### ボトムシート: Vaul

**選定理由:**
- Unstyled（Tailwind と完全互換）
- Radix UI Dialog ベース（アクセシビリティ組み込み）
- スナップポイント対応（40%, 80% で段階展開）
- ドラッグ dismiss（ネイティブ感のある物理ベース）
- `[data-vaul-no-drag]` でスクロール可能領域を保護
- shadcn/ui の Drawer が Vaul を採用（実績あり）

```tsx
import { Drawer } from 'vaul';

function ChannelSheet() {
  return (
    <Drawer.Root snapPoints={[0.4, 0.8]}>
      <Drawer.Trigger asChild>
        <button className="channel-fab">Ch</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-river-deep">
          <div data-vaul-no-drag className="overflow-y-auto max-h-[70vh]">
            {/* チャンネル一覧 */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### スワイプ操作

v1 ではチャンネル間スワイプは**実装しない**:
- iOS Safari のエッジスワイプ（戻る/進む）と競合
- 縦スクロール中の誤操作リスク
- チャンネル数が多いと使いにくい
- ボトムシートの方が発見しやすい

Vaul のドラッグ dismiss のみ（シートを下に引いて閉じる）。

## デスクトップ設計

### チャンネルレール: Grid ガター + Sticky

```css
.app-root {
  display: grid;
  grid-template-columns: 1fr minmax(0, 640px) 1fr;
  min-height: 100svh;
}

.channel-rail {
  grid-column: 1;
  justify-self: end;
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
  width: 64px;
  margin-right: 16px;
}
```

### なぜ `position: sticky` か

| アプローチ | 利点 | リスク |
|-----------|------|-------|
| `position: fixed` | 常にビューポート固定 | `filter`/`transform`/`backdrop-filter` が containing block を壊す |
| `position: sticky` in Grid | Grid ガターに自然配置 | containing block 問題なし。スクロール追従も正常 |
| `position: absolute` + calc | ガター幅を計算で配置 | ビューポートリサイズで壊れやすい |

**Sticky in Grid を採用。** Flum の decay システムの CSS `filter` と構造的に衝突しない。

## Viewport Units

| 単位 | 基準 | 用途 |
|------|------|------|
| `svh` | ブラウザ UI 表示時（最小 viewport） | Floating 要素の配置（ジャンプしない） |
| `lvh` | ブラウザ UI 非表示時（最大 viewport） | モーダル、オーバーレイ |
| `dvh` | 動的（UI 表示/非表示で変化） | ヒーローセクション（Flum では不使用） |

**Floating 要素には `svh` を使う。** `dvh` はブラウザクロームの出現/消失で要素が「ジャンプ」する。

```css
.bottom-sheet-content {
  max-height: 80svh;  /* 見える領域を超えない */
}
```

## Safe Area（ノッチ・ホームインジケーター）

### 必須の meta tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

`viewport-fit=cover` なしでは `env(safe-area-inset-*)` は全て `0` を返す。

### 適用箇所

```css
/* FAB（下部） */
.channel-fab {
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  right: calc(24px + env(safe-area-inset-right, 0px));
}

/* アバター（上部） */
.avatar-menu {
  top: calc(12px + env(safe-area-inset-top, 0px));
}

/* メインコンテンツ下部パディング */
main {
  padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));
}
```

## コンテナクエリ

レール/FAB の切替はメディアクエリ（ビューポート依存）。
コンポーネントの適応はコンテナクエリ（親コンテナ依存）。

```css
.feed-container {
  container-type: inline-size;
  container-name: feed;
}

/* フィードカードがコンテナ幅に応じてレイアウト変更 */
@container feed (max-width: 480px) {
  .feed-card { /* コンパクトレイアウト */ }
}

@container feed (min-width: 481px) {
  .feed-card { /* OGP 画像付きレイアウト */ }
}
```

## テスト優先順位

1. **iOS Safari（実機）** — エミュレータは不十分。`fixed` のジッター、ツールバー表示/非表示、ホームインジケーター
2. **Android Chrome（実機）** — ツールバー挙動
3. **Desktop Chrome**
4. **Desktop Firefox**
5. **Desktop Safari**

**Chrome DevTools のモバイルエミュレータはブラウザクロームの挙動を正確にシミュレートしない。** 必ず実機テスト。
