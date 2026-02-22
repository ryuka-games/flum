import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "flum-wallpapers";
const DB_VERSION = 1;
const STORE_NAME = "wallpapers";
const CHANGE_EVENT = "wallpaper-change";

// In-memory cache: channelId → objectURL
const cache = new Map<string, string>();

// --- IndexedDB ---

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise;
}

// --- Public async API ---

export async function loadWallpaper(
  channelId: string,
): Promise<string | null> {
  if (cache.has(channelId)) return cache.get(channelId)!;

  try {
    const db = await getDB();
    const blob: Blob | undefined = await db.get(STORE_NAME, channelId);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    cache.set(channelId, url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return url;
  } catch {
    return null;
  }
}

export async function setWallpaper(
  channelId: string,
  file: File,
): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, file, channelId);

  // Revoke old objectURL if cached
  const old = cache.get(channelId);
  if (old) URL.revokeObjectURL(old);

  const url = URL.createObjectURL(file);
  cache.set(channelId, url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export async function removeWallpaper(channelId: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, channelId);

  const old = cache.get(channelId);
  if (old) URL.revokeObjectURL(old);
  cache.delete(channelId);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// --- useSyncExternalStore API (sync) ---

export function getWallpaperUrl(channelId: string): string | null {
  return cache.get(channelId) ?? null;
}

export function subscribeWallpaper(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}
