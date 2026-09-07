/* ============================================================
   Service Worker — Endrit Krasniqi PWA
   Strategy: precache app shell + assets, cache-first for static,
   network-first for navigation with offline fallback.
   ============================================================ */
const VERSION = "ek-v1.0.0";
const APP_SHELL = "ek-shell-" + VERSION;
const RUNTIME = "ek-runtime-" + VERSION;

const PRECACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/translations.js",
  "./js/projects.js",
  "./js/menu.js",
  "./js/animations.js",
  "./js/app.js",
  "./assets/images/projekt-01.jpg",
  "./assets/images/projekt-02.jpg",
  "./assets/images/projekt-03.jpg",
  "./assets/images/projekt-04.jpg",
  "./assets/images/projekt-05.jpg",
  "./assets/images/projekt-06.jpg",
  "./assets/images/projekt-07.jpg",
  "./assets/images/projekt-08.jpg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== APP_SHELL && k !== RUNTIME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigation requests → network-first, fallback to cache/offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("./index.html")).then((r) => r || caches.match("./offline.html"))
        )
    );
    return;
  }

  // Google Fonts → stale-while-revalidate
  if (url.origin.includes("fonts.googleapis.com") || url.origin.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(RUNTIME).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req).then((res) => { cache.put(req, res.clone()); return res; }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // Static assets → cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        if (req.destination === "image") return caches.match("./assets/icons/icon-512.png");
        return caches.match("./offline.html");
      });
    })
  );
});
