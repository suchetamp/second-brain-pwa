
// **NEW: Add this at the top of your existing service-worker.js content**
self.addEventListener('share', event => {
  event.preventDefault();
  
  // Send the shared data to the active client (your index.html page)
  event.target.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SHARE_DATA',
        data: event.data,
      });
    });
  });
});

// Keep the rest of your existing install/fetch logic below this new listener

const CACHE_NAME = 'second-brain-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/SBIcon512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
