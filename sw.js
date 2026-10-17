// Service Worker minimal : permet d'ouvrir l'appli et de voir le planning
// même sans réseau (fréquent en Islande hors des villes).
// shortcut: cache "best effort" uniquement (pas de vraie synchro hors-ligne
// des écritures) ; si un jour l'appli grossit beaucoup, passer par Workbox.
const CACHE_NAME = "islande-app-v9";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./fx.js",
  "./partials/decor.html",
  "./partials/navigation.html",
  "./partials/hero.html",
  "./partials/compte-a-rebours.html",
  "./partials/aujourdhui.html",
  "./partials/meteo.html",
  "./partials/carte.html",
  "./partials/jours.html",
  "./partials/nuits.html",
  "./partials/vols.html",
  "./partials/sac.html",
  "./partials/epilogue.html",
  "./partials/modale-hebergement.html",
  "./partials/modale-repas.html",
  "./partials/visionneuse.html",
  "./js/socle.js",
  "./js/lightbox.js",
  "./js/pwa.js",
  "./js/sync.js",
  "./js/vols.js",
  "./js/compte-a-rebours.js",
  "./js/sac.js",
  "./js/menus.js",
  "./js/etapes.js",
  "./js/nuits.js",
  "./js/jours.js",
  "./js/carte.js",
  "./js/meteo.js",
  "./js/aujourdhui.js",
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
