const CACHE_NAME = "flum-v1";

// App Shell: 静的リソースのみプリキャッシュ（動的ルートは fetch 時にキャッシュ）
const APP_SHELL = ["/login", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // POST, API, Supabase, auth 系はキャッシュしない
  if (
    request.method !== "GET" ||
    request.url.includes("/auth/") ||
    request.url.includes("supabase")
  ) {
    return;
  }

  // Network-first: 成功したらキャッシュ更新、失敗したらキャッシュから返す
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 正常レスポンスのみキャッシュ（リダイレクト、エラーは除外）
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
