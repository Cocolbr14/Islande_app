// Service Worker minimal : permet d'ouvrir l'appli et de voir le planning
// même sans réseau (fréquent en Islande hors des villes).
// shortcut: cache "best effort" uniquement (pas de vraie synchro hors-ligne
// des écritures) ; si un jour l'appli grossit beaucoup, passer par Workbox.
const CACHE_NAME = "islande-app-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./fx.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie "cache d'abord, puis réseau en secours" pour les requêtes GET
// (fonctionne aussi pour les scripts externes type Tailwind/Leaflet/Supabase,
// sauf s'ils refusent explicitement d'être mis en cache cross-origin).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
