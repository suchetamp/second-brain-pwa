// --- SERVICE WORKER CODE START ---

// 1. SHARE TARGET LISTENER (NEW: Catches the OS Share Event)
self.addEventListener('share', event => {
  event.preventDefault();
  
  // Send the shared data to the active client (your index.html page)
  event.target.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SHARE_DATA',
        data: event.data, // This carries the URL/Text payload
      });
    });
  });
});


// 2. INSTALL EVENT: Cache the necessary files for PWA functionality
const CACHE_NAME = 'second-brain-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', 
  '/manifest.json',
  '/SBIcon512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 3. FETCH EVENT: Serve cached files first (for offline support)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the resource
        if (response) {
          return response;
        }
        // No cache hit - clone the request and fetch from network
        return fetch(event.request.clone());
      })
  );
});

// --- SERVICE WORKER CODE END ---
