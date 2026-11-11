'use strict';

const CACHE = 'towerbound-v90';
/* Battle arena and post-battle loot mobile layout hotfix */
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
  "./assets/characters/bosses/void-hunter-boss.png",
  "./assets/characters/bosses/soul-devourer.png",
  "./assets/characters/bosses/root-titan.png",
  "./assets/characters/bosses/bone-colossus.png",
  "./assets/characters/bosses/abyss-queen.png",
  "./assets/characters/heroes/warden.png",
  "./assets/characters/heroes/reaper.png",
  "./assets/characters/heroes/ranger.png",
  "./assets/characters/heroes/arcanist.png",
  "./assets/skills/image 17.png",
  "./assets/relics/image 19.png",
  "./assets/relics/image 17.png",
  "./assets/relics/image 16.png",
  "./assets/relics/image 15.png",
  "./assets/relics/image 13.png",
  "./assets/relics/image 11.png",
  "./assets/characters/heroes/image-Photoroom.png",
  "./assets/characters/heroes/image 2-Photoroom(1).png",
  "./assets/characters/heroes/image 3-Photoroom.png",
  "./assets/characters/heroes/image 4-Photoroom.png",
  "./assets/characters/heroes/image 5-Photoroom.png",
  "./assets/characters/heroes/image 6-Photoroom.png",
  "./assets/characters/heroes/image 7-Photoroom.png",
  "./assets/characters/enemies/image 2.png",
  "./assets/characters/enemies/image 3.png",
  "./assets/characters/enemies/image 4.png",
  "./assets/characters/enemies/image 5.png",
  "./assets/characters/enemies/image 6.png",
  "./assets/characters/enemies/image 7.png",
  "./assets/characters/enemies/image 8.png",
  "./assets/characters/enemies/image 9.png",
  "./assets/characters/enemies/image 10.png",
  "./assets/characters/enemies/image 11.png",
  "./assets/characters/enemies/image 12.png",
  "./assets/characters/enemies/image 13.png",
  "./assets/characters/enemies/image 14.png",
  "./assets/characters/enemies/image 15.png",
  "./assets/characters/enemies/image 16.png",
  "./assets/characters/enemies/image 17.png",
  "./assets/characters/enemies/image 18.png",
  "./assets/characters/enemies/image 20.png",
  "./assets/characters/enemies/image.png",
  "./assets/characters/bosses/mirror-executioner.png",
  "./assets/characters/bosses/image 3.png",
  "./assets/characters/bosses/image 4.png",
  "./assets/characters/bosses/image 11.png",
  "./assets/characters/bosses/image 12.png",
  "./assets/chapters/image 2.jpeg",
  "./assets/chapters/image 3.jpeg",
  "./assets/chapters/image 4.jpeg",
  "./assets/chapters/image 5.jpeg",
  "./assets/chapters/image.jpeg",
  "./assets/relics/image 2.png",
  "./assets/relics/image 3.png",
  "./assets/relics/image 4.png",
  "./assets/relics/image 5.png",
  "./assets/relics/image 6.png",
  "./assets/relics/image 7.png",
  "./assets/relics/image 8.png",
  "./assets/relics/image 9.png",
  "./assets/relics/image 10.png",
  "./assets/relics/image 12.png",
  "./assets/relics/image 14.png",
  "./assets/relics/image 18.png",
  "./assets/icons/image 11.png",
  "./assets/icons/image 13.png",
  "./assets/icons/image 14.png",
  "./assets/icons/image 15.png",
  "./assets/icons/image 16.png",
  "./assets/icons/image 17.png",
  "./assets/icons/image 19.png",
  "./assets/icons/image.png",
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
