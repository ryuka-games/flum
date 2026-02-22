import { validateFeedUrl, checkPrivateIp } from "./validate-url";

const OGP_TIMEOUT_MS = 3_000;
const OGP_MAX_BYTES = 500 * 1024; // 500KB（<head> だけ読めれば十分）

type OgpData = {
  image?: string;
  description?: string;
};

/**
 * URL から OGP メタデータ（og:image, og:description）を取得する。
 * SSRF 保護付き。失敗時は空オブジェクトを返す（呼び出し元を止めない）。
 */
export async function fetchOgpData(url: string): Promise<OgpData> {
  try {
    const validation = validateFeedUrl(url);
    if (!validation.valid) return {};

    const hostname = new URL(url).hostname;
    if (await checkPrivateIp(hostname)) return {};

    const response = await fetch(url, {
      signal: AbortSignal.timeout(OGP_TIMEOUT_MS),
      headers: {
        "User-Agent": "Flum/1.0 RSS Reader",
        Accept: "text/html",
      },
    });

    if (!response.ok) return {};

    // <head> だけ読めればいいのでサイズ制限を厳しめに
    const contentType = response.headers.get("content-type");
    const html = await readHead(response, OGP_MAX_BYTES, contentType);
    return parseOgpFromHtml(html);
  } catch {
    return {};
  }
}

const OGP_CONCURRENCY = 8;

/**
 * 複数の URL から OGP を並列取得して Map で返す。
 * 同時実行数を OGP_CONCURRENCY に制限（数百件のフィードでサーバーをハングさせない）。
 */
export async function fetchOgpBatch(
  urls: string[],
): Promise<Map<string, OgpData>> {
  const map = new Map<string, OgpData>();
  // 同時実行数を制限してバッチ処理
  for (let i = 0; i < urls.length; i += OGP_CONCURRENCY) {
    const batch = urls.slice(i, i + OGP_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (url) => ({ url, data: await fetchOgpData(url) })),
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.data.image) {
        map.set(result.value.url, result.value.data);
      }
    }
  }
  return map;
}

/** レスポンスから <head> 部分だけを読み取る（エンコーディング自動検出） */
async function readHead(response: Response, maxBytes: number, contentType: string | null): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let totalSize = 0;
  // </head> 検出用に ASCII 互換でストリーミングデコード
  const asciiDecoder = new TextDecoder("ascii");
  let asciiAccumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalSize += value.length;
    chunks.push(value);
    asciiAccumulated += asciiDecoder.decode(value, { stream: true });

    if (asciiAccumulated.includes("</head>") || asciiAccumulated.includes("</HEAD>")) {
      reader.cancel();
      break;
    }

    if (totalSize > maxBytes) {
      reader.cancel();
      break;
    }
  }

  // 全チャンクを結合して正しいエンコーディングでデコード
  const bytes = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  const encoding = detectHtmlEncoding(asciiAccumulated, contentType);
  return new TextDecoder(encoding).decode(bytes);
}

/** Content-Type ヘッダーと HTML の meta charset からエンコーディングを検出 */
function detectHtmlEncoding(asciiHtml: string, contentType: string | null): string {
  // 1. Content-Type ヘッダーの charset
  if (contentType) {
    const match = contentType.match(/charset=([^\s;]+)/i);
    if (match) return normalizeEncoding(match[1]);
  }

  // 2. <meta charset="...">
  const charsetMatch = asciiHtml.match(/<meta\s+charset=["']([^"']+)["']/i);
  if (charsetMatch) return normalizeEncoding(charsetMatch[1]);

  // 3. <meta http-equiv="Content-Type" content="...; charset=...">
  const httpEquivMatch = asciiHtml.match(/content=["'][^"']*charset=([^\s;"']+)/i);
  if (httpEquivMatch) return normalizeEncoding(httpEquivMatch[1]);

  return "utf-8";
}

function normalizeEncoding(encoding: string): string {
  const lower = encoding.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lower === "eucjp" || lower === "xeucjp") return "euc-jp";
  if (lower === "shiftjis" || lower === "xsjis" || lower === "sjis") return "shift_jis";
  if (lower === "iso2022jp") return "iso-2022-jp";
  return encoding.toLowerCase();
}

/** HTML の <head> から OGP メタタグをパース */
function parseOgpFromHtml(html: string): OgpData {
  const data: OgpData = {};

  // og:image（property="og:image" content="..." の両方の順序に対応）
  data.image =
    extractMetaContent(html, "og:image") ??
    extractMetaContent(html, "twitter:image");

  // og:description
  data.description =
    extractMetaContent(html, "og:description") ??
    extractMetaContent(html, "twitter:description");

  return data;
}

/** <meta property="name" content="value"> or <meta content="value" property="name"> を抽出 */
function extractMetaContent(html: string, name: string): string | undefined {
  // パターン1: property="..." content="..."
  const pattern1 = new RegExp(
    `<meta\\s+(?:property|name)=["']${escapeRegex(name)}["']\\s+content=["']([^"']*)["']`,
    "i",
  );
  const match1 = html.match(pattern1);
  if (match1) return match1[1];

  // パターン2: content="..." property="..."
  const pattern2 = new RegExp(
    `<meta\\s+content=["']([^"']*)["']\\s+(?:property|name)=["']${escapeRegex(name)}["']`,
    "i",
  );
  const match2 = html.match(pattern2);
  if (match2) return match2[1];

  return undefined;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
