/* Выключатель. Приложение закрыто: кэш удаляется, все запросы получают заглушку. */
const STUB = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1F2933"><title>Приложение больше не доступно</title>
<style>html,body{height:100%;margin:0;background:#1F2933;color:#cfd6de;font:18px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box}</style>
</head><body><p>Приложение больше не доступно</p>
<script>(async()=>{try{localStorage.clear()}catch(e){}try{sessionStorage.clear()}catch(e){}try{if(indexedDB.databases){for(const d of await indexedDB.databases()){if(d.name)indexedDB.deleteDatabase(d.name)}}}catch(e){}try{for(const k of await caches.keys())await caches.delete(k)}catch(e){}})();</script>
</body></html>`;

const stubResponse = () => new Response(STUB, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      try { await client.navigate(self.registration.scope); } catch (e) { /* окно закрыто или навигация запрещена */ }
    }
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(stubResponse());
});
