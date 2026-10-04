// Serveur Weldon : comptes élèves, contenu protégé, paiement Chariow (accès 1 an)
// et correction des copies par l'IA. Pas de framework : node:http suffit.

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { createStore } from "./store.js";
import { loadContent, LANGS } from "./content.js";
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
const PRICE_XAF = Number(process.env.PRICE_XAF || 10000);
const SESSION_DAYS = 30;
// Concepteur de Weldon : accès complet sans payer. ADMIN_EMAILS (Render) peut en ajouter d'autres.
const ADMIN_EMAILS = new Set(
  ["berthautk@gmail.com", ...(process.env.ADMIN_EMAILS || "").split(",")]
    .join(",")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);
const WEB_DIR = path.join(__dirname, "..", "web");
const DAY_MS = 24 * 60 * 60 * 1000;

if (!TOKEN_SECRET || TOKEN_SECRET.length < 32) {
  console.error("TOKEN_SECRET manquant ou trop court (32 caractères minimum). Voir .env.example.");
  process.exit(1);
}

const content = loadContent(path.join(__dirname, "..", "content"));
const store = await createStore({ databaseUrl: process.env.DATABASE_URL, dir: process.env.DATA_DIR || path.join(__dirname, "data") });
if (store.kind === "file" && process.env.RENDER) {
  console.warn("ATTENTION : pas de DATABASE_URL. Les comptes seront effacés à chaque redémarrage du serveur.");
}

// ---------- Jetons de session signés (HMAC) ----------

export function signToken(payload, secret = TOKEN_SECRET) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
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

// ---------- Mots de passe ----------

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function checkPassword(pw, stored) {
  const [, salt, hash] = String(stored).split("$");
  if (!salt || !hash) return false;
  const a = crypto.scryptSync(pw, salt, 64);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Limite les essais de connexion : 10 par quart d'heure et par adresse IP + e-mail.
const attempts = new Map();
function tooManyAttempts(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 15 * 60 * 1000);
  list.push(now);
  attempts.set(key, list);
  return list.length > 10;
}

// ---------- Comptes ----------

const isAdmin = (u) => u.role === "admin" || ADMIN_EMAILS.has(u.email);
const isPremium = (u) => isAdmin(u) || (u.premium_until && Date.parse(u.premium_until) > Date.now());

function profile(u) {
  return {
    email: u.email,
    name: u.name,
    lang: u.lang || null,
    admin: isAdmin(u),
    premium: Boolean(isPremium(u)),
    premium_until: isAdmin(u) ? null : u.premium_until || null,
    free_id: u.free_id || null,
  };
}

function session(u) {
  return { token: signToken({ sub: u.email, v: u.token_v || 0, exp: Date.now() + SESSION_DAYS * DAY_MS }), user: profile(u) };
}

async function currentUser(req, { required = true } = {}) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? verifyToken(h.slice(7)) : null;
  const u = t ? await store.getUser(t.sub) : null;
  if (!u || (u.token_v || 0) !== t.v) {
    if (required) throw httpError(401, "Votre session a expiré. Reconnectez-vous.");
    return null;
  }
  return u;
}

async function currentPremium(req) {
  const u = await currentUser(req);
  if (!isPremium(u)) throw httpError(402, "Réservé aux abonnés.", { code: "locked" });
  return u;
}

// ---------- Chariow ----------

