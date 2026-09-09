// Service Worker v5 - Nuclear cache clear
// This version clears ALL old caches and re-caches fresh content
const CACHE_NAME = 'ms-van-english-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA Service Worker] Pre-cache warning:', err);
      });
    })
  );
  // Immediately take control — don't wait for old tabs to close
  self.skipWaiting();
});

// Activate Event: Wipe ALL old caches — force fresh content on every deploy
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    }).then(() => {
      // Tell all clients to reload to get fresh content
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      });
    })
  );
});

// Fetch Event: Network-first for ALL requests — no stale cache issues
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // For HTML navigation: always go to network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets (JS, CSS, fonts): Network first, cache as fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 &&
            (request.url.includes('/assets/') || request.url.includes('fonts.'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
