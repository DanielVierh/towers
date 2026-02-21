const CACHE_NAME = "tower-app-v2";
const APP_SHELL = [
  "./",
  "index.html",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isHtmlRequest =
    event.request.mode === "navigate" ||
    requestUrl.pathname.endsWith(".html") ||
    requestUrl.pathname === "/";

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((r) => r || caches.match("index.html")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          if (
            requestUrl.origin === self.location.origin &&
            (requestUrl.pathname.startsWith("/src/assets/") ||
              requestUrl.pathname.endsWith(".css") ||
              requestUrl.pathname.endsWith(".js") ||
              requestUrl.pathname.endsWith(".png") ||
              requestUrl.pathname.endsWith(".webp") ||
              requestUrl.pathname.endsWith(".svg") ||
              requestUrl.pathname.endsWith(".mp3") ||
              requestUrl.pathname.endsWith(".wav"))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => caches.match("index.html"));
    }),
  );
});
