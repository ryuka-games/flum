# Nav Link

> 川岸の杭に立てた道標。チャンネルや Scoops への移動リンク。

## 見た目

- 形状: `rounded-xl`（リスト内）/ `rounded-2xl`（レールアイテム）
- テキスト: `text-xs` / `text-sm`
- パディング: `px-3 py-1.5`（リスト）/ `h-12 w-12`（レール）

## クラスバンドル

### リスト型（MobileMenuFab、MobileChannelFab、AvatarMenu）

```html
<!-- 非アクティブ -->
<a class="flex items-center gap-2 rounded-xl px-3 py-2.5
          text-sm text-[var(--text-secondary)]
          hover:bg-river-surface hover:text-[var(--text-primary)]">
  チャンネル名
</a>

<!-- アクティブ -->
<a class="flex items-center gap-2 rounded-xl px-3 py-2.5
          border-2 border-neon-pink bg-neon-pink/20
          text-sm font-bold text-white">
  チャンネル名
</a>
```

> モバイル Bottom Sheet 内では `text-sm py-2.5`（タップターゲット拡大）。

### レール型（ChannelRail）

Float Button のバリアント。[float-button.md](float-button.md) の「チャンネルレールアイテム」参照。

```html
<!-- 非アクティブ -->
<a class="click-ripple float-shadow
          flex h-12 w-12 items-center justify-center rounded-2xl
          bg-river-deep/85 text-[var(--text-secondary)]
          hover:text-[var(--text-primary)]">
  <span class="text-xs font-bold">Ch</span>
</a>

<!-- アクティブ -->
<a class="click-ripple float-active
          flex h-12 w-12 items-center justify-center rounded-2xl
          border-2 border-neon-pink bg-neon-pink/20
          text-white shadow-neo-sm">
  <span class="text-xs font-bold">Ch</span>
</a>
```

### Scoops リンク

```html
<a class="click-ripple float-shadow
          flex h-12 w-12 items-center justify-center rounded-2xl
          bg-river-deep/85 text-neon-pink
          hover:text-[var(--text-primary)]">
  <Pin size={18} />
</a>
```

Scoops は常にピンクアイコン。アクティブ時は他のレールアイテムと同じ `float-active` パターン。

## バリアント

| バリアント | 形状 | 場所 |
|-----------|------|------|
| リスト型 | `rounded-xl px-3 py-2.5 text-sm` | MobileMenuFab、MobileChannelFab、AvatarMenu |
| レール型 | `rounded-2xl h-12 w-12` | ChannelRail |

## 状態

| 状態 | リスト型 | レール型 |
|------|---------|---------|
| default | `text-[var(--text-secondary)]` | `text-[var(--text-secondary)]` + Float System 影 |
| hover | `bg-river-surface text-[var(--text-primary)]` | Float System リフト + `text-[var(--text-primary)]` |
| active (現在のチャンネル) | `border-2 border-neon-pink bg-neon-pink/20 font-bold text-white` | 同左 + `shadow-neo-sm` + `float-active` |
| error | N/A | amber ドット（`-right-0.5 -top-0.5 h-2.5 w-2.5 bg-amber-400`） |

## インタラクションカラー

全てナビゲーション = `hover:text-[var(--text-primary)]`（白）。

チャンネルリンクはページ遷移を伴うため、シアンではなく白。

## レスポンシブ

| | デスクトップ | モバイル |
|---|---|---|
| 表示形式 | レール型（ChannelRail） | リスト型（MobileMenuFab のボトムシート内） |
| レール | `md:` で表示 | `md:hidden` |
| リスト | `md:hidden` | 表示 |

## 使用箇所

| ファイル | バリアント |
|---------|-----------|
| `src/components/channel-rail.tsx` | レール型 |
| `src/components/mobile-menu-fab.tsx` | リスト型 |
| `src/components/mobile-channel-fab.tsx` | リスト型 |
| `src/components/avatar-menu.tsx` | リスト型（ログアウト等） |

## 注意点

- アクティブ状態の `border-2 border-neon-pink` は「選択中」のシグナル。プライマリボタンの `border-2 border-neon-pink` と同じだが、背景が `bg-neon-pink/20`（20% 透過）で区別
- レール型はテキストなし（アイコン or 2文字略称）。ツールチップで補完
- Scoops のピンクアイコンは「保存」のインタラクションカラーと一致
