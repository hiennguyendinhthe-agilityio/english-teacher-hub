// SERVICE WORKER KILL SWITCH
// This version clears all caches and unregisters itself permanently.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Step 1: Delete ALL caches (old and new)
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => {
        // Step 2: Unregister this SW so browser fetches directly from network
        return self.registration.unregister();
      })
      .then(() => {
        // Step 3: Force all tabs to reload with fresh content
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});

// Step 4: Pass ALL fetch requests directly to network — no caching at all
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
