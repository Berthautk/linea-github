// Serveur de développement/test : sert site/ et l'API (mêmes fonctions que Netlify) avec un stockage fichier ou mémoire.
// Usage : node tools/dev-server.mjs [port]   (EP_MEMORY=1 pour ne rien écrire sur le disque)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setStoreFactory, memoryFactory, fileFactory } from '../netlify/functions/lib/store.mjs';
import { handle } from '../netlify/functions/lib/handler.mjs';

// Mêmes en-têtes de sécurité qu'en production (lus dans netlify.toml) : les tests de navigateur détectent ainsi tout blocage de la politique de sécurité.
const toml = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../netlify.toml'), 'utf8');
const SEC = {}; for (const m of toml.matchAll(/^\s{4}([A-Za-z-]+) = "(.*)"$/gm)) if (/^(Content-Security-Policy|X-Frame-Options|Permissions-Policy|Cross-Origin-Opener-Policy|Cross-Origin-Resource-Policy|Referrer-Policy|X-Content-Type-Options)$/.test(m[1])) SEC[m[1].toLowerCase()] = m[2];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

export function start(port = 8888, { memory = !!process.env.EP_MEMORY } = {}) {
  setStoreFactory(memory ? memoryFactory() : fileFactory(path.resolve(root, '../.data')));
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
      if (url.pathname.startsWith('/api/')) {
        const chunks = []; for await (const c of req) chunks.push(c);
        const r = await handle(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) }));
        res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
      }
      let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
      let file = path.join(root, p === '/' ? 'index.html' : p);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache', ...SEC });
      fs.createReadStream(file).pipe(res);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) start(+process.argv[2] || 8888).then(() => console.log('Rekort : http://localhost:' + (+process.argv[2] || 8888)));
