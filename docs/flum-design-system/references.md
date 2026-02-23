# References — 事例研究とソース

## 事例研究

### 成功例: Floating UI が機能するケース

#### Google Maps / Apple Maps
- 全画面がコンテンツ（地図）、UI は全て floating
- 検索バー、ズームボタン、FAB が `position: fixed` で浮く
- Apple Maps のボトムシート: CSS `scroll-snap-type: y mandatory` で実装可能
- **成功の理由**: 地図自体がコンテキストを提供。「どこにいるか」は地図を見れば分かる

#### TikTok
- 各動画が 100% viewport。ヘッダーなし
- 右端に縦並びの floating アイコン（いいね、コメント、共有）
- ナビゲーションはスワイプジェスチャー（上下でページ送り）
- **成功の理由**: 1動画 = 1画面。階層がなく「どこにいるか」の問題が存在しない

#### Current（競合 RSS リーダー、2026年2月リリース）
- unread カウントなし、フィードが流れて減衰
- Velocity システム（Breaking: ~3h, News: ~18h, Essay: ~3d, Evergreen: ~1w）
- アイテムは dimming → fade out → 非表示
- **Flum との類似点**: 時間ベースの decay、ヘッダーレス指向
- **Flum の差別化**: チャンネル UI、カラードレイン、壁紙 + ドーナドーナ調ビジュアル

### 教訓: Floating UI が失敗したケース

#### Figma UI3（2024年6月〜10月）
- 全パネル（ナビゲーション、プロパティ、ツールバー）を floating に
- **失敗の理由**:
  - パネルがキャンバスを圧迫（特に小画面）
  - ルーラーがデザインから離れて使いにくい
  - **「ユーザーが遅くなった」** が最終的な判断材料
  - 2ヶ月でパネルを固定に戻した
- **残ったもの**: 下部のフローティングツールバー（軽い操作のみ）
- **教訓**: 「軽い操作」は floating OK。「重い操作」は固定 or 別画面

### パターンカタログ

| パターン | 使用例 | 向いてる用途 | リスク |
|---------|--------|-------------|-------|
| Floating corner elements | Google Maps, ゲーム HUD | 常時必要なコントロール | 小画面でコンテンツを隠す |
| Bottom sheet + snap | Apple Maps, Uber | 詳細表示 | ジェスチャー処理の複雑さ |
| Auto-hiding sticky bar | Medium | 最小限の常設 chrome | ユーザーが隠れたナビを見逃す |
| Command palette | Superhuman, Linear | パワーユーザー向け | 新規ユーザーの発見性 |
| Tap zones | Kindle, Instagram Stories | 連続コンテンツ | オンボーディングなしでは発見できない |
| Temporal orientation | Current, Flum | 時間ベースのコンテンツ | 空間的な階層の手がかりがない |

## 「どこにいるか」問題の解決法

ヘッダーレスで最も重要な課題: ユーザーが現在地を把握できるか。

| 戦略 | 使用例 | Flum での適用 |
|------|--------|-------------|
| コンテンツ自体がコンテキスト | Maps, TikTok | 壁紙 + チャンネル固有のフィード内容 |
| 時間的オリエンテーション | Current | decay システム（鮮度 = 時間の手がかり） |
| オンデマンド表示 | Kindle | チャンネルレールのアクティブ状態 |
| 最小限のランドマーク | Medium のロゴ | チャンネルレールの選択インジケーター |

## ソース一覧

