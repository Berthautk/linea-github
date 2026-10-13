// Génère site/sw.js : liste des fichiers du site + empreinte du contenu (une nouvelle version de l'app = un nouveau cache).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else files.push(p); } })(root);
const rel = (p) => '/' + path.relative(root, p).split(path.sep).join('/');
const assets = files.map(rel).filter(f => f !== '/sw.js');
const hash = crypto.createHash('sha1'); for (const f of files) if (rel(f) !== '/sw.js') { hash.update(rel(f)); hash.update(fs.readFileSync(f)); }
const version = hash.digest('hex').slice(0, 10);
const sw = `// Fichier généré par tools/gen-sw.mjs : ne pas modifier à la main.
const VERSION = '${version}';
const CACHE = 'ep6-' + VERSION;
const ASSETS = ${JSON.stringify(['/', ...assets], null, 1)};

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
`;
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('sw.js :', assets.length, 'fichiers, version', version);
