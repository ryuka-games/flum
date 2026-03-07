# Avatar

> 川面に浮かぶ顔。ユーザーのプロフィール画像またはイニシャル。

## 見た目

- 形状: 円形 `rounded-full`
- サイズ: `h-8 w-8`（32px）
- 背景（fallback）: `bg-river-deep/85`
- テキスト（fallback）: `text-sm font-bold text-[var(--text-secondary)]`

## クラスバンドル

### 画像あり

```html
<img
  src="..."
  alt="ユーザー名"
  class="h-8 w-8 rounded-full"
  referrerPolicy="no-referrer"
/>
```

### イニシャル fallback

```html
<div class="flex h-8 w-8 items-center justify-center
            rounded-full bg-river-deep/85">
  <span class="text-sm font-bold text-[var(--text-secondary)]">
    Y
  </span>
</div>
```

### トリガーボタン内（AvatarMenu）

```html
<button class="click-ripple float-shadow float-water-delay-1
               h-8 w-8 rounded-full bg-river-deep/85 backdrop-blur-md">
  <!-- 画像 or イニシャル -->
</button>
```

Float Button のバリアント。[float-button.md](float-button.md) 参照。

## バリアント

| バリアント | サイズ | 場所 |
|-----------|------|------|
| 標準 | `h-8 w-8`（32px） | AvatarMenu トリガー、ドロップダウン内、MobileMenuFab |

## 状態

| 状態 | 変化 |
|------|------|
| 画像あり | GitHub/Google プロフィール画像表示 |
| 画像なし | ユーザー名の頭文字をイニシャル表示 |

## インタラクションカラー

アバター自体にインタラクションカラーはない。トリガーボタンとしての挙動は [Float Button](float-button.md) に従う。

## レスポンシブ

| | デスクトップ | モバイル |
|---|---|---|
| 配置 | `fixed right-6 top-6` | `fixed left-3 top-[calc(12px+env(safe-area-inset-top,0px))]` |
| ドロップダウン | 右寄せ（`right-0`） | 左寄せ（`left-0 right-auto`） |

AvatarMenu のポジショニング。アバター自体のデザインは共通。

## 使用箇所

| ファイル | バリアント | 用途 |
|---------|-----------|------|
| `src/components/avatar-menu.tsx` | 標準 | メニュートリガー |
| `src/components/avatar-menu.tsx` | 標準 | ドロップダウン内ユーザー情報 |
| `src/components/mobile-menu-fab.tsx` | 標準 | ボトムシート内ユーザー情報 |

## 注意点

- `referrerPolicy="no-referrer"` は GitHub/Google のプロフィール画像に必要。リファラがあるとブロックされる場合がある
- イニシャル fallback は `user_metadata.name` または `email` の最初の文字を大文字で表示
- 画像の読み込み失敗時は `onError` でイニシャル fallback に切り替え（現状未実装、TODO）
