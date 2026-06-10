// Banff Road Trip — Service Worker v6
// JS chunks are NEVER cached (they can go stale and break the app).
// Only truly static assets (images, icons, manifest) use cache-first.
// Pages use network-first with cache fallback.

const CACHE  = "banff-trip-v6";
const STATIC = "banff-static-v6";

// Delete ALL old caches immediately on activate
self.addEventListener("install", () => self.skipWaiting());

// Also skip waiting if the page asks us to (via postMessage)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (Google Fonts, DiceBear, etc.)
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // NEVER cache JS/CSS chunks — always fetch fresh from network
  // This prevents stale bundles from breaking the app after deploys
  if (url.pathname.startsWith("/_next/static/")) return;

  // Cache-first: images, icons, manifest (content-addressed, truly static)
  const isMedia = url.pathname.startsWith("/icons/") ||
                  url.pathname.endsWith(".png") ||
                  url.pathname.endsWith(".ico") ||
                  url.pathname === "/manifest.json";

  if (isMedia) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC).then((c) => c.put(request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // Network-first for HTML pages: always try network, fall back to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((c) => c || caches.match("/")))
  );
});
