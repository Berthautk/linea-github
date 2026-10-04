// Serveur Weldon : sert l'application web, gère le paiement Chariow,
// délivre les jetons d'accès (1 an) et corrige les copies avec l'IA.
// Aucune dépendance HTTP externe : node:http suffit pour un prototype.

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { createStore } from "./store.js";
import { correctCopy, aiEnabled } from "./correction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : `http://localhost:${PORT}`)
).replace(/\/$/, "");
const CHARIOW_API = "https://api.chariow.com/v1";
const CHARIOW_API_KEY = process.env.CHARIOW_API_KEY || "";
const CHARIOW_PRODUCT_ID = process.env.CHARIOW_PRODUCT_ID || "";
const CHARIOW_PULSE_SECRET = process.env.CHARIOW_PULSE_SECRET || "";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
const ACCESS_DAYS = Number(process.env.ACCESS_DAYS || 365);
const MAX_DEVICES = Number(process.env.MAX_DEVICES || 3);
const PRICE_XAF = Number(process.env.PRICE_XAF || 10000);
const WEB_DIR = path.join(__dirname, "..", "web");
const DAY_MS = 24 * 60 * 60 * 1000;

if (!TOKEN_SECRET || TOKEN_SECRET.length < 32) {
  console.error("TOKEN_SECRET manquant ou trop court (32 caractères minimum). Voir .env.example.");
  process.exit(1);
}

const store = createStore(process.env.DATA_DIR || path.join(__dirname, "data"));

// ---------- Jetons d'accès signés (HMAC) ----------

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

