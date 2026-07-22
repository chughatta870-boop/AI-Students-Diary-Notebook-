const CACHE_NAME = "studentdiary-v2"; // Version update kar di
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css", 
  "./script.js", 
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  // Google Font CSS + Font file
  "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap",
  "https://fonts.gstatic.com/s/notonastaliqurdu/v50/UcC73V5bI1mC__iA8X9ZQlXJ.woff2"
];

// 1. INSTALL - Sab files cache karo
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('App Shell Caching');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache Failed:', err))
  );
  self.skipWaiting(); // Foran activate
});

// 2. ACTIVATE - Purana cache delete
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Old cache deleted:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 3. FETCH - Smart Caching: Cache First, Network Fallback
self.addEventListener('fetch', e => {
  // Sirf GET request cache karo
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request)
      .then(cachedResponse => {
        // 1. Agar cache me hai to wahi do - Tez chalegi
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Warna network se lao aur cache me save karo
        return fetch(e.request).then(networkResponse => {
          // Sirf 200 wali response cache karo
          if (networkResponse && networkResponse.status === 200) {
            let responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 3. Agar offline hain to index.html de do
          if (e.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
