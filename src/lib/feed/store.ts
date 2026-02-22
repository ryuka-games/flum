import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "flum-feed-items";
const DB_VERSION = 1;
const STORE_NAME = "feed-items";
const CHANGE_EVENT = "feed-items-change";

const HOUSEKEEPING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- Types ---

export type StoredFeedItem = {
  idbId?: number;
  feedSourceId: string;
  title: string;
  url: string;
  content: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  fetchedAt: number;
};

/** putItems が受け取る型（fetchedAt は内部で付与） */
export type FeedItemInput = Omit<StoredFeedItem, "idbId" | "fetchedAt">;

// --- IndexedDB ---

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "idbId",
          autoIncrement: true,
        });
        store.createIndex("feedSourceId", "feedSourceId", { unique: false });
        store.createIndex("dedupKey", ["feedSourceId", "url"], {
          unique: true,
        });
      },
    });
  }
  return dbPromise;
}

// --- In-memory cache ---

let cachedItems: StoredFeedItem[] | null = null;
let cachedSourceIds: string[] | null = null;

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

// --- Public async API ---

/** IDB に書き込む（fetchedAt は自動付与、dedupKey 重複はスキップ）。イベントは発火しない。 */
export async function putItems(items: FeedItemInput[]): Promise<void> {
  if (items.length === 0) return;

  const now = Date.now();
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(tx.objectStoreNames[0]);
  const dedupIndex = store.index("dedupKey");

  for (const item of items) {
    // 存在チェック → なければ add（ConstraintError でトランザクション abort を防ぐ）
    const existing = await dedupIndex.getKey([item.feedSourceId, item.url]);
    if (existing === undefined) {
      await store.add({ ...item, fetchedAt: now });
    }
  }

  await tx.done;
  cachedItems = null;
  cachedSourceIds = null;
}

/** IDB に書き込み → 指定 sourceIds で再読み込み → イベント発火。呼び出し側で getItemsBySourceIds を呼ぶ必要なし。 */
export async function saveAndNotify(
  items: FeedItemInput[],
  sourceIds: string[],
): Promise<void> {
  await putItems(items);
  await getItemsBySourceIds(sourceIds);
}

/** チャンネルのソース ID 群で items を取得（publishedAt 降順）。キャッシュ更新 + イベント発火。 */
export async function getItemsBySourceIds(
  sourceIds: string[],
): Promise<StoredFeedItem[]> {
  if (sourceIds.length === 0) return [];

  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const index = tx.objectStore(tx.objectStoreNames[0]).index("feedSourceId");

  const results: StoredFeedItem[] = [];
  const idSet = new Set(sourceIds);

  for (const id of idSet) {
    const items = await index.getAll(id);
    results.push(...items);
  }

  await tx.done;

  // publishedAt 降順ソート（null は末尾）
  results.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  cachedItems = results;
  cachedSourceIds = sourceIds;
  notifyChange();

  return results;
}

/** publishedAt が7日超のレコードを削除（IDB ハウスキーピング）。publishedAt が null の場合は fetchedAt でフォールバック。 */
export async function pruneExpiredItems(): Promise<void> {
  const now = Date.now();
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(tx.objectStoreNames[0]);

  let cursor = await store.openCursor();
  let deleted = false;
  while (cursor) {
    const item = cursor.value as StoredFeedItem;
    const ageMs = item.publishedAt
      ? now - new Date(item.publishedAt).getTime()
      : now - item.fetchedAt;
    if (!isNaN(ageMs) && ageMs >= HOUSEKEEPING_MAX_AGE_MS) {
      cursor.delete();
      deleted = true;
    }
    cursor = await cursor.continue();
  }

  await tx.done;
  if (deleted) {
    cachedItems = null;
    cachedSourceIds = null;
    notifyChange();
  }
}

/** ソース削除時のクリーンアップ */
export async function deleteItemsBySourceId(
  sourceId: string,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const index = tx.objectStore(tx.objectStoreNames[0]).index("feedSourceId");

  let cursor = await index.openCursor(sourceId);
  let deleted = false;
  while (cursor) {
    cursor.delete();
    deleted = true;
    cursor = await cursor.continue();
  }

  await tx.done;
  if (deleted) {
    cachedItems = null;
    cachedSourceIds = null;
    notifyChange();
  }
}

// --- useSyncExternalStore API (sync) ---

const EMPTY: StoredFeedItem[] = [];

/** キャッシュから同期的に返す（useSyncExternalStore の getSnapshot） */
export function getItemsSnapshot(sourceIds: string[]): StoredFeedItem[] {
  if (
    cachedItems &&
    cachedSourceIds &&
    cachedSourceIds.length === sourceIds.length &&
    cachedSourceIds.every((id, i) => id === sourceIds[i])
  ) {
    return cachedItems;
  }
  return EMPTY;
}

/** useSyncExternalStore の subscribe */
export function subscribeFeedItems(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}
