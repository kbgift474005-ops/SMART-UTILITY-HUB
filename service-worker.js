// Service Worker file
// PWA ko offline chalaane ke liye yeh file zaroori hai. (This file is necessary to run PWA offline.)

const CACHE_NAME = 'utility-app-v1';
// Sirf do files hain jinhe cache karna hai, kyuki saara code index.html mein hai.
// (There are only two files to cache, as all the code is in index.html.)
const urlsToCache = [
  './', // Index page
  'index.html',
  'manifest.json'
];

// Installation: Assets ko cache mein jodna
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  // Service Worker ko turant activate karna
  self.skipWaiting();
});

// Activation: Purane caches ko delete karna
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Client claims karna, taaki naya worker turant control le sake
  return self.clients.claim();
});

// Fetch: Cached assets se content serve karna (Cache-First Strategy)
self.addEventListener('fetch', event => {
  // Check karna ki request cross-origin hai ya nahi
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit, cache se response return karo
          if (response) {
            return response;
          }
          // Cache miss, network se fetch karo
          return fetch(event.request);
        })
    );
  }
});
