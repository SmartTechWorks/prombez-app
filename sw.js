// Поднимайте версию при любой правке файлов (в т.ч. JSON), иначе телефон будет жить со старым кэшем.
const CACHE_VERSION = 'prombez-v2';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/app.js',
  './js/router.js',
  './js/store.js',
  './js/render.js',
  './js/figures.js',
  './js/home.js',
  './js/theory.js',
  './js/cards.js',
  './js/quiz.js',
  './js/sequence.js',
  './js/results.js',
  './js/mistakes.js',
  './js/progress.js',
  './data/topics.json',
  './data/theory.json',
  './data/cards.json',
  './data/questions.json',
  './data/sequences.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Cache-first: всё своё лежит в кэше; сеть только как запасной путь и для обновления копии.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE_VERSION).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
