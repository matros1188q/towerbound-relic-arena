'use strict';

const CACHE = 'towerbound-v31';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './juice-pwa.css',
  './native-pwa.css',
  './juice-pwa.js',
  './rpg-mode.js',
  './rpg-expansion.js',
  './rpg-rework-v2.js',
  './rpg-rework-ui.css.js',
  './rpg-rework-ui.js',
  './assets/ui/logo.jpeg',
  './assets/ui/art-sprites.css',
  "./assets/characters/heroes/image.jpeg",
  "./assets/characters/heroes/image 2.jpeg",
  "./assets/characters/heroes/image 3.jpeg",
  "./assets/characters/heroes/image 4.jpeg",
  "./assets/characters/heroes/image 5.jpeg",
  "./assets/characters/heroes/image 6.jpeg",
  "./assets/characters/heroes/image 7.jpeg",
  "./assets/characters/enemies/image 2.jpeg",
  "./assets/characters/enemies/image 3.jpeg",
  "./assets/characters/enemies/image 4.jpeg",
  "./assets/characters/enemies/image 5.jpeg",
  "./assets/characters/enemies/image 6.jpeg",
  "./assets/characters/enemies/image 7.jpeg",
  "./assets/characters/enemies/image 8.jpeg",
  "./assets/characters/enemies/image 9.jpeg",
  "./assets/characters/enemies/image 10.jpeg",
  "./assets/characters/enemies/image 11.jpeg",
  "./assets/characters/enemies/image 12.jpeg",
  "./assets/characters/enemies/image 13.jpeg",
  "./assets/characters/enemies/image 14.jpeg",
  "./assets/characters/enemies/image 15.jpeg",
  "./assets/characters/enemies/image 16.jpeg",
  "./assets/characters/enemies/image 17.jpeg",
  "./assets/characters/enemies/image 18.jpeg",
  "./assets/characters/enemies/image 20.jpeg",
  "./assets/characters/enemies/image.jpeg",
  "./assets/characters/bosses/image 19.jpeg",
  "./assets/characters/bosses/image 3.jpeg",
  "./assets/characters/bosses/image 4.jpeg",
  "./assets/characters/bosses/image 11.jpeg",
  "./assets/characters/bosses/image 12.jpeg",
  "./assets/chapters/image 2.jpeg",
  "./assets/chapters/image 3.jpeg",
  "./assets/chapters/image 4.jpeg",
  "./assets/chapters/image 5.jpeg",
  "./assets/chapters/image.jpeg",
  "./assets/relics/image 2.jpeg",
  "./assets/relics/image 3.jpeg",
  "./assets/relics/image 4.jpeg",
  "./assets/relics/image 5.jpeg",
  "./assets/relics/image 6.jpeg",
  "./assets/relics/image 7.jpeg",
  "./assets/relics/image 8.jpeg",
  "./assets/relics/image 9.jpeg",
  "./assets/relics/image 10.jpeg",
  "./assets/relics/image 12.jpeg",
  "./assets/relics/image 14.jpeg",
  "./assets/relics/image 18.jpeg",
  "./assets/icons/image 11.png",
  "./assets/icons/image 13.png",
  "./assets/icons/image 14.jpeg",
  "./assets/icons/image 15.png",
  "./assets/icons/image 16.png",
  "./assets/icons/image 17.png",
  "./assets/icons/image 19.jpeg",
  "./assets/icons/image.jpeg",
  "./assets/ui/art-manifest.json",
  "./assets/ui/logo.jpeg",
  "./assets/ui/art-sprites.css",
  './assets/chapters/image 2.jpeg',
  './endgame-systems.js',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })).map(request => request)))
      .catch(error => console.warn('Towerbound shell cache:', error))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('towerbound-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML documents must prefer the network so an installed PWA sees releases.
  // The service-worker script itself is fetched by the browser's update
  // algorithm, not intercepted here; updateViaCache: 'none' handles that path.
  const isHtml = request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html');

  if (isHtml) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Other same-origin assets remain cache-first for fast repeat launches.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
