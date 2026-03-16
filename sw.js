// LeadHunter Pro — Service Worker
// Caches the app shell so it loads instantly and works offline
// (Searches still need internet; all your saved leads are always available offline)

const CACHE = 'leadhunter-v2';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // For API calls (SerpAPI, HasData) — always go to network
  if (e.request.url.includes('serpapi.com') || e.request.url.includes('hasdata.com')) {
    return;
  }
  // For Google Fonts — network first, fall back to cache
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // For everything else (app shell) — cache first, then network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
