// Banff Road Trip — Service Worker v9
// Offline-capable PWA strategy:
//   • /_next/static/ → cache-first (content-hashed filenames, safe forever)
//   • Pages (/, /talk, etc.) → network-first, fall back to cache
//   • Images / manifest → cache-first
// On every SW update ALL old caches are wiped so stale JS never accumulates.

const CACHE        = "banff-pages-v10";
const STATIC_CACHE = "banff-static-v10";

// Pages to pre-cache during install so the app works offline immediately
const PAGES = [
  "/", "/talk", "/fact", "/truefalse", "/quiz", "/game", "/riddle", "/rhyme", "/spinner", "/dragon", "/saved",
  "/nearby",
  "/waypoint/revelstoke", "/waypoint/glaciernp", "/waypoint/yoho",
  "/waypoint/canmore", "/waypoint/johnstoncanyon", "/waypoint/lakelouise",
  "/waypoint/morainelake", "/waypoint/peytolake", "/waypoint/columbiaicefield",
  "/waypoint/grassi", "/waypoint/drumheller", "/waypoint/radium",
  "/waypoint/penticton",
];

// ── Install: pre-cache all pages ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PAGES).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: wipe ALL old caches, claim clients ─────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Skip-waiting on demand (from layout.tsx postMessage) ─────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // /_next/static/ → cache-first
  // Safe because Next.js content-hashes every filename; new deploys = new URLs.
  // Old hashed files are never requested after a deploy, and the activate
  // handler wipes them on every SW update anyway.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Images / manifest → cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Pages → network-first, fall back to cache, last resort: "/"
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((cache) => cache.put(request, res.clone()));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/"))
      )
  );
});
