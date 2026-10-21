// Minimal offline-first service worker for the BV380 Farm Manager.
// Static assets are cache-first; navigations try the network and fall
// back to the cached shell so the farm data (in localStorage) stays
// reachable with no connection.
const CACHE = "bv380-static-v1";
const SHELL = ["/", "/index.html", "/favicon.svg", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigations: network first, cached shell as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Same-origin static assets: cache first, refresh in background.
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const refreshed = fetch(request)
          .then(response => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || refreshed;
      })
    );
  }
  // Cross-origin requests (e.g. Telegram API) go straight to the network.
});
