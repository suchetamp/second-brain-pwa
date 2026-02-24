
// This file tells the browser how to handle caching.
// For the MVP, we just need it to exist and register.
const CACHE_NAME = 'second-brain-cache-v1';
const urlsToCache = [
  '/',
  '/public/index.html', // Adjust path if index is not in public
  '/public/manifest.json',
  // Add your icon URL here if you want it cached offline (optional for now)
];

// Install Event: Cache the necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event: Serve cached files first if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the resource
        if (response) {
          return response;
        }
        // Clone the request and fetch from network
        return fetch(event.request.clone());
      })
  );
});
