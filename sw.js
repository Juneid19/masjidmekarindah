const CACHE_NAME = 'masjid-mekarindah-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => Promise.all(
      keyList.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Abaikan request selain GET
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  
  // Hanya proses request dari web kita sendiri (same-origin), abaikan gambar/video dari link luar
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
