# Floating System — FAB・チャンネルレール・アバターメニュー

## 設計原則

すべての floating 要素は「川面に浮かぶオブジェクト」。端にドッキングせず、背景（川・壁紙）が後ろに透けて見える。

### Figma の教訓を適用する

| 操作タイプ | インタラクション時間 | Floating? | 例 |
|-----------|-------------------|:---------:|-----|
| 一瞬クリック | < 1秒 | Yes | リフレッシュ、チャンネル切替 |
| 短い入力 | 数秒 | Maybe | チャンネル名変更 |
| じっくり操作 | 分単位 | No（別画面） | フィード管理、OPML、壁紙設定 |

## 1. FAB（Floating Action Button）

### MD3 仕様

| バリアント | サイズ | アイコン | 角丸 | 用途 |
|-----------|-------|---------|------|------|
| Small | 40dp | 24dp | 12dp | 非推奨（M3 Expressive で廃止） |
| **Medium**（標準） | **56dp** | **24dp** | **16dp** | **ほとんどの場合これ** |
| Large | 96dp | 36dp | 28dp | 極めて重要なアクション |
| Extended | 56dp高 × 可変幅 | 24dp | 16dp | テキスト付き（スクロールで縮小） |

### Hard Rule: 画面に FAB は1つだけ

複数アクションが必要な場合は **FAB Menu**（2-6項目）を使う。

### 配置

```css
.fab {
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  right: calc(16px + env(safe-area-inset-right, 0px));
  z-index: var(--z-fab);

  /* MD3 Medium FAB */
  width: 56px;
  height: 56px;
  border-radius: 16px;
}

/* タブレット/デスクトップ: マージン拡大 */
@media (min-width: 768px) {
  .fab {
    bottom: 24px;
    right: 24px;
  }
}
```

### エレベーション

| 状態 | レベル | dp | CSS box-shadow |
|------|-------|-----|----------------|
| 静止 | 3 | 6dp | `0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)` |
| ホバー | 4 | 8dp | `0 14px 28px rgba(0,0,0,0.20), 0 5px 10px rgba(0,0,0,0.12)` |
| 押下 | 3 | 6dp | 静止と同じ |

### FAB Menu（Speed Dial の後継）

```
    [Import OPML]   ← メニューアイテム
    [Add Feed]      ← メニューアイテム
    [  ×  ]         ← FAB（閉じるアイコンに変形）
```

- 2-6 項目
- スタガーアニメーションで順次出現
- スクリム（背景暗転）あり
- `+` → `×` のアイコンモーフィング

### アンチパターン

1. **画面に複数 FAB を置かない** → FAB Menu を使う
2. **ナビゲーションに FAB を使わない** → ナビゲーションはレールで
3. **コンテンツを隠す FAB** → `padding-bottom: 88px`（56dp FAB + 16dp × 2）で回避
4. **曖昧なアイコン** → Extended FAB（テキスト付き）を検討

## 2. チャンネルレール

### デスクトップ: Grid ガターに sticky 配置

```css
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

### レール要素の設計

```
  [📌]  ← Scoops（ピンアイコン）
  ────
  [#T]  ← チャンネル: Tech（イニシャル）
  [#G]  ← チャンネル: Gaming
  [#N]  ← チャンネル: News
```

各チップ:
- 48x48px（タッチターゲット最小サイズ準拠）
- チャンネル名のイニシャルまたはアイコン
- アクティブ状態: ピンクのインジケーター（既存のネオブルータリストチップと統一）
- `aria-current="page"` で現在のチャンネルを示す

### モバイル: FAB + ボトムシート に変換

```
< 768px:  チャンネルレール非表示 → FAB タップでボトムシート
≥ 768px:  チャンネルレール表示 → FAB 非表示（デスクトップ）
```

## 3. アバターメニュー

アカウント操作は稀（ログアウト程度）。サム・ゾーン的にも画面上部で OK。

### デスクトップ: 右上に floating

```css
.avatar-menu {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: var(--z-fab);
}
```

### モバイル: 左上（ハンバーガーの代替位置）

```css
@media (max-width: 767px) {
  .avatar-menu {
    top: calc(12px + env(safe-area-inset-top, 0px));
    left: 12px;
    right: auto;
  }
}
```

### メニュー内容（Popover API）

```html
<button popovertarget="avatar-menu" style="anchor-name: --avatar">
  <img src="..." alt="avatar" class="rounded-full w-10 h-10" />
</button>

<div id="avatar-menu" popover="auto" style="
  position-anchor: --avatar;
  top: anchor(bottom);
  right: anchor(right);
">
  <div class="p-3">
    <p>ryuka-games</p>
    <hr />
    <button>ログアウト</button>
  </div>
</div>
```

## 4. コンテンツ下部のパディング

Floating 要素がコンテンツを隠さないように:

```css
main {
  /* FAB (56px) + margin (16px) × 2 + safety (16px) = 104px */
  padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));

  /* フォーカスが floating 要素に隠れない */
  scroll-padding-bottom: 104px;
}
```

## 5. pointer-events 設計

```css
/* 壁紙: 全画面 fixed だが操作は透過 */
.wallpaper {
  pointer-events: none;
}

/* FAB コンテナ: 全体は透過、ボタンのみインタラクティブ */
.fab-container {
  pointer-events: none;
}

.fab-container > button {
  pointer-events: auto;
}
```
