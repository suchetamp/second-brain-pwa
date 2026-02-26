// --- SERVICE WORKER CODE START ---

const CACHE_NAME = 'second-brain-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', 
  '/manifest.json',
  '/SBIcon512.png'
];

// 1. INSTALL: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. FETCH: Serve cached files first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});


// 3. SHARE TARGET: Catch the share event from Android
self.addEventListener('share', event => {
  event.preventDefault();
  
  // Send the shared data to the active client (your index.html page)
  event.target.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SHARE_DATA',
        data: event.data, // This holds the shared URL/Text
      });
    });
  });
});

// --- SERVICE WORKER CODE END ---
