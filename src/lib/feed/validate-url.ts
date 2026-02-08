import { lookup } from "dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
]);

const PRIVATE_IP_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./, // Class C private
  /^169\.254\./, // link-local
  /^0\./, // current network
];

export type UrlValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * URL の形式・プロトコル・ホスト名をチェックする（同期）
 */
export function validateFeedUrl(url: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "有効な URL を入力してください" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "有効な URL を入力してください" };
  }

  if (BLOCKED_HOSTNAMES.has(parsed.hostname)) {
    return { valid: false, error: "この URL にはアクセスできません" };
  }

  // 非標準ポートをブロック
  if (parsed.port && !["80", "443"].includes(parsed.port)) {
    return { valid: false, error: "この URL にはアクセスできません" };
  }

  return { valid: true };
}

/**
 * DNS 解決後にプライベート IP かどうかチェックする（非同期）
 */
export async function checkPrivateIp(hostname: string): Promise<boolean> {
  try {
    const { address } = await lookup(hostname);
    return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(address));
  } catch {
    // DNS 解決失敗 — フェッチ時にエラーになるのでここでは false を返す
    return false;
  }
}
