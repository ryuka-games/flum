import { parseFeed } from "feedsmith";
import { validateFeedUrl, checkPrivateIp } from "./validate-url";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB

export type FeedItem = {
  title: string;
  url: string;
  content?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
};

export type FetchFeedResult =
  | { success: true; feed: { title: string; items: FeedItem[] }; headers: { etag?: string; lastModified?: string } }
  | { success: true; notModified: true }
  | { success: false; error: string };

/**
 * URL から RSS/Atom フィードを取得してパースする。
 * SSRF 対策・タイムアウト・サイズ制限・エラーハンドリングを含む。
 */
export async function fetchAndParseFeed(
  url: string,
  conditionalHeaders?: { etag?: string | null; lastModified?: string | null },
): Promise<FetchFeedResult> {
  // 1. URL バリデーション
  const validation = validateFeedUrl(url);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // 2. プライベート IP チェック
  const hostname = new URL(url).hostname;
  if (await checkPrivateIp(hostname)) {
    return { success: false, error: "この URL にはアクセスできません" };
  }

  // 3. フェッチ（タイムアウト + サイズ制限 + 条件付きリクエスト）
  let responseText: string;
  let responseEtag: string | undefined;
  let responseLastModified: string | undefined;
  try {
    const requestHeaders: Record<string, string> = {
      "User-Agent": "Flum/1.0 RSS Reader",
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml",
    };
    if (conditionalHeaders?.etag) {
      requestHeaders["If-None-Match"] = conditionalHeaders.etag;
    }
    if (conditionalHeaders?.lastModified) {
      requestHeaders["If-Modified-Since"] = conditionalHeaders.lastModified;
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: requestHeaders,
    });

    if (response.status === 304) {
      return { success: true, notModified: true };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `サーバーがエラーを返しました (HTTP ${response.status})`,
      };
    }

    responseEtag = response.headers.get("etag") ?? undefined;
    responseLastModified = response.headers.get("last-modified") ?? undefined;

    // Content-Length での事前チェック
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_BYTES) {
      return { success: false, error: "レスポンスが大きすぎます" };
    }

    // ストリーミング読み取りでサイズ制限を強制（エンコーディング自動検出）
    responseText = await readWithSizeLimit(response, MAX_RESPONSE_BYTES, response.headers.get("content-type"));
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return { success: false, error: "接続がタイムアウトしました" };
    }
    if (err instanceof Error && err.message === "RESPONSE_TOO_LARGE") {
      return { success: false, error: "レスポンスが大きすぎます" };
    }
    return { success: false, error: "接続できませんでした" };
  }

  // 4. パース
  try {
    const result = parseFeed(responseText);

    const title = extractTitle(result) || new URL(url).hostname;
    const items = extractItems(result, responseText);

    return {
      success: true,
      feed: { title, items },
      headers: { etag: responseEtag, lastModified: responseLastModified },
    };
  } catch {
    return {
      success: false,
      error: "有効な RSS/Atom フィードではありません",
    };
  }
}

/** レスポンスボディをサイズ制限付きで読み取る（エンコーディング自動検出） */
async function readWithSizeLimit(
  response: Response,
  maxBytes: number,
  contentType: string | null,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalSize += value.length;
    if (totalSize > maxBytes) {
      reader.cancel();
      throw new Error("RESPONSE_TOO_LARGE");
    }
    chunks.push(value);
  }

  // 全チャンクを結合
  const bytes = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  const encoding = detectEncoding(bytes, contentType);
  return new TextDecoder(encoding).decode(bytes);
}

/** Content-Type ヘッダーと XML 宣言からエンコーディングを検出 */
function detectEncoding(bytes: Uint8Array, contentType: string | null): string {
  // 1. Content-Type ヘッダーの charset
  if (contentType) {
    const match = contentType.match(/charset=([^\s;]+)/i);
    if (match) return normalizeEncoding(match[1]);
  }

  // 2. XML 宣言の encoding（ASCII 互換なので UTF-8 で読んでも OK）
  const head = new TextDecoder("ascii").decode(bytes.slice(0, 200));
  const xmlMatch = head.match(/<\?xml[^?]*encoding=["']([^"']+)["']/i);
  if (xmlMatch) return normalizeEncoding(xmlMatch[1]);

  return "utf-8";
}

