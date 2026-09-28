// Mode hors ligne : l'application reste utilisable sans connexion.
const CACHE = 'vraiscan-v6';
const CORE = [
  './', 'index.html', 'app.css', 'app.js', 'imgproc.js', 'pdf.js', 'docx.js', 'ocr.js', 'store.js',
  'i18n.js', 'catalog.js', 'pdfin.js', 'reader.js', 'textedit.js',
  'privacy.html', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png',
];
// Moteur de lecture du texte (~9 Mo) et lecteur de PDF (~3 Mo) : mis en cache
// au premier usage, pas à l'installation.

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Gros fichiers du moteur OCR : cache d'abord (ils ne changent pas).
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    })));
    return;
  }
  // Le reste : réseau d'abord (mises à jour), cache si hors ligne.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(hit => hit || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
