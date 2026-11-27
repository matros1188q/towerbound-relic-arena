'use strict';

const CACHE = 'towerbound-v817';
/* Three-zone card battle arena and post-battle loot layout */
const SHELL = [
  './assets/backgrounds/dungeons/D01_capital_sewers_2dark.jpg',
  './assets/backgrounds/dungeons/D02_ancient_catacombs_2dark.jpg',
  './assets/backgrounds/dungeons/D03_royal_treasure_vault_2dark.jpg',
  './assets/backgrounds/dungeons/D04_sealed_dungeon_cells_2dark.jpg',
  './assets/backgrounds/dungeons/D05_ruined_white_chapel_2dark.jpg',
  './assets/backgrounds/dungeons/D06_labyrinth_beneath_the_capital_2dark.jpg',
  './assets/backgrounds/dungeons/D07_mossy_forest_temple_2dark.jpg',
  './assets/backgrounds/dungeons/D08_cave_of_the_giant_roots_2dark.jpg',
  './assets/backgrounds/dungeons/D09_spirit_stone_circle_2dark.jpg',
  './assets/backgrounds/dungeons/D10_fallen_forest_castle_gate_2dark.jpg',
  './assets/backgrounds/dungeons/D11_overgrown_ancient_city_2dark.jpg',
  './assets/backgrounds/dungeons/D12_giant_mushroom_cavern_2dark.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })).map(request => request)))
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

  const path = url.pathname.toLowerCase();
  const isHtml = request.mode === "navigate" || path.endsWith("/") || path.endsWith("/index.html");
  const isCode = /\.(?:js|mjs|css|json|webmanifest)$/.test(path);
  const mustRevalidate = isHtml || isCode || url.search.length > 0;

  // Always revalidate the app shell and executable/style/data files against GitHub Pages.
  // cache:'no-store' bypasses Safari's HTTP cache; Cache Storage is retained only as an offline fallback.
  if (mustRevalidate) {
    event.respondWith((async () => {
      try {
        const freshRequest = new Request(request, { cache: 'no-store' });
        const response = await fetch(freshRequest);
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isHtml) return await caches.match('./index.html') || Response.error();
        return Response.error();
      }
    })());
    return;
  }

  // Large media files stay cache-first for fast repeat launches and offline play.
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => Response.error());
  }));
});


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })).map(request => request)))
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

  const path = url.pathname.toLowerCase();
  const isHtml = request.mode === "navigate" || path.endsWith("/") || path.endsWith("/index.html");
  const isCode = /\.(?:js|mjs|css|json|webmanifest)$/.test(path);
  const mustRevalidate = isHtml || isCode || url.search.length > 0;

  // Always revalidate the app shell and executable/style/data files against GitHub Pages.
  // cache:'no-store' bypasses Safari's HTTP cache; Cache Storage is retained only as an offline fallback.
  if (mustRevalidate) {
    event.respondWith((async () => {
      try {
        const freshRequest = new Request(request, { cache: 'no-store' });
        const response = await fetch(freshRequest);
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isHtml) return await caches.match('./index.html') || Response.error();
        return Response.error();
      }
    })());
    return;
  }

  // Large media files stay cache-first for fast repeat launches and offline play.
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => Response.error());
  }));
});
