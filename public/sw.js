/* Bump this cache version when publishing a new application shell. */
const PREFIX='outpost-shell-';
const CACHE=PREFIX+'20261110-2';
const BASE=new URL('./',self.location.href).pathname;
const SNAPSHOT=BASE+'data/nasa-event-snapshot.json';

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const response=await fetch(BASE,{cache:'reload'});
    if(!response.ok)throw new Error('Application shell is unavailable');
    const html=await response.clone().text();
    const assets=[...html.matchAll(/(?:src|href)="([^"?#]*assets\/[^"?#]+\.(?:js|css))"/g)].map(match=>new URL(match[1],self.location.origin+BASE).pathname);
    if(!assets.length)throw new Error('Application shell has no build assets');
    await cache.put(BASE,response.clone());
    await cache.put(BASE+'index.html',response.clone());
    await Promise.all(assets.map(async path=>{const asset=await fetch(path,{cache:'reload'});if(!asset.ok)throw new Error('Application asset is unavailable');await cache.put(path,asset);}));
    await Promise.all([SNAPSHOT,BASE+'favicon.svg',BASE+'data/lro-south-pole.jpg'].map(async path=>{try{const item=await fetch(path,{cache:'reload'});if(item.ok)await cache.put(path,item);}catch{/* The bundled scenarios remain available. */}}));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();})());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok){await cache.put(BASE,response.clone());await cache.put(BASE+'index.html',response.clone());return response;}return (await cache.match(BASE))||response;}catch{const saved=await cache.match(BASE);if(saved)return saved;throw new Error('Application shell unavailable');}})());
  }else if(url.pathname===SNAPSHOT){
    event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok){await cache.put(SNAPSHOT,response.clone());return response;}return (await cache.match(SNAPSHOT))||response;}catch{const saved=await cache.match(SNAPSHOT);if(saved)return saved;throw new Error('Snapshot unavailable');}})());
  }else if(url.pathname.startsWith(BASE+'assets/')||url.pathname===BASE+'favicon.svg'||url.pathname===BASE+'data/lro-south-pole.jpg'){
    event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(request,{ignoreSearch:true});if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;})());
  }
});
