# Channel Rail

> 川岸に立つ杭の列。デスクトップ専用の縦ナビゲーション。

## 見た目

- 形状: `rounded-3xl`（24px）
- 背景: `bg-river-deep/60` + `backdrop-blur-lg`
- 影: Float System `float-shadow-lg`
- 幅: `w-16`（64px）
- 配置: 左ガター、垂直中央 sticky

## クラスバンドル

```html
<!-- app-shell.tsx: ラッパー（非表示制御はここで行う） -->
<div class="float-water relative z-20 hidden md:block">
  <!-- channel-rail.tsx: nav -->
  <nav class="float-shadow-lg sticky top-1/2 ml-auto mr-4
              flex w-16 -translate-y-1/2 flex-col items-center gap-2
              rounded-3xl bg-river-deep/60 py-4 backdrop-blur-lg">
    <!-- Scoops リンク -->
    <!-- セパレータ -->
    <!-- チャンネルリンク群 -->
    <!-- セパレータ -->
    <!-- チャンネル作成ボタン -->
  </nav>
</div>
```

## 構成要素

### セパレータ

```html
<div class="h-px w-8 bg-river-border/50" />
```

### チャンネル作成フォーム（ドロップダウン）

```html
<div class="absolute left-full top-0 z-30 ml-3
            w-56 rounded-2xl border-2 border-neon-pink
            bg-river-deep p-3 shadow-neo-lg">
  <input class="..." placeholder="チャンネル名" />
  <button class="...">作成</button>
</div>
```

レールの右側にポップアウト。`absolute left-full` で左ガターからはみ出す。

## バリアント

バリアントなし。デスクトップ専用の単一パターン。

## 状態

| 状態 | 変化 |
|------|------|
| default | 静的表示、vertical center sticky |
| scrolled | sticky で追従（position: sticky） |

各アイテムの状態は [Nav Link](nav-link.md) のレール型を参照。

## インタラクションカラー

レール自体にインタラクションカラーはない。各アイテムは [Nav Link](nav-link.md) に従う。

## レスポンシブ

- **デスクトップ専用**。非表示制御は `app-shell.tsx` のラッパー `div`（`hidden md:block`）で行う
- `<nav>` 自体に `hidden` はない。`ml-auto mr-4` で右寄せ配置
- モバイルでは [Bottom Sheet](bottom-sheet.md) 内のリスト型ナビに置き換わる

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/channel-rail.tsx` | メインナビゲーション |
| `src/components/app-shell.tsx` | Grid 左ガターに配置 |

## 注意点

- `sticky top-1/2 -translate-y-1/2` で垂直中央固定。`-translate-y-1/2` は CSS `transform` を使う（`translate` 個別プロパティではない）
- `backdrop-blur-lg` は containing block を生成するが、レール内に `fixed` 要素はないので問題なし
- 作成フォームの `absolute left-full` は Grid ガターからはみ出す。`overflow: hidden` が親にあると切れるので注意
- チャンネル数が多い場合のスクロールは未実装（v1 では十分なチャンネル数を想定）
- `bg-river-deep/60`（60% 不透明）で壁紙が微かに透ける
