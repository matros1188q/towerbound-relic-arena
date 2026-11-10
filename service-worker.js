const CACHE='towerbound-native-pwa-v6';
const SHELL=['./','./index.html','./manifest.json','./juice-pwa.css','./native-pwa.css','./juice-pwa.js','./rpg-mode.js','./rpg-expansion.js','./rpg-rework-v2.js','./rpg-rework-ui.css.js','./rpg-rework-ui.js','./endgame-systems.js','./assets/pwa/icon-192.png','./assets/pwa/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE)
  .then(cache=>cache.addAll(SHELL.map(path=>new Request(path,{cache:'reload'}))).catch(()=>{}))
  .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys()
  .then(keys=>Promise.all(keys.filter(key=>key.startsWith('towerbound-')&&key!==CACHE).map(key=>caches.delete(key))))
  .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>{
  if(cached)return cached;
  return fetch(request).then(response=>{
   if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
   return response;
  }).catch(()=>caches.match('./index.html'));
 }));
});