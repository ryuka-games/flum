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
    const html = await readHead(response, OGP_MAX_BYTES);
    return parseOgpFromHtml(html);
  } catch {
    return {};
  }
}

/**
 * 複数の URL から OGP を並列取得して Map で返す。
 */
export async function fetchOgpBatch(
  urls: string[],
): Promise<Map<string, OgpData>> {
  const results = await Promise.allSettled(
    urls.map(async (url) => ({ url, data: await fetchOgpData(url) })),
  );

  const map = new Map<string, OgpData>();
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.data.image) {
      map.set(result.value.url, result.value.data);
    }
  }
  return map;
}

/** レスポンスから <head> 部分だけを読み取る */
async function readHead(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let totalSize = 0;
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalSize += value.length;
    chunks.push(value);
    accumulated += decoder.decode(value, { stream: true });

    // </head> を見つけたら読み取り停止
    if (accumulated.includes("</head>") || accumulated.includes("</HEAD>")) {
      reader.cancel();
      break;
    }

    if (totalSize > maxBytes) {
      reader.cancel();
      break;
    }
  }

  return accumulated;
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
