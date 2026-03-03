/**
 * フィードエラーの軽量 store（useSyncExternalStore 対応）
 * チャンネルID → { ソースID → エラーメッセージ } のマッピング
 */

const CHANGE_EVENT = "feed-errors-change";

const errorsByChannel: Record<string, Record<string, string>> = {};

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

/** チャンネルのエラーを更新。成功したソースはクリアされる */
export function setFeedErrors(
  channelId: string,
  errors: Record<string, string>,
  clearedSourceIds: string[],
): void {
  const prev = errorsByChannel[channelId] ?? {};
  const next = { ...prev };

  // 成功したソースのエラーをクリア
  for (const id of clearedSourceIds) {
    delete next[id];
  }

  // 新しいエラーを追加
  for (const [id, msg] of Object.entries(errors)) {
    next[id] = msg;
  }

  // 空ならエントリ自体を削除
  if (Object.keys(next).length === 0) {
    delete errorsByChannel[channelId];
  } else {
    errorsByChannel[channelId] = next;
  }

  notify();
}

/** ソース削除時にそのソースのエラーをクリア */
export function clearFeedError(channelId: string, sourceId: string): void {
  const errors = errorsByChannel[channelId];
  if (!errors || !(sourceId in errors)) return;
  // ミュートせず新オブジェクトを作成（snapshotCache の参照比較を正しく動かすため）
  const { [sourceId]: _, ...rest } = errors;
  if (Object.keys(rest).length === 0) {
    delete errorsByChannel[channelId];
  } else {
    errorsByChannel[channelId] = rest;
  }
  notify();
}

// --- useSyncExternalStore API ---

const snapshotCache: Record<string, Record<string, string>> = {};

/** getSnapshot: チャンネルのエラーを返す */
export function getFeedErrorsSnapshot(
  channelId: string,
): Record<string, string> {
  const errors = errorsByChannel[channelId];
  if (!errors) return EMPTY;
  // 参照安定化
  if (snapshotCache[channelId] !== errors) {
    snapshotCache[channelId] = errors;
  }
  return snapshotCache[channelId];
}

const EMPTY: Record<string, string> = {};

/** subscribe */
export function subscribeFeedErrors(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/** 任意のチャンネルにエラーがあるか（Rail のドット用） */
export function hasAnyErrors(): boolean {
  return Object.keys(errorsByChannel).length > 0;
}

/** 特定チャンネルにエラーがあるか */
export function hasChannelErrors(channelId: string): boolean {
  const errors = errorsByChannel[channelId];
  return !!errors && Object.keys(errors).length > 0;
}

/** getSnapshot for hasChannelErrors（チャンネルIDリスト → エラーありIDセット） */
let cachedErrorIdSet: Set<string> = new Set();
let cachedErrorIdKey = "";

export function getChannelErrorIdsSnapshot(
  channelIds: string[],
): Set<string> {
  // エラーありチャンネルIDをソートした文字列で比較（参照安定化）
  const ids: string[] = [];
  for (const id of channelIds) {
    if (hasChannelErrors(id)) ids.push(id);
  }
  const key = ids.join(",");
  if (key !== cachedErrorIdKey) {
    cachedErrorIdKey = key;
    cachedErrorIdSet = new Set(ids);
  }
  return cachedErrorIdSet;
}