async function chariow(method, route, body) {
  if (!CHARIOW_API_KEY) throw httpError(503, "Paiement non configuré (CHARIOW_API_KEY).");
  const res = await fetch(`${CHARIOW_API}${route}`, {
    method,
    headers: { Authorization: `Bearer ${CHARIOW_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  }).catch((e) => {
    throw httpError(504, e.name === "TimeoutError" ? "Chariow ne répond pas. Réessayez dans un instant." : "Impossible de joindre Chariow.");
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status === 422 ? 422 : 502, json.message || `Erreur Chariow (${res.status})`, json.errors);
  return json.data;
}

const saleIsPaid = (sale) => sale && ["completed", "settled"].includes(sale.status);
const saleMatchesProduct = (sale) => !CHARIOW_PRODUCT_ID || [sale.product?.id, sale.product?.slug].includes(CHARIOW_PRODUCT_ID);
const saleEnd = (sale) => new Date(Date.parse(sale.completed_at || sale.created_at) + ACCESS_DAYS * DAY_MS).toISOString();

// Rattache une vente payée au compte : l'accès court ACCESS_DAYS jours après le paiement.
async function applySale(user, sale) {
  const end = saleEnd(sale);
  user.sales = [...new Set([...(user.sales || []), sale.id])];
  if (!user.premium_until || end > user.premium_until) user.premium_until = end;
  await store.saveUser(user);
}

// Cherche chez Chariow les achats payés avec l'e-mail du compte.
async function syncSubscription(user) {
  if (!CHARIOW_API_KEY) return user;
  const since = new Date(Date.now() - ACCESS_DAYS * DAY_MS).toISOString().slice(0, 10);
  const data = await chariow("GET", `/sales?status=completed&per_page=100&start_date=${since}&search=${encodeURIComponent(user.email)}`);
  const list = (Array.isArray(data) ? data : data?.data || []).filter(
    (s) => (s.customer?.email || "").toLowerCase() === user.email && saleMatchesProduct(s) && saleIsPaid(s)
  );
  user.last_sync = new Date().toISOString();
  for (const s of list) await applySale(user, s);
  await store.saveUser(user);
  return user;
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

function readRaw(req, limit) {
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

async function readJson(req, limit = 20_000) {
  const raw = await readRaw(req, limit);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    throw httpError(400, "JSON invalide.");
  }
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function serveStatic(req, res, pathname) {
  const rel = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const file = path.normalize(path.join(WEB_DIR, rel));
  if (!file.startsWith(WEB_DIR)) return send(res, 403, { error: "Interdit" });
  fs.readFile(file, (err, data) => {
    if (err) {
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

const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$");
  routes.push({ method, re, keys, handler });
};

route("GET", "/api/config", async () => ({
  mode: "live",
  price_xaf: PRICE_XAF,
  access_days: ACCESS_DAYS,
  payment_enabled: Boolean(CHARIOW_API_KEY && CHARIOW_PRODUCT_ID),
  ai_enabled: aiEnabled(),
  accounts_persistent: store.kind === "postgres",
}));

route("POST", "/api/register", async (req) => {
  const b = await readJson(req);
  const email = str(b.email, 255).toLowerCase();
  const name = str(b.name, 80);
  const password = typeof b.password === "string" ? b.password : "";
  if (!name) throw httpError(400, "Indiquez votre nom.");
  if (!validEmail(email)) throw httpError(400, "Adresse e-mail invalide.");
  if (password.length < 8) throw httpError(400, "Le mot de passe doit contenir au moins 8 caractères.");
  const user = {
    email,
    name,
    pw: hashPassword(password),
    role: "user",
    lang: LANGS.includes(b.lang) ? b.lang : null,
    created_at: new Date().toISOString(),
    token_v: 0,
  };
  if (!(await store.createUser(user))) throw httpError(409, "Un compte existe déjà avec cet e-mail. Connectez-vous.");
  await syncSubscription(user).catch(() => {});
  return session(user);
});

route("POST", "/api/login", async (req) => {
  const b = await readJson(req);
  const email = str(b.email, 255).toLowerCase();
  const password = typeof b.password === "string" ? b.password : "";
  if (tooManyAttempts(`${req.socket.remoteAddress}|${email}`)) {
    throw httpError(429, "Trop d'essais. Patientez 15 minutes avant de réessayer.");
  }
  const user = await store.getUser(email);
  if (!user || !checkPassword(password, user.pw)) throw httpError(401, "E-mail ou mot de passe incorrect.");
  return session(user);
});

route("GET", "/api/me", async (req) => {
  let u = await currentUser(req);
  const stale = !u.last_sync || Date.now() - Date.parse(u.last_sync) > 10 * 60 * 1000;
  if (!isPremium(u) && stale) u = await syncSubscription(u).catch(() => u);
  return profile(u);
});

route("POST", "/api/me", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  if (LANGS.includes(b.lang)) u.lang = b.lang;
  if (str(b.name, 80)) u.name = str(b.name, 80);
  await store.saveUser(u);
  return profile(u);
});

route("POST", "/api/password", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  if (!checkPassword(String(b.current || ""), u.pw)) throw httpError(401, "Mot de passe actuel incorrect.");
  if (String(b.password || "").length < 8) throw httpError(400, "Le nouveau mot de passe doit contenir au moins 8 caractères.");
  u.pw = hashPassword(b.password);
  u.token_v = (u.token_v || 0) + 1; // déconnecte les autres appareils
  await store.saveUser(u);
  return session(u);
});

// Catalogue public : fiches, liste des épreuves classées, déroulement de l'oral.
route("GET", "/api/catalog", async (req, _p, url) => {
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "fr";
  return content.catalog(lang);
});

// Sujet d'une épreuve : abonnés, ou l'unique épreuve offerte du compte.
route("GET", "/api/epreuves/:id/sujet", async (req, p) => {
  const u = await currentUser(req);
  const e = content.epreuve(p.id);
  if (!e) throw httpError(404, "Épreuve introuvable.");
  if (!isPremium(u)) {
    if (!u.free_id) {
      u.free_id = e.id;
      await store.saveUser(u);
    } else if (u.free_id !== e.id) {
      throw httpError(402, "Vous avez déjà utilisé votre épreuve offerte. Abonnez-vous pour accéder à toutes les épreuves.", { code: "locked" });
    }
  }
  const { corrige, bareme, ...sujet } = e;
  return { ...sujet, free_id: u.free_id || null };
});

route("GET", "/api/epreuves/:id/corrige", async (req, p) => {
  await currentPremium(req);
  const e = content.epreuve(p.id);
  if (!e) throw httpError(404, "Épreuve introuvable.");
  return e;
});

route("GET", "/api/oral/:cid", async (req, p, url) => {
  await currentPremium(req);
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "fr";
  const o = content.oralFull(p.cid, lang);
  if (!o) throw httpError(404, "Pas d'oral pour ce concours.");
  return o;
});

// Paiement : la page Chariow est ouverte au nom et à l'e-mail du compte.
route("POST", "/api/checkout", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  const phone = str(b.phone, 20).replace(/\D/g, "").replace(/^237(?=\d{9}$)/, "");
  if (phone.length < 8) throw httpError(400, "Indiquez votre numéro Mobile Money.");
  const [first, ...rest] = u.name.split(/\s+/);
  const data = await chariow("POST", "/checkout", {
    product_id: CHARIOW_PRODUCT_ID,
    email: u.email,
    first_name: str(b.first_name, 50) || first.slice(0, 50),
    last_name: str(b.last_name, 50) || rest.join(" ").slice(0, 50) || first.slice(0, 50),
    phone: { number: phone, country_code: str(b.country_code, 2).toUpperCase() || "CM" },
    redirect_url: `${PUBLIC_URL}/?sale={sale_id}`,
    custom_metadata: { app: "weldon", account: u.email },
    customer_ip: req.socket.remoteAddress,
  });
  if (data.step === "payment") return { step: "payment", checkout_url: data.payment.checkout_url, sale_id: data.purchase.id };
  if (data.step === "already_purchased") {
    await syncSubscription(u);
    return { step: "already_purchased", user: profile(u) };
  }
  return { step: data.step };
});

// Retour de Chariow : la vente est vérifiée côté serveur avant d'ouvrir l'accès.
route("POST", "/api/verify-sale", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  const saleId = str(b.sale_id, 64);
  if (!/^sal_[A-Za-z0-9]+$/.test(saleId)) throw httpError(400, "Référence de vente invalide.");
  const sale = await chariow("GET", `/sales/${encodeURIComponent(saleId)}`);
  if (!saleMatchesProduct(sale)) throw httpError(403, "Cette vente ne concerne pas Weldon.");
  if ((sale.customer?.email || "").toLowerCase() !== u.email) throw httpError(403, "Cette vente a été faite avec un autre e-mail que celui de votre compte.");
  if (!saleIsPaid(sale)) return { paid: false, status: sale.status };
  if (Date.parse(saleEnd(sale)) < Date.now()) throw httpError(402, "Cet abonnement a expiré. Renouvelez-le pour continuer.");
  await applySale(u, sale);
  return { paid: true, user: profile(u) };
});

route("POST", "/api/sync-subscription", async (req) => {
  const u = await syncSubscription(await currentUser(req));
  return profile(u);
});

// Pulse Chariow : signature vérifiée sur le corps brut, dédoublonnage, mise à jour du compte.
route("POST", "/api/webhooks/chariow", async (req) => {
  const raw = await readRaw(req, 1024 * 1024);
  if (!CHARIOW_PULSE_SECRET) throw httpError(503, "Pulse non configuré.");
  const received = String(req.headers["x-chariow-signature"] || "");
  const expected = "sha256=" + crypto.createHmac("sha256", CHARIOW_PULSE_SECRET).update(raw).digest("hex");
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw httpError(401, "Signature invalide.");
  const deliveryId = String(req.headers["x-pulse-delivery-id"] || "");
  if (deliveryId && (await store.seenDelivery(deliveryId))) return { ok: true, duplicate: true };
  const payload = JSON.parse(raw.toString("utf8"));
  const email = (payload.customer?.email || "").toLowerCase();
  await store.logEvent({ delivery_id: deliveryId, event: payload.event, sale: payload.sale?.id, email, at: new Date().toISOString() });
  if (payload.event === "successful.sale" && email) {
    const u = await store.getUser(email);
    if (u) await syncSubscription(u).catch((e) => console.error("Pulse : synchronisation impossible", e.message));
  }
  return { ok: true };
});

// Correction d'une copie photographiée (abonnés).
route("POST", "/api/correct", async (req) => {
  const u = await currentPremium(req);
  if (!aiEnabled()) throw httpError(503, "La correction par IA n'est pas encore activée.");
  const b = await readJson(req, 15 * 1024 * 1024);
  const e = content.epreuve(str(b.epreuve_id, 80));
  if (!e) throw httpError(404, "Épreuve introuvable.");
  const images = (Array.isArray(b.images) ? b.images : [])
    .slice(0, 6)
    .filter((im) => ["image/jpeg", "image/png", "image/webp"].includes(im?.media_type) && typeof im.data === "string");
  if (!images.length) throw httpError(400, "Ajoutez au moins une photo de votre copie.");
  if (!isAdmin(u) && !(await store.takeCorrectionQuota(u.email, Number(process.env.AI_MONTHLY_LIMIT || 15)))) {
    throw httpError(429, "Vous avez utilisé toutes vos corrections du mois. Elles se renouvellent le 1er du mois prochain.");
  }
  const c = content.concours(e.concours);
  return correctCopy({
    lang: e.lang,
    concours: c[e.lang]?.nom || c.id,
    epreuve: `${e.matiere} (${e.annee})`,
    sujet: e.sujet,
    corrige: e.corrige,
    bareme: e.bareme || "",
    duree_minutes: e.duree,
    temps_utilise_minutes: Number(b.temps_utilise_minutes) || null,
    images,
  });
});

// Espace concepteur : liste des comptes et accès offert (testeurs, partenaires).
route("GET", "/api/admin/users", async (req) => {
  const u = await currentUser(req);
  if (!isAdmin(u)) throw httpError(403, "Réservé au concepteur.");
  return (await store.listUsers()).map(profile).map((p, i) => ({ ...p, created_at: undefined, n: i + 1 }));
});

route("POST", "/api/admin/grant", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const b = await readJson(req);
  const target = await store.getUser(str(b.email, 255).toLowerCase());
  if (!target) throw httpError(404, "Aucun compte avec cet e-mail. La personne doit d'abord créer son compte.");
  const days = Math.min(Math.max(Number(b.days) || 0, 0), 3650);
  target.premium_until = days ? new Date(Date.now() + days * DAY_MS).toISOString() : null;
  target.granted_by = admin.email;
  await store.saveUser(target);
  return profile(target);
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, PUBLIC_URL);
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = url.pathname.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    try {
      return send(res, 200, await r.handler(req, params, url));
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      return send(res, status, { error: status >= 500 && !err.status ? "Erreur interne." : err.message, ...(err.details?.code ? { code: err.details.code } : {}) });
    }
  }
  if (req.method === "GET" && !url.pathname.startsWith("/api/")) return serveStatic(req, res, url.pathname);
  send(res, 404, { error: "Route inconnue" });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`Weldon en ligne sur ${PUBLIC_URL} (port ${PORT}, stockage ${store.kind})`));
}

export { server, store };
