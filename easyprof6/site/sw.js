// Fichier généré par tools/gen-sw.mjs : ne pas modifier à la main.
const VERSION = '13cae5fb6c';
const CACHE = 'ep6-' + VERSION;
const ASSETS = [
 "/",
 "/css/app.css",
 "/fonts/fraunces-latin-wght-italic.woff2",
 "/fonts/fraunces-latin-wght-normal.woff2",
 "/fonts/inter-latin-wght-normal.woff2",
 "/icons/armoiries.png",
 "/icons/icon-192.png",
 "/icons/icon-512.png",
 "/icons/icon-maskable-512.png",
 "/icons/logo.svg",
 "/index.html",
 "/js/actions.js",
 "/js/api.js",
 "/js/app.js",
 "/js/auth.js",
 "/js/calc.js",
 "/js/charts.js",
 "/js/consts.js",
 "/js/dates.js",
 "/js/defaults.js",
 "/js/i18n.js",
 "/js/icons.js",
 "/js/import-old.js",
 "/js/lang-en.js",
 "/js/main.js",
 "/js/pages/entry.js",
 "/js/pages/home.js",
 "/js/pages/lessons.js",
 "/js/pages/log.js",
 "/js/pages/report.js",
 "/js/pages/settings.js",
 "/js/pages/team.js",
 "/js/shared/merge.js",
 "/js/store.js",
 "/js/sync.js",
 "/js/ui.js",
 "/js/vendor/preact-htm.js",
 "/js/version.js",
 "/js/widgets.js",
 "/manifest.webmanifest"
];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('ep6-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour dès qu'on est en ligne), cache en secours (hors ligne). L'API n'est jamais mise en cache.
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-cache' });
      if (res.ok) { const c = await caches.open(CACHE); c.put(r, res.clone()); }
      return res;
    } catch (err) {
      const m = await caches.match(r, { ignoreSearch: true });
      if (m) return m;
      if (r.mode === 'navigate') { const i = await caches.match('/index.html') || await caches.match('/'); if (i) return i; }
      return new Response('Hors ligne', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  })());
});
