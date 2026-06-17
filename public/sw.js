const CACHE = 'gymlog-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((hit) =>
        hit || fetch(e.request).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit)
      )
    )
  );
});
