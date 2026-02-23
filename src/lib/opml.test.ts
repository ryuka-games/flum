/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { parseOpml } from "./opml";

describe("parseOpml", () => {
  it("カテゴリ付き OPML をチャンネル + フィードに変換", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Test</title></head>
  <body>
    <outline text="Tech">
      <outline text="Hacker News" xmlUrl="https://hn.example.com/rss" />
      <outline text="Lobsters" xmlUrl="https://lobste.rs/rss" />
    </outline>
    <outline text="News">
      <outline text="NHK" xmlUrl="https://nhk.example.com/rss" />
    </outline>
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result).toHaveLength(2);

    const tech = result.find((c) => c.name === "Tech")!;
    expect(tech.feeds).toHaveLength(2);
    expect(tech.feeds[0].title).toBe("Hacker News");
    expect(tech.feeds[0].url).toBe("https://hn.example.com/rss");

    const news = result.find((c) => c.name === "News")!;
    expect(news.feeds).toHaveLength(1);
  });

  it("カテゴリなしフィードは「インポート」チャンネルに入る", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Flat</title></head>
  <body>
    <outline text="Feed A" xmlUrl="https://a.example.com/rss" />
    <outline text="Feed B" xmlUrl="https://b.example.com/rss" />
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("インポート");
    expect(result[0].feeds).toHaveLength(2);
  });

  it("title 属性がなければ text 属性をフォールバック", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Test</title></head>
  <body>
    <outline text="My Feed" xmlUrl="https://example.com/rss" />
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result[0].feeds[0].title).toBe("My Feed");
  });

  it("title も text もなければ URL をタイトルにする", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Test</title></head>
  <body>
    <outline xmlUrl="https://example.com/rss" />
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result[0].feeds[0].title).toBe("https://example.com/rss");
  });

  it("不正な XML でエラーを投げる", () => {
    expect(() => parseOpml("<not>valid xml")).toThrow();
  });

  it("body がない OPML でエラーを投げる", () => {
    const xml = `<?xml version="1.0"?><opml><head/></opml>`;
    expect(() => parseOpml(xml)).toThrow("body");
  });

  it("空の OPML は空配列を返す", () => {
    const xml = `<?xml version="1.0"?>
<opml version="2.0">
  <head><title>Empty</title></head>
  <body></body>
</opml>`;

    const result = parseOpml(xml);
    expect(result).toHaveLength(0);
  });

  it("ネストされたカテゴリは最も近い親のカテゴリ名を使う", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Nested</title></head>
  <body>
    <outline text="Parent">
      <outline text="Child">
        <outline text="Deep Feed" xmlUrl="https://deep.example.com/rss" />
      </outline>
    </outline>
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result[0].name).toBe("Child");
    expect(result[0].feeds[0].title).toBe("Deep Feed");
  });

  it("xmlurl（小文字）も認識する", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Test</title></head>
  <body>
    <outline text="Feed" xmlurl="https://example.com/rss" />
  </body>
</opml>`;

    const result = parseOpml(xml);
    expect(result[0].feeds[0].url).toBe("https://example.com/rss");
  });
});
