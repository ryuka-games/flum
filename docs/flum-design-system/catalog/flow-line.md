# Flow Line

> 川の流れを示す水面のライン。画面上端のプログレスバー。

## 見た目

- 形状: 画面全幅、高さ 2px
- 色: `from-neon-pink via-neon-purple to-neon-cyan`（グラデーション）
- 配置: `fixed top-0 left-0 right-0 z-50`
- ポインターイベント: `pointer-events-none`

## クラスバンドル

```html
<div class="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[2px]">
  <div class="h-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan"
       style="width: 100%; transition: width ...">
  </div>
</div>
```

## バリアント

バリアントなし。

## 状態

| 状態 | 見た目 |
|------|--------|
| idle | `width: 100%`（フルグラデーション、常時表示） |
| loading | `width: 20%` → 漸増 → `width: 90%`（左から右へ伸びる） |
| completing | `width: 100%`（到達後 250ms でフェードアウト → idle に戻る） |

### ローディングシーケンス

1. ナビゲーション開始: `width: 0%` → `width: 20%`（300ms ease-out）
2. 進行中: 150-350ms 間隔で `progress += (90 - progress) * 0.08`（漸近的に 90% へ）
3. 完了: `width: 100%`（150ms ease-out）
4. リセット: 250ms 待って `width: 100%`（idle 状態、見た目変化なし）
5. タイムアウト: 8秒で自動完了

## インタラクションカラー

なし（インタラクティブ要素ではない）。

## レスポンシブ

モバイル/デスクトップ共通。画面全幅。

## トリガー

| トリガー | 検知方法 |
|---------|---------|
| ページ遷移 | 内部リンクの `click` イベント監視 |
| 遷移完了 | `pathname` / `searchParams` 変更検知 |
| 手動開始 | `flowline:start` カスタムイベント |
| 手動完了 | `flowline:done` カスタムイベント |

### カスタムイベントの使い方

```typescript
// リフレッシュボタンから
window.dispatchEvent(new Event('flowline:start'));
// 完了時
window.dispatchEvent(new Event('flowline:done'));
```

## 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/components/flow-line.tsx` | プログレスバーコンポーネント |
| `src/components/app-shell.tsx` | レイアウトに配置 |
| `src/components/refresh-button.tsx` | カスタムイベントでトリガー |

## 注意点

- `pointer-events-none` で下のコンテンツのクリックを妨げない
- `z-50` で最上位レイヤー（ツールチップと同階層）
- idle 状態でもグラデーションが常時表示される（装飾的な役割）
- transition の `duration` はフェーズで切り替え: 進行中 `300ms`、完了 `150ms`
- 8秒タイムアウトはフォールバック。通常はナビゲーション完了で正常終了
