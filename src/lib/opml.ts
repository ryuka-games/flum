export type OpmlFeed = { title: string; url: string };
export type OpmlChannel = { name: string; feeds: OpmlFeed[] };

const DEFAULT_CHANNEL_NAME = "インポート";

export function parseOpml(xml: string): OpmlChannel[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");

  // パースエラーチェック
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("OPML ファイルの形式が正しくありません");
  }

  const body = doc.querySelector("body");
  if (!body) {
    throw new Error("OPML の body が見つかりません");
  }

  const channels = new Map<string, OpmlFeed[]>();

  function addFeed(channelName: string, feed: OpmlFeed) {
    const existing = channels.get(channelName);
    if (existing) {
      existing.push(feed);
    } else {
      channels.set(channelName, [feed]);
    }
  }

  function walkOutlines(parent: Element, categoryName: string | null) {
    for (const outline of parent.children) {
      if (outline.tagName !== "outline") continue;

      const xmlUrl =
        outline.getAttribute("xmlUrl") || outline.getAttribute("xmlurl");

      if (xmlUrl) {
        // フィードノード
        const title =
          outline.getAttribute("title") ||
          outline.getAttribute("text") ||
          xmlUrl;
        addFeed(categoryName ?? DEFAULT_CHANNEL_NAME, {
          title,
          url: xmlUrl,
        });
      } else {
        // カテゴリノード — 子を再帰走査
        const name =
          outline.getAttribute("title") ||
          outline.getAttribute("text") ||
          DEFAULT_CHANNEL_NAME;
        walkOutlines(outline, name);
      }
    }
  }

  walkOutlines(body, null);

  return Array.from(channels.entries()).map(([name, feeds]) => ({
    name,
    feeds,
  }));
}
