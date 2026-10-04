// Serveur Node de Weldon (développement local, Render) : sert l'application web
// et transmet les appels /api/* à la logique commune (app.js).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, store, PUBLIC_URL } from "./app.js";

export { signToken, verifyToken } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const WEB_DIR = path.join(__dirname, "..", "web");
const MAX_BODY = 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("Requête trop volumineuse."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveStatic(res, pathname) {
  const rel = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const file = path.normalize(path.join(WEB_DIR, rel));
  if (!file.startsWith(WEB_DIR)) return sendJson(res, 403, { error: "Interdit" });
  fs.readFile(file, (err, data) => {
    if (err) {
      // Application monopage : toute route inconnue renvoie index.html
      return fs.readFile(path.join(WEB_DIR, "index.html"), (e2, html) => {
        if (e2) return sendJson(res, 404, { error: "Introuvable" });
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(html);
      });
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Cache-Control": rel === "sw.js" ? "no-cache" : "public, max-age=300",
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, PUBLIC_URL);
  if (!url.pathname.startsWith("/api/")) {
    if (req.method === "GET") return serveStatic(res, url.pathname);
    return sendJson(res, 404, { error: "Route inconnue" });
  }
  let raw;
  try {
    raw = await readBody(req);
  } catch (e) {
    return sendJson(res, e.status || 400, { error: e.message });
  }
  const r = await handle({ method: req.method, url, headers: req.headers, ip: req.socket.remoteAddress, raw });
  sendJson(res, r.status, r.body);
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`Weldon en ligne sur ${PUBLIC_URL} (port ${PORT}, stockage ${store.kind})`));
}

export { server, store };
