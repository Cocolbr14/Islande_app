const CACHE_NAME = 'islande-2027-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './offline.html'
];
const EXTERNAL_CACHE = `${CACHE_NAME}-external`;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('islande-2027-') && key !== CACHE_NAME && key !== EXTERNAL_CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (/\.supabase\.co$/.test(url.hostname)) return;
    if (
      url.hostname === 'cdn.tailwindcss.com' ||
      url.hostname === 'unpkg.com' ||
      url.hostname === 'cdn.jsdelivr.net' ||
      url.hostname === 'api.open-meteo.com' ||
      url.hostname === 'router.project-osrm.org'
    ) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(async response => {
        if (response.ok) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          } catch (error) {}
        }
        return response;
      }).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
          return caches.match('./index.html');
        }
        return caches.match('./offline.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(EXTERNAL_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then(response => {
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  });
  if (cached) {
    update.catch(() => {});
    return cached;
  }
  try {
    return await update;
  } catch {
    return Response.error();
  }
}