### Material Design
- [FAB Overview](https://m3.material.io/components/floating-action-button/overview)
- [FAB Specs](https://m3.material.io/components/floating-action-button/specs)
- [FAB Guidelines](https://m3.material.io/components/floating-action-button/guidelines)
- [FAB Accessibility](https://m3.material.io/components/floating-action-button/accessibility)
- [Extended FAB](https://m3.material.io/components/extended-fab/guidelines)
- [FAB Menu Specs](https://m3.material.io/components/fab-menu/specs)
- [Navigation Rail](https://m3.material.io/components/navigation-rail/guidelines)
- [Elevation](https://m3.material.io/styles/elevation/tokens)
- [Shape Scale](https://m3.material.io/styles/shape/corner-radius-scale)
- [Layout / Window Size Classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)
- [Material Web Components](https://material-web.dev/components/fab/)

### CSS / Web Platform
- [MDN: Containing Block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block)
- [MDN: Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor)
- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN: env() / Safe Area Insets](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)
- [Chrome: CSS Anchor Positioning API](https://developer.chrome.com/docs/css-ui/anchor-positioning-api)
- [Chrome: Popover API](https://developer.chrome.com/blog/introducing-popover-api)
- [Chrome: Viewport Resize Behavior](https://developer.chrome.com/blog/viewport-resize-behavior)
- [Chrome: Entry/Exit Animations](https://developer.chrome.com/blog/entry-exit-animations)
- [Chrome: CSS linear() Easing](https://developer.chrome.com/docs/css-ui/css-linear-easing-function)
- [web.dev: Popover Baseline](https://web.dev/blog/popover-baseline)
- [web.dev: Building a FAB Component](https://web.dev/articles/building/a-fab-component)
- [web.dev: Viewport Units (dvh/svh/lvh)](https://web.dev/blog/viewport-units)
- [Can I Use: CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning)
- [Smashing Magazine: Stacking Contexts (Jan 2026)](https://www.smashingmagazine.com/2026/01/unstacking-css-stacking-contexts/)
- [Josh W. Comeau: linear() Timing Function](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [Josh W. Comeau: @starting-style](https://www.joshwcomeau.com/css/starting-style/)
- [Josh W. Comeau: Container Queries Unleashed](https://www.joshwcomeau.com/css/container-queries-unleashed/)
- [Bottom Sheets with CSS Scroll Snap](https://viliket.github.io/posts/native-like-bottom-sheets-on-the-web/)

### アクセシビリティ
- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.4.11: Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [WCAG 2.5.8: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [WAI-ARIA APG: Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [WAI-ARIA APG: Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WebAIM: Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [Next.js: Accessibility](https://nextjs.org/docs/architecture/accessibility)
- [Bogdan Cerovac: Floating Animations A11y](https://cerovac.com/a11y/2025/05/potential-accessibility-issues-of-floating-animations-on-webpages-and-mobile-apps/)

### 事例研究
- [Figma UI3 Redesign](https://www.figma.com/blog/behind-our-redesign-ui3/)
- [Why Figma's Floating Panels Fell Short](https://bitskingdom.com/blog/figma-floating-panels-ux-lesson/)
- [Current RSS Reader (TechCrunch)](https://techcrunch.com/2026/02/19/current-is-a-new-rss-reader-thats-more-like-a-river-than-an-inbox/)
- [TikTok UI Choices](https://www.iteratorshq.com/blog/5-tiktok-ui-choices-that-made-the-app-successful/)
- [Superhuman Command Palette](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/)
- [Command K Bars (Maggie Appleton)](https://maggieappleton.com/command-bar)
- [Google Maps Controls API](https://developers.google.com/maps/documentation/javascript/controls)

### アニメーション
- [Easings.net](https://easings.net/)
- [Linear Easing Generator](https://linear-easing-generator.netlify.app/)
- [CSS Spring Generator](https://www.kvin.me/css-springs)
- [Motion.dev (Framer Motion successor)](https://motion.dev)
- [Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)
- [CSS Water Effects Collection](https://freefrontend.com/css-water-effects/)
- [Floating Bottle on Water (CodeHim)](https://codehim.com/html5-css3/floating-bottle-on-water-css-animation/)

### レスポンシブ
- [Vaul (Bottom Sheet)](https://github.com/emilkowalski/vaul)
- [Building a Drawer Component (Emil Kowalski)](https://emilkowal.ski/ui/building-a-drawer-component)
- [shadcn/ui Drawer](https://ui.shadcn.com/docs/components/radix/drawer)
- [Thumb Zone UX](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)
- [Designing for Thumb Zones in 2025](https://diversewebsitedesign.com.au/designing-for-thumb-zones-mobile-ux-in-2025/)
- [iOS Safari Fixed Position Issues](https://meta.discourse.org/t/ios-26-bugs-with-fixed-position-elements-in-discourse/382831)
- [New Viewport Units (Ahmad Shadeed)](https://ishadeed.com/article/new-viewport-units/)

### その他
- [NN/g: Local Navigation as Wayfinding](https://www.nngroup.com/articles/local-navigation/)
- [Game HUD Design Guide](https://polydin.com/game-hud-design/)
- [Floating UI Library](https://floating-ui.com/)
- [Bootstrap v5.3 Z-Index](https://getbootstrap.com/docs/5.3/layout/z-index/)
- [Lullabot: Stacking Context ADR (Dec 2025)](https://architecture.lullabot.com/adr/20251210-create-deliberate-stacking-contexts/)
