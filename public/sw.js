const CACHE_NAME_STATIC = 'devadarshan-static-v3';
const CACHE_NAME_DYNAMIC = 'devadarshan-dynamic-v3';
const CACHE_NAME_IMAGES = 'devadarshan-images-v3';

const STATIC_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/audio/shank.mp3',
  '/images/pandals/lalbaug_360.png',
  '/images/pandals/gsb_360.png',
  '/images/pandals/chintamani_360.png',
  '/images/pandals/khetwadi_360.png',
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME_STATIC, CACHE_NAME_DYNAMIC, CACHE_NAME_IMAGES];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => !allowedCaches.includes(key)).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Advanced Offline-First & Stale-While-Revalidate Routing Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Non-GET requests pass through directly
  if (request.method !== 'GET') return;

  // 1. Cache-First Strategy for Audio & 360 Panorama Textures
  if (request.destination === 'image' || request.destination === 'audio' || url.pathname.startsWith('/images/') || url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.open(CACHE_NAME_IMAGES).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return caches.match('/audio/shank.mp3');
          });
        });
      })
    );
    return;
  }

  // 2. Stale-While-Revalidate Strategy for HTML Pages & Static Shell JS/CSS
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || caches.match('/');
      });

      return cachedResponse || fetchPromise;
    })
  );
});
