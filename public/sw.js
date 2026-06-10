// Banff Road Trip — Service Worker
// Strategy: cache-first for static assets, network-first for pages (fallback to cache)

const CACHE  = "banff-trip-v5";
const STATIC = "banff-static-v5";

// Pre-cache these on install so the app works immediately offline
const PRECACHE = [
  "/",
  "/talk",
  "/fact",
  "/truefalse",
  "/quiz",
  "/game",
  "/riddle",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {
        // Some URLs may 404 during build — don't fail the whole install
      })
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (e.g. DiceBear, Google Fonts)
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const isStatic = url.pathname.startsWith("/_next/static/") ||
                   url.pathname.startsWith("/icons/") ||
                   url.pathname.endsWith(".png") ||
                   url.pathname.endsWith(".ico") ||
                   url.pathname === "/manifest.json";

  if (isStatic) {
    // Cache-first: static assets never change (content-hashed)
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
  } else {
    // Network-first for pages: try network, fall back to cache
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((cached) =>
          cached || caches.match("/")
        ))
    );
  }
});
