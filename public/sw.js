const CACHE_NAME_STATIC = 'devadarshan-static-v2';
const CACHE_NAME_DYNAMIC = 'devadarshan-dynamic-v2';
const CACHE_NAME_IMAGES = 'devadarshan-images-v2';

const STATIC_SHELL_ASSETS = [
  '/',
  '/manifest.json',
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

  // Non-GET requests (e.g. POST submissions) pass through directly
  if (request.method !== 'GET') return;

  // 1. Cache-First Strategy for 360 Panorama Textures & Images
  if (request.destination === 'image' || url.pathname.startsWith('/images/')) {
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
            // Fallback default image if offline and uncached
            return caches.match('/images/pandals/lalbaug_360.png');
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