/** エンコーディング名を TextDecoder が受け付ける形式に正規化 */
function normalizeEncoding(encoding: string): string {
  const lower = encoding.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lower === "eucjp" || lower === "xeucjp") return "euc-jp";
  if (lower === "shiftjis" || lower === "xsjis" || lower === "sjis") return "shift_jis";
  if (lower === "iso2022jp") return "iso-2022-jp";
  return encoding.toLowerCase();
}

/** フォーマットに依存せずフィードタイトルを取得 */
function extractTitle(result: ReturnType<typeof parseFeed>): string | undefined {
  const feed = result.feed as Record<string, unknown>;
  if (typeof feed.title === "string") return feed.title;
  return undefined;
}

/** フォーマットに依存せずアイテム一覧を正規化 */
function extractItems(result: ReturnType<typeof parseFeed>, rawXml: string): FeedItem[] {
  const feed = result.feed as Record<string, unknown>;

  // RSS/RDF は items、Atom は entries
  const rawItems = (feed.items ?? feed.entries ?? []) as Record<
    string,
    unknown
  >[];

  // feedsmith がパースしないカスタム名前空間の画像を生 XML から抽出
  const xmlImageMap = extractImagesFromRawXml(rawXml);

  const mapped: FeedItem[] = [];
  for (const item of rawItems) {
    const title = extractString(item.title);
    const url = extractItemUrl(item);
    if (!title || !url) continue;

    mapped.push({
      title,
      url,
      content: extractString(item.description ?? item.summary ?? item.content),
      thumbnailUrl: extractThumbnailUrl(item) ?? xmlImageMap.get(url),
      publishedAt: extractDcDate(item) ?? extractString(
        item.pubDate ?? item.published ?? item.updated ?? item.date,
      ),
    });
  }
  return mapped;
}

/** アイテムの URL を取得（フォーマットごとに異なる） */
function extractItemUrl(
  item: Record<string, unknown>,
): string | undefined {
  // RSS: item.link は string
  if (typeof item.link === "string") return item.link;

  // Atom: item.links は配列
  if (Array.isArray(item.links)) {
    const alternate = item.links.find(
      (l: Record<string, unknown>) =>
        l.rel === "alternate" || l.rel === undefined,
    );
    if (alternate && typeof alternate.href === "string") return alternate.href;
    if (item.links[0] && typeof item.links[0].href === "string")
      return item.links[0].href;
  }

  // guid からフォールバック
  if (item.guid && typeof item.guid === "object") {
    const guid = item.guid as Record<string, unknown>;
    if (typeof guid.value === "string" && guid.value.startsWith("http"))
      return guid.value;
  }

  return undefined;
}

/** 生 XML から feedsmith が無視するカスタム名前空間の画像 URL を抽出 */
function extractImagesFromRawXml(xml: string): Map<string, string> {
  const map = new Map<string, string>();

  // <item> ブロックごとに <link> と <hatena:imageurl> を対応付ける
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[0];
    const linkMatch = block.match(/<link>([^<]+)<\/link>/);
    const imageMatch = block.match(/<hatena:imageurl>([^<]+)<\/hatena:imageurl>/);
    if (linkMatch && imageMatch) {
      map.set(linkMatch[1].trim(), imageMatch[1].trim());
    }
  }

  // RDF 形式: <item rdf:about="URL"> ... </item> の場合 link が中にないこともある
  const rdfItemRegex = /<item\s+rdf:about="([^"]+)"[\s\S]*?<\/item>/gi;
  let rdfMatch;
  while ((rdfMatch = rdfItemRegex.exec(xml)) !== null) {
    const itemUrl = rdfMatch[1];
    if (map.has(itemUrl)) continue;
    const block = rdfMatch[0];
    const imageMatch = block.match(/<hatena:imageurl>([^<]+)<\/hatena:imageurl>/);
    if (imageMatch) {
      map.set(itemUrl, imageMatch[1].trim());
    }
  }

  return map;
}

