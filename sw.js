const CACHE_VERSION = 'tetris_cache_v2';
const appShellFiles = [
  './index.html',
  './manifest.json',
  './images/app.png',
  './src/app.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(appShellFiles);
    })
  );
});

self.addEventListener('fetch', (e)=>{
  console.log("sw.js fetch..")
  e.respondWith(
    caches.match(e.request).then((res)=>{
      return res || fetch(e.request).then(async (response) => {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(e.request, response.clone());
          return response;
        });
    })
  );
});

self.addEventListener("activate",(e)=>{
  console.log("activate sw.js..")
  e.waitUntil(
    caches.keys().then((keys)=>{
      return Promise.all(
        keys.map((key) => {
            if (CACHE_VERSION !== key && key.startsWith(CACHE_VERSION)) {
              console.log("cache.delete");
              return caches.delete(key);
            }
          })
      );
    })
  )
});
