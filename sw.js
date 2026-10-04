const VERSION = "ohana-78";
const CACHE = "ohana-static-" + VERSION;
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.svg",
  "./style.css?v=" + VERSION,
  "./title-stage.css?v=" + VERSION,
  "./hud.css?v=" + VERSION,
  "./evo.css?v=" + VERSION,
  "./ending.css?v=" + VERSION,
  "./intro.css?v=" + VERSION,
  "./demo.css?v=" + VERSION,
  "./game.js?v=" + VERSION,
  "./systems/title.js?v=" + VERSION,
  "./systems/title-fx.js?v=" + VERSION,
  "./systems/ending.js?v=" + VERSION,
  "./systems/demo.js?v=" + VERSION,
  "./systems/evo-cinema.js?v=" + VERSION
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("ohana-static-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
