self.addEventListener("fetch", (event) => {
  // Network-first strategy (offline caching is a v2 concern)
  event.respondWith(fetch(event.request));
});