export function signToken(payload, secret = TOKEN_SECRET) {
  const body = b64url(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyToken(token, secret = TOKEN_SECRET) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? verifyToken(h.slice(7)) : null;
}

// ---------- Chariow ----------

async function chariow(method, route, body) {
  if (!CHARIOW_API_KEY) throw httpError(503, "Paiement non configuré (CHARIOW_API_KEY).");
  const res = await fetch(`${CHARIOW_API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${CHARIOW_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  }).catch((e) => {
    throw httpError(504, e.name === "TimeoutError" ? "Chariow ne répond pas. Réessayez dans un instant." : "Impossible de joindre Chariow.");
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.message || `Erreur Chariow (${res.status})`;
    throw httpError(res.status === 422 ? 422 : 502, msg, json.errors);
  }
  return json.data;
}

function saleIsPaid(sale) {
  return sale && ["completed", "settled"].includes(sale.status);
}

function saleMatchesProduct(sale) {
  if (!CHARIOW_PRODUCT_ID) return true;
  const p = sale.product || {};
  return [p.id, p.slug].includes(CHARIOW_PRODUCT_ID);
}

// Délivre un jeton valable ACCESS_DAYS jours après la date de paiement,
// en limitant le nombre d'appareils par achat.
function grantAccess(sale, deviceId) {
  const paidAt = Date.parse(sale.completed_at || sale.created_at);
  const exp = paidAt + ACCESS_DAYS * DAY_MS;
  if (exp < Date.now()) throw httpError(402, "Votre accès d'un an a expiré. Renouvelez votre abonnement.");
  const devices = store.addDevice(sale.id, deviceId, MAX_DEVICES);
  if (!devices) {
    throw httpError(403, `Cet achat est déjà utilisé sur ${MAX_DEVICES} appareils. Contactez le support Weldon.`);
  }
  const email = sale.customer?.email || "";
  return {
    token: signToken({ sid: sale.id, email, dev: deviceId, exp }),
    expires_at: new Date(exp).toISOString(),
    email,
  };
}

// ---------- Utilitaires HTTP ----------

function httpError(status, message, details) {
  const e = new Error(message);
  e.status = status;
  e.details = details;
  return e;
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function readRaw(req, limit = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(httpError(413, "Requête trop volumineuse."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req, limit) {
  const raw = await readRaw(req, limit);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    throw httpError(400, "JSON invalide.");
  }
}

function str(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function serveStatic(req, res, pathname) {
  const rel = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const file = path.normalize(path.join(WEB_DIR, rel));
  if (!file.startsWith(WEB_DIR)) return send(res, 403, { error: "Interdit" });
  fs.readFile(file, (err, data) => {
    if (err) {
      // Application monopage : toute route inconnue renvoie index.html
      return fs.readFile(path.join(WEB_DIR, "index.html"), (e2, html) => {
        if (e2) return send(res, 404, { error: "Introuvable" });
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

// ---------- Routes API ----------

const routes = {
  "GET /api/config": async () => ({
    mode: "live",
    price_xaf: PRICE_XAF,
    access_days: ACCESS_DAYS,
    payment_enabled: Boolean(CHARIOW_API_KEY && CHARIOW_PRODUCT_ID),
    ai_enabled: aiEnabled(),
  }),

  // Démarre un paiement Chariow et renvoie l'URL de la page de paiement.
  "POST /api/checkout": async (req) => {
    const b = await readJson(req, 10_000);
    const first_name = str(b.first_name, 50);
    const last_name = str(b.last_name, 50);
    const email = str(b.email, 255).toLowerCase();
    const phone = str(b.phone, 20).replace(/\D/g, "");
    if (!first_name || !last_name || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 8) {
      throw httpError(400, "Renseignez nom, prénom, e-mail valide et numéro de téléphone.");
    }
    const data = await chariow("POST", "/checkout", {
      product_id: CHARIOW_PRODUCT_ID,
      email,
      first_name,
      last_name,
      phone: { number: phone, country_code: str(b.country_code, 2).toUpperCase() || "CM" },
      redirect_url: `${PUBLIC_URL}/?sale={sale_id}`,
      custom_metadata: { app: "weldon" },
      customer_ip: req.socket.remoteAddress,
    });
    if (data.step === "payment") return { step: "payment", checkout_url: data.payment.checkout_url, sale_id: data.purchase.id };
    if (data.step === "already_purchased") return { step: "already_purchased" };
    return { step: data.step, sale_id: data.purchase?.id };
  },

  // Après le retour de Chariow : on vérifie la vente côté serveur avant d'ouvrir l'accès.
  "POST /api/verify-sale": async (req) => {
    const b = await readJson(req, 5_000);
    const saleId = str(b.sale_id, 64);
    const deviceId = str(b.device_id, 64);
    if (!/^sal_[A-Za-z0-9]+$/.test(saleId) || !deviceId) throw httpError(400, "Référence de vente invalide.");
    const sale = await chariow("GET", `/sales/${encodeURIComponent(saleId)}`);
    if (!saleMatchesProduct(sale)) throw httpError(403, "Cette vente ne concerne pas Weldon.");
    if (!saleIsPaid(sale)) return { paid: false, status: sale.status };
    return { paid: true, ...grantAccess(sale, deviceId) };
  },

  // « J'ai déjà payé » : retrouve l'achat le plus récent par e-mail.
  "POST /api/restore": async (req) => {
    const b = await readJson(req, 5_000);
    const email = str(b.email, 255).toLowerCase();
    const deviceId = str(b.device_id, 64);
    if (!/^\S+@\S+\.\S+$/.test(email) || !deviceId) throw httpError(400, "E-mail invalide.");
    const since = new Date(Date.now() - ACCESS_DAYS * DAY_MS).toISOString().slice(0, 10);
    const sales = await chariow(
      "GET",
      `/sales?status=completed&per_page=100&start_date=${since}&search=${encodeURIComponent(email)}`
    );
    const list = (Array.isArray(sales) ? sales : sales?.data || [])
      .filter((s) => (s.customer?.email || "").toLowerCase() === email && saleMatchesProduct(s))
      .sort((x, y) => Date.parse(y.completed_at) - Date.parse(x.completed_at));
    if (!list.length) throw httpError(404, "Aucun abonnement actif trouvé pour cet e-mail.");
    return { paid: true, ...grantAccess(list[0], deviceId) };
  },

  "GET /api/me": async (req) => {
    const t = bearer(req);
    if (!t) throw httpError(401, "Accès non valide ou expiré.");
    return { email: t.email, expires_at: new Date(t.exp).toISOString() };
  },

  // Pulse (webhook) Chariow : signature vérifiée sur le corps brut, dédoublonnage.
  "POST /api/webhooks/chariow": async (req) => {
    const raw = await readRaw(req, 1024 * 1024);
    if (!CHARIOW_PULSE_SECRET) throw httpError(503, "Pulse non configuré.");
    const received = String(req.headers["x-chariow-signature"] || "");
    const expected = "sha256=" + crypto.createHmac("sha256", CHARIOW_PULSE_SECRET).update(raw).digest("hex");
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw httpError(401, "Signature invalide.");
    const deliveryId = String(req.headers["x-pulse-delivery-id"] || "");
    if (deliveryId && store.seenDelivery(deliveryId)) return { ok: true, duplicate: true };
    const payload = JSON.parse(raw.toString("utf8"));
    store.logEvent({ delivery_id: deliveryId, event: payload.event, sale: payload.sale?.id, email: payload.customer?.email, at: new Date().toISOString() });
    return { ok: true };
  },

  // Correction d'une copie photographiée (réservé aux abonnés).
  "POST /api/correct": async (req) => {
    const t = bearer(req);
    if (!t) throw httpError(401, "La correction par IA est réservée aux abonnés.");
    if (!aiEnabled()) throw httpError(503, "Correction IA non configurée (ANTHROPIC_API_KEY).");
    if (!store.takeCorrectionQuota(t.sid, Number(process.env.AI_MONTHLY_LIMIT || 15))) {
      throw httpError(429, "Vous avez utilisé toutes vos corrections du mois. Elles se renouvellent le 1er du mois prochain.");
    }
    const b = await readJson(req, 15 * 1024 * 1024);
    const images = (Array.isArray(b.images) ? b.images : []).slice(0, 6).filter(
      (im) => ["image/jpeg", "image/png", "image/webp"].includes(im?.media_type) && typeof im.data === "string"
    );
    if (!images.length) throw httpError(400, "Ajoutez au moins une photo de votre copie.");
    return correctCopy({
      concours: str(b.concours, 200),
      epreuve: str(b.epreuve, 200),
      sujet: str(b.sujet, 20_000),
      corrige: str(b.corrige, 30_000),
      bareme: str(b.bareme, 5_000),
      duree_minutes: Number(b.duree_minutes) || null,
      temps_utilise_minutes: Number(b.temps_utilise_minutes) || null,
      images,
    });
  },
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, PUBLIC_URL);
  const handler = routes[`${req.method} ${url.pathname}`];
  if (!handler) {
    if (req.method === "GET" && !url.pathname.startsWith("/api/")) return serveStatic(req, res, url.pathname);
    return send(res, 404, { error: "Route inconnue" });
  }
  try {
    send(res, 200, await handler(req));
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    send(res, status, { error: status >= 500 && !err.status ? "Erreur interne." : err.message, details: err.details });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`Weldon en ligne sur ${PUBLIC_URL} (port ${PORT})`));
}

export { server };