/** サムネイル URL を取得 */
function extractThumbnailUrl(
  item: Record<string, unknown>,
): string | undefined {
  // enclosures から画像を探す
  if (Array.isArray(item.enclosures)) {
    for (const e of item.enclosures as Record<string, unknown>[]) {
      if (typeof e.url !== "string") continue;
      // type が正しく image/ で始まるもの
      if (typeof e.type === "string" && e.type.startsWith("image/")) return e.url;
      // type が不正 or 欠損でも URL が画像っぽければ採用（Zenn 等）
      if (!e.type || e.type === "false") {
        if (isLikelyImageUrl(e.url)) return e.url;
      }
    }
  }

  // media namespace
  if (item.media && typeof item.media === "object") {
    const media = item.media as Record<string, unknown>;
    if (Array.isArray(media.thumbnails) && media.thumbnails[0]) {
      const thumb = media.thumbnails[0] as Record<string, unknown>;
      if (typeof thumb.url === "string") return thumb.url;
    }
  }

  // hatena:imageurl 等のカスタム名前空間（はてなブックマーク RSS）
  // feedsmith は未知の namespace を複数の形式で返す可能性がある
  if (typeof item["hatena:imageurl"] === "string") return item["hatena:imageurl"];
  if (typeof item.imageurl === "string") return item.imageurl;
  if (item.hatena && typeof item.hatena === "object") {
    const hatena = item.hatena as Record<string, unknown>;
    if (typeof hatena.imageurl === "string") return hatena.imageurl;
  }

  return undefined;
}

/** URL が画像っぽいか簡易判定 */
function isLikelyImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    // 画像拡張子 or 画像 CDN のパターン
    return /\.(jpg|jpeg|png|gif|webp|svg)/.test(path) ||
      u.hostname.includes("cloudinary") ||
      u.hostname.includes("imgix") ||
      path.includes("/image/");
  } catch {
    return false;
  }
}

/** Dublin Core の dc:date を取得（feedsmith は item.dc.date に Date オブジェクトで格納） */
function extractDcDate(item: Record<string, unknown>): string | undefined {
  if (item.dc && typeof item.dc === "object") {
    const dc = item.dc as Record<string, unknown>;
    if (dc.date instanceof Date) return dc.date.toISOString();
    if (typeof dc.date === "string") return dc.date;
    if (Array.isArray(dc.dates) && dc.dates[0] instanceof Date) {
      return dc.dates[0].toISOString();
    }
  }
  return undefined;
}

/** unknown を string に安全に変換 */
function extractString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  return undefined;
}

/**
 * サイト URL から RSS/Atom フィード URL を自動検出する（Auto-Discovery）。
 * HTML の <link rel="alternate" type="application/rss+xml"> タグを探す。
 */
export async function discoverFeedUrl(siteUrl: string): Promise<string | null> {
  const validation = validateFeedUrl(siteUrl);
  if (!validation.valid) return null;

  const hostname = new URL(siteUrl).hostname;
  if (await checkPrivateIp(hostname)) return null;

  try {
    const response = await fetch(siteUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "Flum/1.0 RSS Reader",
        Accept: "text/html",
      },
    });

    if (!response.ok) return null;

    // <head> 内だけ読めば十分なので先頭部分のみ取得
    const text = await readWithSizeLimit(response, MAX_RESPONSE_BYTES, response.headers.get("content-type"));
    const headMatch = text.match(/<head[\s>][\s\S]*?<\/head>/i);
    const head = headMatch ? headMatch[0] : text.slice(0, 10_000);

    // <link rel="alternate" type="application/rss+xml" href="...">
    // <link rel="alternate" type="application/atom+xml" href="...">
    const linkRegex = /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/(rss|atom)\+xml["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(head)) !== null) {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/);
      if (hrefMatch) {
        const href = hrefMatch[1];
        // 相対 URL を絶対 URL に変換
        try {
          return new URL(href, siteUrl).toString();
        } catch {
          continue;
        }
      }
    }

    // href が先に来るパターンも対応
    const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(rss|atom)\+xml["'][^>]*>/gi;
    while ((match = linkRegex2.exec(head)) !== null) {
      try {
        return new URL(match[1], siteUrl).toString();
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}
