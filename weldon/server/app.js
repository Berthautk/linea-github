// Logique de Weldon, indépendante de l'hébergement : comptes élèves, contenu protégé,
// paiement Chariow (accès 1 an), espace concepteur. Appelée par server.js (Node, Render, local)
// et par la fonction Netlify (server/netlify-functions/api.mjs).

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { createStore } from "./store.js";
import { loadContent, checkAccesValues, checkPeriodicite, LANGS } from "./content.js";
import { moisOf, enPause } from "./calendar.js";
import { orient, cleanProfil, targetYear } from "./orientation.js";
import { buildPlan, subjectThemes, HOURS } from "./plan.js";
import { statut as statutBourse, trier as trierBourses, checkBourse, BRANCHES, DOMAINES, NIVEAUX_BOURSE } from "./bourses.js";
import { dayStr, pickDaily, pickSeries, pickBlanc, emptyQuiz, recordAnswer, dueIds, streak } from "./quiz.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(HERE, ".env"));

// Les fichiers voisins ne sont pas au même endroit selon l'hébergeur (fonction Netlify empaquetée).
function locate(...rel) {
  const bases = [path.join(HERE, ".."), process.cwd(), path.join(process.cwd(), "weldon"), "/var/task", "/var/task/weldon"];
  for (const b of bases) {
    const p = path.join(b, ...rel);
    if (fs.existsSync(p)) return p;
  }
  return path.join(HERE, "..", ...rel);
}

const ON_NETLIFY = Boolean(process.env.NETLIFY || process.env.NETLIFY_DEV || process.env.AWS_LAMBDA_FUNCTION_NAME);
const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  process.env.URL ||
  (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : `http://localhost:${process.env.PORT || 8080}`)
).replace(/\/$/, "");
const VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(locate("server", "version.json"), "utf8")).commit.slice(0, 7);
  } catch {
    return (process.env.RENDER_GIT_COMMIT || process.env.COMMIT_REF || "local").slice(0, 7);
  }
})();
// Une fonction Netlify doit répondre en moins de 10 secondes.
const CHARIOW_TIMEOUT_MS = ON_NETLIFY ? 8_000 : 20_000;
const CHARIOW_API = "https://api.chariow.com/v1";
const CHARIOW_API_KEY = process.env.CHARIOW_API_KEY || "";
const CHARIOW_PRODUCT_ID = process.env.CHARIOW_PRODUCT_ID || "";
const CHARIOW_PULSE_SECRET = process.env.CHARIOW_PULSE_SECRET || "";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
const ACCESS_DAYS = Number(process.env.ACCESS_DAYS || 365);
const PRICE_XAF = Number(process.env.PRICE_XAF || 100000);
// Formule mensuelle : active seulement quand son produit Chariow est configuré.
const CHARIOW_PRODUCT_ID_MONTHLY = process.env.CHARIOW_PRODUCT_ID_MONTHLY || "";
const ACCESS_DAYS_MONTHLY = Number(process.env.ACCESS_DAYS_MONTHLY || 30);
const PRICE_XAF_MONTHLY = Number(process.env.PRICE_XAF_MONTHLY || 15000);
// « Pass Bourses » : accès complet à toutes les fiches de bourses (liens, dossiers, conseils). Produit Chariow distinct des concours.
const CHARIOW_PRODUCT_ID_BOURSES = process.env.CHARIOW_PRODUCT_ID_BOURSES || "";
const ACCESS_DAYS_BOURSES = Number(process.env.ACCESS_DAYS_BOURSES || 365);
const PRICE_XAF_BOURSES = Number(process.env.PRICE_XAF_BOURSES || 250000);
// Contact : chaîne d'alertes et numéro WhatsApp du concepteur (facultatifs)
const WHATSAPP_CHANNEL_URL = /^https:\/\//.test(process.env.WHATSAPP_CHANNEL_URL || "") ? process.env.WHATSAPP_CHANNEL_URL : "";
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
const SESSION_DAYS = 30;
const FREE_FOLLOWS = 2; // concours suivis sans abonnement
const FREE_FOLLOWS_BOURSES = 3; // bourses suivies sans abonnement
// Section Bourses : visible par le concepteur seul tant que BOURSES_PUBLIC n'est pas activé.
// Lu à chaque requête : on peut ouvrir la section sans redéployer le code (variable Netlify) et les tests peuvent la basculer.
const boursesPublic = () => ["1", "true", "oui"].includes(String(process.env.BOURSES_PUBLIC || "").toLowerCase());
const VEILLE_TOKEN = process.env.VEILLE_TOKEN || "";
// Concepteur de Weldon : accès complet sans payer. ADMIN_EMAILS (Render) peut en ajouter d'autres.
const ADMIN_EMAILS = new Set(
  ["berthautk@gmail.com", ...(process.env.ADMIN_EMAILS || "").split(",")]
    .join(",")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);
const DAY_MS = 24 * 60 * 60 * 1000;

const content = loadContent(process.env.WELDON_CONTENT_DIR || locate("content"));
const DATABASE_URL = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || "";
const store = await createStore({
  databaseUrl: DATABASE_URL,
  dir: process.env.DATA_DIR || (ON_NETLIFY ? "/tmp/weldon" : path.join(HERE, "data")),
});
if (store.kind === "file" && (process.env.RENDER || ON_NETLIFY)) {
  console.warn("ATTENTION : pas de base de données. Les comptes seront effacés au redémarrage.");
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
const hasBoursesPass = (u) => isAdmin(u) || Boolean(u.bourses_until && Date.parse(u.bourses_until) > Date.now());

function profile(u) {
  return {
    email: u.email,
    name: u.name,
    lang: u.lang || null,
    admin: isAdmin(u),
    premium: Boolean(isPremium(u)),
    premium_until: isAdmin(u) ? null : u.premium_until || null,
    bourses_access: Boolean(hasBoursesPass(u)),
    bourses_until: isAdmin(u) ? null : u.bourses_until || null,
    free_id: u.free_id || null,
    profil: u.profil || null,
    suivis: u.suivis || [],
    bourses_suivies: u.bourses_suivies || [],
    bourse_profil: u.bourse_profil || null,
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
    signal: AbortSignal.timeout(CHARIOW_TIMEOUT_MS),
  }).catch((e) => {
    throw httpError(504, e.name === "TimeoutError" ? "Chariow ne répond pas. Réessayez dans un instant." : "Impossible de joindre Chariow.");
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status === 422 ? 422 : 502, json.message || `Erreur Chariow (${res.status})`, json.errors);
  return json.data;
}

const saleIsPaid = (sale) => sale && ["completed", "settled"].includes(sale.status);
// Formules d'abonnement : annuelle (toujours) et mensuelle (si son produit Chariow est renseigné).
const PLANS = [
  { id: "annual", product: CHARIOW_PRODUCT_ID, price_xaf: PRICE_XAF, days: ACCESS_DAYS },
  ...(CHARIOW_PRODUCT_ID_MONTHLY ? [{ id: "monthly", product: CHARIOW_PRODUCT_ID_MONTHLY, price_xaf: PRICE_XAF_MONTHLY, days: ACCESS_DAYS_MONTHLY }] : []),
  ...(CHARIOW_PRODUCT_ID_BOURSES ? [{ id: "bourses", product: CHARIOW_PRODUCT_ID_BOURSES, price_xaf: PRICE_XAF_BOURSES, days: ACCESS_DAYS_BOURSES, grants: "bourses" }] : []),
];
const CONCOURS_PLANS = PLANS.filter((p) => p.grants !== "bourses");
const salePlan = (sale) => PLANS.find((p) => p.product && [sale.product?.id, sale.product?.slug].includes(p.product)) || null;
const saleMatchesProduct = (sale) => !CHARIOW_PRODUCT_ID || Boolean(salePlan(sale));
const saleEnd = (sale) => new Date(Date.parse(sale.completed_at || sale.created_at) + (salePlan(sale)?.days ?? ACCESS_DAYS) * DAY_MS).toISOString();

// Rattache une vente payée au compte : l'accès court ACCESS_DAYS jours après le paiement.
async function applySale(user, sale) {
  const end = saleEnd(sale);
  user.sales = [...new Set([...(user.sales || []), sale.id])];
  // Le Pass Bourses n'ouvre que les bourses ; l'abonnement concours n'ouvre que les concours.
  const field = salePlan(sale)?.grants === "bourses" ? "bourses_until" : "premium_until";
  if (!user[field] || end > user[field]) user[field] = end;
  await store.saveUser(user);
}

// Cherche chez Chariow les achats payés avec l'e-mail du compte.
async function syncSubscription(user) {
  if (!CHARIOW_API_KEY) return user;
  const since = new Date(Date.now() - Math.max(...PLANS.map((p) => p.days)) * DAY_MS).toISOString().slice(0, 10);
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

function readRaw(req, limit) {
  if (req.raw.length > limit) throw httpError(413, "Requête trop volumineuse.");
  return req.raw;
}

async function readJson(req, limit = 20_000) {
  const raw = readRaw(req, limit);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    throw httpError(400, "JSON invalide.");
  }
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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
  plans: CONCOURS_PLANS.map(({ id, price_xaf, days }) => ({ id, price_xaf, days })),
  bourses_plan: { price_xaf: PRICE_XAF_BOURSES, days: ACCESS_DAYS_BOURSES, payment_enabled: Boolean(CHARIOW_API_KEY && CHARIOW_PRODUCT_ID_BOURSES) },
  bourses_public: boursesPublic(),
  whatsapp_channel: WHATSAPP_CHANNEL_URL || null,
  whatsapp_contact: WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : null,
  accounts_persistent: store.kind === "postgres",
  version: VERSION,
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
  if (tooManyAttempts(`${req.ip}|${email}`)) {
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
  if (b.bourse_profil && typeof b.bourse_profil === "object") {
    const p = b.bourse_profil;
    const branche = p.branche === "" || p.branche == null ? null : p.branche;
    const domaine = p.domaine === "" || p.domaine == null ? null : p.domaine;
    const niveau = p.niveau === "" || p.niveau == null ? null : p.niveau;
    if (branche && !Object.keys(BRANCHES).includes(branche)) throw httpError(400, "Branche inconnue.");
    if (domaine && !DOMAINES.includes(domaine)) throw httpError(400, "Filière inconnue.");
    if (niveau && !NIVEAUX_BOURSE.includes(niveau)) throw httpError(400, "Niveau inconnu.");
    u.bourse_profil = { branche, domaine, niveau };
  }
  if (b.profil && typeof b.profil === "object") {
    try {
      u.profil = { ...(u.profil || {}), ...cleanProfil(b.profil) };
    } catch (e) {
      throw httpError(e.status || 400, e.message);
    }
  }
  await store.saveUser(u);
  return profile(u);
});

// « Quel concours pour moi ? » : classe les concours selon le profil du compte et leurs conditions d'accès.
route("GET", "/api/orientation", async (req, _p, url) => {
  const u = await currentUser(req);
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : u.lang || "fr";
  if (!u.profil?.niveau) throw httpError(400, "Indiquez d'abord votre niveau d'études.");
  const list = (await catalogLive(lang)).concours;
  return { profil: u.profil, annee_cible: targetYear(), resultats: orient(u.profil, list) };
});

// ---------- Entraînement : quiz du jour, séries, concours blanc, carnet d'erreurs ----------
const quizOf = (u) => (u.quiz ||= emptyQuiz());
const userLang = (u, url) => (LANGS.includes(url?.searchParams.get("lang")) ? url.searchParams.get("lang") : u.lang || "fr");
// Question sans sa réponse.
const pubQ = (q, lang) => ({ id: q.id, theme: q.theme, niveau: q.niveau, q: q[lang].q, options: q[lang].options });
const needPremium = (u) => {
  if (!isPremium(u)) throw httpError(402, "Réservé aux abonnés.", { code: "locked" });
};
const dailyIds = (day) => pickDaily(content.quizList(), day);

route("GET", "/api/quiz/daily", async (req, _p, url) => {
  const u = await currentUser(req);
  const lang = userLang(u, url);
  const today = dayStr();
  const ids = dailyIds(today);
  const qz = quizOf(u);
  const answered = qz.daily?.date === today ? qz.daily.answers : {};
  const results = {};
  for (const id of ids) {
    if (!answered[id]) continue;
    const q = content.quizQuestion(id);
    results[id] = { choice: answered[id].choice, ok: answered[id].ok, answer: q[lang].answer, explication: q[lang].explication };
  }
  const done = ids.every((id) => answered[id]);
  return { date: today, questions: ids.map((id) => pubQ(content.quizQuestion(id), lang)), results, done, score: done ? ids.filter((id) => answered[id].ok).length : null };
});

route("GET", "/api/quiz/series", async (req, _p, url) => {
  const u = await currentUser(req);
  needPremium(u);
  const n = [10, 20, 40].includes(Number(url.searchParams.get("n"))) ? Number(url.searchParams.get("n")) : 10;
  const theme = url.searchParams.get("theme") || "";
  const niveau = url.searchParams.get("niveau") || "";
  const ids = pickSeries(content.quizList(), { theme: content.quizThemes().includes(theme) ? theme : "", niveau, n });
  if (!ids.length) throw httpError(404, "Aucune question pour ce choix.");
  const lang = userLang(u, url);
  return { questions: ids.map((id) => pubQ(content.quizQuestion(id), lang)) };
});

route("GET", "/api/quiz/blanc", async (req, _p, url) => {
  const u = await currentUser(req);
  needPremium(u);
  const lang = userLang(u, url);
  const ids = pickBlanc(content.quizList(), 40);
  return { duree: 40, questions: ids.map((id) => pubQ(content.quizQuestion(id), lang)) };
});

route("GET", "/api/quiz/revision", async (req, _p, url) => {
  const u = await currentUser(req);
  const lang = userLang(u, url);
  const qz = quizOf(u);
  const due = dueIds(qz, dayStr()).filter((id) => content.quizQuestion(id));
  return { due: due.length, carnet: Object.keys(qz.carnet).length, questions: due.slice(0, 20).map((id) => pubQ(content.quizQuestion(id), lang)) };
});

route("GET", "/api/quiz/stats", async (req, _p, url) => {
  const u = await currentUser(req);
  const qz = quizOf(u);
  const today = dayStr();
  const perTheme = {};
  for (const q of content.quizList()) perTheme[q.theme] = (perTheme[q.theme] || 0) + 1;
  return {
    themes: qz.stats,
    bank: perTheme,
    carnet: Object.keys(qz.carnet).length,
    due: dueIds(qz, today).length,
    streak: streak(qz.days, today),
    days: qz.days.filter((d) => d >= new Date(Date.now() - 29 * DAY_MS).toISOString().slice(0, 10)),
    daily_done: qz.daily?.date === today && dailyIds(today).every((id) => qz.daily.answers[id]),
    daily_score: qz.daily?.date === today ? Object.values(qz.daily.answers).filter((x) => x.ok).length : 0,
  };
});

// Correction. Le mode décide qui a le droit de connaître la réponse :
//  daily : les questions du jour (gratuit) ; revision : les questions de son carnet (gratuit) ; series, blanc : abonnés.
route("POST", "/api/quiz/check", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req, 30_000);
  const mode = ["daily", "revision", "series", "blanc"].includes(b.mode) ? b.mode : "";
  if (!mode) throw httpError(400, "Mode inconnu.");
  if (mode === "series" || mode === "blanc") needPremium(u);
  const lang = u.lang || "fr";
  const today = dayStr();
  const qz = quizOf(u);
  const todays = new Set(dailyIds(today));
  if (mode === "daily" && qz.daily?.date !== today) qz.daily = { date: today, answers: {} };
  const answers = (Array.isArray(b.answers) ? b.answers : []).slice(0, 50);
  const results = [];
  for (const a of answers) {
    const q = content.quizQuestion(str(a.id, 80));
    const choice = Number(a.choice);
    if (!q || !Number.isInteger(choice) || choice < 0 || choice > 3) throw httpError(400, "Réponse invalide.");
    if (mode === "daily" && !todays.has(q.id)) throw httpError(403, "Cette question ne fait pas partie du quiz du jour.");
    if (mode === "revision" && !qz.carnet[q.id]) throw httpError(403, "Cette question n'est pas dans votre carnet.");
    const v = q[lang];
    const prev = mode === "daily" ? qz.daily.answers[q.id] : null;
    const ok = prev ? prev.ok : choice === v.answer; // la réponse du jour compte une seule fois
    if (!prev) {
      recordAnswer(qz, q, ok, today);
      if (mode === "daily") qz.daily.answers[q.id] = { choice, ok };
    }
    results.push({ id: q.id, choice: prev ? prev.choice : choice, ok, answer: v.answer, explication: v.explication });
  }
  await store.saveUser(u);
  return { results, streak: streak(qz.days, today), carnet: Object.keys(qz.carnet).length, due: dueIds(qz, today).length };
});

// ---------- Plan à rebours ----------
// Sans abonnement : la première semaine seulement ; les suivantes sont verrouillées.
async function planView(u) {
  const pl = u.plan;
  if (!pl) return { plan: null };
  const lang = u.lang || "fr";
  const c = content.concours(pl.concours);
  const off = await epreuvesOff();
  const papers = content.allEpreuves().filter((e) => e.concours === pl.concours && e.lang === lang && !off.has(e.id)).map((e) => e.id);
  const { themes, writing } = subjectThemes(c?.[lang]?.annuaire?.matieres || [], lang);
  const qz = quizOf(u);
  const weak = Object.entries(qz.stats)
    .filter(([, x]) => x.ok + x.ko >= 5 && x.ok / (x.ok + x.ko) < 0.7)
    .sort(([, a], [, b]) => a.ok / (a.ok + a.ko) - b.ok / (b.ok + b.ko))
    .map(([k]) => k);
  const built = buildPlan({ examDate: pl.date, today: dayStr(), hours: pl.hours, themes, writing, papers, weak });
  if (!built) return { plan: pl, built: null, expired: true };
  const premium = isPremium(u);
  const weeks = built.weeks.map((w, i) => (premium || i === 0 ? w : { n: w.n, from: w.from, to: w.to, phase: w.phase, focus: w.focus, locked: true, sessions: [] }));
  return { plan: pl, built: { ...built, weeks }, premium, today: dayStr() };
}

route("GET", "/api/plan", async (req) => planView(await currentUser(req)));

route("POST", "/api/plan", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  if (b.clear) {
    delete u.plan;
    await store.saveUser(u);
    return { plan: null };
  }
  const concours = str(b.concours, 120);
  const date = str(b.date, 10);
  const hours = Number(b.hours);
  if (!content.concours(concours)) throw httpError(404, "Concours introuvable.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw httpError(400, "Indiquez la date du concours.");
  const today = dayStr();
  if (date <= today) throw httpError(400, "La date du concours doit être dans le futur.");
  if (date > new Date(Date.now() + 400 * DAY_MS).toISOString().slice(0, 10)) throw httpError(400, "Cette date est trop lointaine.");
  if (!HOURS.includes(hours)) throw httpError(400, "Choisissez 3, 5, 8 ou 12 heures par semaine.");
  u.plan = { concours, date, hours, created: new Date().toISOString() };
  await store.saveUser(u);
  return planView(u);
});

// ---------- Bourses d'études ----------
const boursesAllowed = (u) => boursesPublic() || isAdmin(u);

// Corrections du concepteur (dates de l'édition en cours, lien, vérification) : elles priment sur content/bourses.json.
let boursesCache = { at: 0, map: {} };
async function boursesOverrides() {
  if (Date.now() - boursesCache.at < 15000) return boursesCache.map;
  boursesCache = { at: Date.now(), map: (await store.getSetting("bourses")) || {} };
  return boursesCache.map;
}

// Les élèves ne voient que les bourses vérifiées (page officielle lue) ; une bourse d'une seule langue n'est montrée qu'à cette section.
const seenBy = (u, b, lang) => (isAdmin(u) || b.status === "verified") && (!b.langue_acces || b.langue_acces === lang);

async function boursesLive(lang, u = null) {
  const over = await boursesOverrides();
  const list = content.bourses(lang).map((b) => {
    const o = over[b.id];
    if (o) {
      if (o.edition) b.edition = { ...b.edition, ...o.edition };
      if (o.lien_officiel) b.lien_officiel = o.lien_officiel;
      if (o.status) b.status = o.status;
      if (o.last_verified) b.last_verified = o.last_verified;
      if (typeof o.vedette === "boolean") b.vedette = o.vedette;
      if (typeof o.apercu_gratuit === "boolean") b.apercu_gratuit = o.apercu_gratuit;
    }
    const e = b.edition || {};
    const annees = [...new Set([...(b.editions || []).map((x) => x.annee), e.cloture?.slice(0, 4), e.ouverture?.slice(0, 4)].filter(Boolean).map(Number))].sort();
    return { ...b, annees, statut: statutBourse(b) };
  }).filter((b) => !u || seenBy(u, b, lang));
  return trierBourses(list);
}

// Ce que voit un compte sans abonnement : de quoi choisir (nom, pays, niveau, valeur, dates, conditions) mais ni le lien
// officiel ni le dossier ni les conseils. Les champs sont retirés ICI, côté serveur : le navigateur ne les reçoit jamais.
const LOCKED_B = ["lien_officiel", "dossier", "etapes", "conseil", "sources", "resume_long", "ne_couvre_pas", "cout_candidature"];
const bourseOpen = (u, b) => hasBoursesPass(u) || b.apercu_gratuit;
function bourseView(u, b, { full }) {
  const open = bourseOpen(u, b);
  const v = { ...b, verrou: !open, a_lien: Boolean(b.lien_officiel) };
  if (!open) {
    for (const k of LOCKED_B) v[k] = Array.isArray(b[k]) ? [] : k === "lien_officiel" ? null : "";
    v.couverture = { ...b.couverture, detail: "" };
    v.conditions = { ...b.conditions, autres: [] };
  }
  if (!full) {
    // La liste reste légère : le détail se charge à l'ouverture de la fiche.
    for (const k of ["resume_long", "dossier", "etapes", "conseil", "sources", "ne_couvre_pas", "cout_candidature", "eligibilite", "editions"]) delete v[k];
    if (!isAdmin(u)) delete v.lien_officiel; // le concepteur garde le lien en liste pour son éditeur
    v.couverture = { niveau: b.couverture.niveau };
    v.conditions = { age_max: b.conditions.age_max };
    v.resume = (b.resume || "").slice(0, 200);
  }
  return v;
}

route("GET", "/api/bourses", async (req, _p, url) => {
  const u = await currentUser(req);
  if (!boursesAllowed(u)) throw httpError(403, "Cette section n'est pas encore ouverte.");
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : u.lang || "fr";
  return { today: dayStr(), bourses: (await boursesLive(lang, u)).map((b) => bourseView(u, b, { full: false })) };
});

route("GET", "/api/bourse", async (req, _p, url) => {
  const u = await currentUser(req);
  if (!boursesAllowed(u)) throw httpError(403, "Cette section n'est pas encore ouverte.");
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : u.lang || "fr";
  const b = (await boursesLive(lang, u)).find((x) => x.id === str(url.searchParams.get("id"), 120));
  if (!b) throw httpError(404, "Bourse introuvable.");
  return { bourse: bourseView(u, b, { full: true }) };
});

// Conseils et modèles : le titre et le résumé sont publics, le texte des articles « abonnés » reste sur le serveur.
route("GET", "/api/conseils", async (req) => {
  const u = await currentUser(req);
  if (!boursesAllowed(u)) throw httpError(403, "Cette section n'est pas encore ouverte.");
  return { conseils: content.conseils().map((a) => ({ id: a.id, categorie: a.categorie, gratuit: Boolean(a.gratuit), branche: a.branche || null, titre: a.fr.titre, resume: a.fr.resume || "" })) };
});

route("GET", "/api/conseil", async (req, _p, url) => {
  const u = await currentUser(req);
  if (!boursesAllowed(u)) throw httpError(403, "Cette section n'est pas encore ouverte.");
  const a = content.conseil(str(url.searchParams.get("id"), 120));
  if (!a) throw httpError(404, "Article introuvable.");
  if (!a.gratuit && !hasBoursesPass(u)) throw httpError(402, "Cet article est réservé aux abonnés du Pass Bourses.", { code: "locked" });
  return { conseil: { id: a.id, titre: a.fr.titre, sections: a.fr.sections } };
});

route("POST", "/api/follow-bourse", async (req) => {
  const u = await currentUser(req);
  if (!boursesAllowed(u)) throw httpError(403, "Cette section n'est pas encore ouverte.");
  const b = await readJson(req);
  const id = str(b.id, 120);
  if (!content.bourse(id)) throw httpError(404, "Bourse introuvable.");
  const list = new Set(u.bourses_suivies || []);
  if (b.on === false) list.delete(id);
  else if (!list.has(id)) {
    if (!hasBoursesPass(u) && list.size >= FREE_FOLLOWS_BOURSES) {
      throw httpError(402, `Sans le Pass Bourses, vous pouvez suivre ${FREE_FOLLOWS_BOURSES} bourses. Le Pass Bourses permet d'en suivre autant que vous voulez.`, { code: "follow_limit" });
    }
    list.add(id);
  }
  u.bourses_suivies = [...list];
  await store.saveUser(u);
  return profile(u);
});

// Le concepteur met à jour l'édition en cours d'une bourse : dates relevées sur la page officielle.
route("POST", "/api/admin/bourse", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const b = await readJson(req);
  const id = str(b.id, 120);
  const raw = content.bourse(id);
  if (!raw) throw httpError(404, "Bourse introuvable.");
  const e = b.edition && typeof b.edition === "object" ? b.edition : {};
  const date = (v) => (v ? str(String(v), 10) : null);
  const edition = { libelle: str(e.libelle, 20) || raw.edition?.libelle || null, ouverture: date(e.ouverture), cloture: date(e.cloture), confirme: Boolean(e.confirme) };
  const lien = str(b.lien_officiel, 500);
  const merged = { ...raw, edition: { ...raw.edition, ...edition }, lien_officiel: lien || raw.lien_officiel, status: typeof b.verified === "boolean" ? (b.verified ? "verified" : "to_verify") : (await boursesOverrides())[id]?.status || raw.status || "to_verify" };
  try {
    checkBourse(merged);
  } catch (err) {
    throw httpError(400, err.message);
  }
  const over = { ...((await store.getSetting("bourses")) || {}) };
  over[id] = { ...(over[id] || {}), edition, lien_officiel: lien || undefined, status: merged.status, last_verified: dayStr(), edited_by: admin.email };
  if (typeof b.vedette === "boolean") over[id].vedette = b.vedette;
  if (typeof b.apercu_gratuit === "boolean") over[id].apercu_gratuit = b.apercu_gratuit;
  await store.setSetting("bourses", over);
  boursesCache = { at: Date.now(), map: over };
  const lang = LANGS.includes(b.lang) ? b.lang : "fr";
  return { id, bourse: bourseView(admin, (await boursesLive(lang)).find((x) => x.id === id), { full: true }) };
});

// Suivre un concours : 2 gratuitement, sans limite pour les abonnés.
route("POST", "/api/follow", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  const id = str(b.id, 120);
  if (!content.concours(id)) throw httpError(404, "Concours introuvable.");
  const list = new Set(u.suivis || []);
  if (b.on === false) list.delete(id);
  else if (!list.has(id)) {
    if (!isPremium(u) && list.size >= FREE_FOLLOWS) {
      throw httpError(402, `Sans abonnement, vous pouvez suivre ${FREE_FOLLOWS} concours. Abonnez-vous pour en suivre autant que vous voulez.`, { code: "follow_limit" });
    }
    list.add(id);
  }
  u.suivis = [...list];
  await store.saveUser(u);
  return profile(u);
});

// Annonces : lancement, date limite, épreuves, résultats. Publiques une fois validées par le concepteur.
const ANNONCE_KINDS = ["lancement", "date_limite", "epreuves", "resultats", "info"];
const cleanAnnonce = (b) => {
  const lien = str(b.lien, 500);
  const date = str(b.date, 10);
  return {
    concours: b.concours && content.concours(str(b.concours, 120)) ? str(b.concours, 120) : null,
    kind: ANNONCE_KINDS.includes(b.kind) ? b.kind : "info",
    titre: str(b.titre, 200),
    titre_en: str(b.titre_en, 200),
    message: str(b.message, 1000),
    message_en: str(b.message_en, 1000),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : null,
    lien: /^https?:\/\//.test(lien) ? lien : null,
  };
};

route("GET", "/api/annonces", async () => {
  const list = (await store.listAnnonces()).filter((a) => a.status === "published");
  return list.sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 30);
});

route("GET", "/api/admin/annonces", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const list = (await store.listAnnonces()).filter((a) => a.status !== "rejected");
  return list.sort((a, b) => (a.status === b.status ? b.at.localeCompare(a.at) : a.status === "draft" ? -1 : 1)).slice(0, 100);
});

// Crée ou modifie une annonce ; publish: true la rend publique.
route("POST", "/api/admin/annonce", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const b = await readJson(req);
  const fields = cleanAnnonce(b);
  if (fields.titre.length < 5) throw httpError(400, "Donnez un titre à l'annonce.");
  const now = new Date().toISOString();
  let a = b.id ? await store.getAnnonce(str(b.id, 80)) : null;
  if (b.id && !a) throw httpError(404, "Annonce introuvable.");
  a = { ...(a || { id: `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`, at: now, source: "concepteur" }), ...fields };
  if (b.publish) {
    a.status = "published";
    a.published_at = a.published_at || now;
  } else a.status = a.status || "draft";
  await store.saveAnnonce(a);
  return a;
});

// « Supprimer » garde la trace en statut rejected : un lien rejeté ne revient pas dans les brouillons de la veille.
route("POST", "/api/admin/annonce-reject", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const a = await store.getAnnonce(str((await readJson(req)).id, 80));
  if (!a) throw httpError(404, "Annonce introuvable.");
  a.status = "rejected";
  await store.saveAnnonce(a);
  return { ok: true };
});

// Reçoit les brouillons du script de veille (tools/veille). Jeton partagé, comparaison à temps constant.
route("POST", "/api/veille/draft", async (req) => {
  const h = req.headers.authorization || "";
  const digest = (x) => crypto.createHash("sha256").update(x).digest();
  if (!VEILLE_TOKEN) throw httpError(503, "Veille non configurée.");
  if (!h.startsWith("Bearer ") || !crypto.timingSafeEqual(digest(h.slice(7)), digest(VEILLE_TOKEN))) throw httpError(401, "Jeton invalide.");
  const b = await readJson(req, 64_000);
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  let created = 0;
  for (const it of items) {
    const lien = str(it.url, 500);
    const titre = str(it.titre, 200);
    if (!/^https?:\/\//.test(lien) || titre.length < 5) continue;
    const id = "v" + crypto.createHash("sha256").update(lien).digest("hex").slice(0, 16);
    const ok = await store.addAnnonceIfNew({ id, at: new Date().toISOString(), status: "draft", kind: "info", concours: null, titre, titre_en: "", message: "", message_en: "", date: null, lien, source: str(it.source, 100) || "veille" });
    if (ok) created++;
  }
  return { created };
});

// Droits de la personne : exporter toutes ses données, supprimer son compte.
route("GET", "/api/me/export", async (req) => {
  const u = await currentUser(req);
  const { pw, token_v, ...compte } = u;
  const signalements = (await store.listReports()).filter((r) => r.email === u.email);
  return { exporte_le: new Date().toISOString(), compte, signalements };
});

route("POST", "/api/account/delete", async (req) => {
  const u = await currentUser(req);
  const b = await readJson(req);
  if (!checkPassword(String(b.password || ""), u.pw)) throw httpError(401, "Mot de passe incorrect.");
  for (const r of await store.listReports()) if (r.email === u.email) await store.deleteReport(r.id);
  await store.deleteUser(u.email);
  return { ok: true };
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

// Épreuves retirées par le concepteur (interrupteur de l'espace concepteur) : invisibles et inaccessibles.
let offCache = { at: 0, set: new Set() };
async function epreuvesOff() {
  if (Date.now() - offCache.at < 15000) return offCache.set;
  offCache = { at: Date.now(), set: new Set((await store.getSetting("epreuves_off")) || []) };
  return offCache.set;
}
async function liveEpreuve(id) {
  const e = content.epreuve(id);
  if (!e || (await epreuvesOff()).has(id)) return null;
  return e;
}

// Corrections des fiches faites par le concepteur dans l'application (conditions vérifiées dans l'arrêté).
// Elles priment sur content/concours.json et survivent aux mises à jour du code.
let fichesCache = { at: 0, map: {} };
async function fichesOverrides() {
  if (Date.now() - fichesCache.at < 15000) return fichesCache.map;
  fichesCache = { at: Date.now(), map: (await store.getSetting("fiches")) || {} };
  return fichesCache.map;
}

function applyOverride(c, o, lang) {
  const { periodicite_txt, ...accesTxt } = o.texts?.[lang] || {};
  const acces = { ...(c.acces || {}), ...(o.acces || {}), ...accesTxt };
  if (Object.keys(acces).length) c.acces = acces;
  if (o.calendrier || c.calendrier) {
    const cal = { ...(c.calendrier || {}), ...(o.calendrier || {}) };
    const mois = moisOf(cal);
    if (mois) cal.mois = mois;
    else delete cal.mois;
    c.calendrier = cal;
  }
  if (o.lien_inscription !== undefined) c.lien_inscription = o.lien_inscription || undefined;
  if (o.status) c.status = o.status;
  if (o.last_verified) c.last_verified = o.last_verified;
  if (o.periodicite) c.periodicite = { ...(c.periodicite || {}), ...o.periodicite, ...(periodicite_txt || {}) };
}

// Catalogue tel que les élèves le voient : épreuves retirées en moins, fiches corrigées en plus.
async function catalogLive(lang) {
  const cat = content.catalog(lang);
  const off = await epreuvesOff();
  if (off.size) cat.epreuves = cat.epreuves.filter((e) => !off.has(e.id));
  const over = await fichesOverrides();
  for (const c of cat.concours) if (over[c.id]) applyOverride(c, over[c.id], lang);
  // « En pause » dépend de la date du jour : calculé à chaque appel, jamais enregistré
  for (const c of cat.concours) if (c.periodicite) c.periodicite.pause = enPause(c.periodicite);
  return cat;
}

// Catalogue public : fiches, liste des épreuves classées, déroulement de l'oral.
route("GET", "/api/catalog", async (req, _p, url) => {
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "fr";
  return catalogLive(lang);
});

// Éditeur de fiches : le concepteur corrige les conditions d'accès et les marque « vérifiées ».
route("POST", "/api/admin/fiche", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const b = await readJson(req);
  const id = str(b.id, 120);
  if (!content.concours(id)) throw httpError(404, "Concours introuvable.");
  const lang = LANGS.includes(b.lang) ? b.lang : "fr";
  const a = b.acces && typeof b.acces === "object" ? b.acces : {};
  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  const acces = {
    niveaux_min: a.niveaux_min || null,
    niveaux_max: a.niveaux_max || null,
    series: Array.isArray(a.series) && a.series.length ? a.series.map((x) => str(String(x), 20)).filter(Boolean) : null,
    age_min: num(a.age_min),
    age_max: num(a.age_max),
    age_aucune: Boolean(a.age_aucune),
    confiance: a.confiance || "secondaire",
    annee_conditions: num(a.annee_conditions),
  };
  if (acces.age_aucune) {
    acces.age_min = null;
    acces.age_max = null;
  }
  const status = b.verified ? "verified" : "to_verify";
  const pin = b.periodicite && typeof b.periodicite === "object" ? b.periodicite : null;
  const years = (v) => String(v ?? "").split(/[\s,;]+/).filter(Boolean).map(Number);
  const periodicite = pin
    ? {
        type: pin.type || "inconnue",
        intervalle_ans: pin.type === "pluriannuelle" ? num(pin.intervalle_ans) : null,
        sessions: years(pin.sessions).sort((x, y) => x - y),
        derniere_session: num(pin.derniere_session),
        prochaine_probable: num(pin.prochaine_probable),
        confiance: pin.confiance || "secondaire",
      }
    : null;
  try {
    checkAccesValues(id, acces, status);
    checkPeriodicite(id, periodicite);
  } catch (e) {
    throw httpError(400, e.message);
  }
  const k = b.calendrier && typeof b.calendrier === "object" ? b.calendrier : {};
  const calendrier = {
    mois_lancement: str(k.mois_lancement, 80) || null,
    mois_limite_depot: str(k.mois_limite_depot, 80) || null,
    mois_epreuves: str(k.mois_epreuves, 80) || null,
    frais_fcfa: num(k.frais_fcfa),
  };
  if (calendrier.frais_fcfa !== null && !(Number.isFinite(calendrier.frais_fcfa) && calendrier.frais_fcfa >= 0 && calendrier.frais_fcfa < 10_000_000)) throw httpError(400, "Frais invalides.");
  const lien = str(b.lien_inscription, 500);
  if (lien && !/^https?:\/\//.test(lien)) throw httpError(400, "Le lien d'inscription doit commencer par https://");
  const t = b.texts && typeof b.texts === "object" ? b.texts : {};
  const over = { ...((await store.getSetting("fiches")) || {}) };
  const prev = over[id] || {};
  over[id] = {
    ...prev,
    acces,
    calendrier,
    lien_inscription: lien,
    status,
    last_verified: dayStr(),
    ...(periodicite ? { periodicite } : {}),
    texts: {
      ...(prev.texts || {}),
      [lang]: { diplomes: str(t.diplomes, 400), series_note: str(t.series_note, 400), age_note: str(t.age_note, 400), ...(pin ? { periodicite_txt: { note: str(pin.note, 400) } } : {}) },
    },
    edited_by: admin.email,
  };
  await store.setSetting("fiches", over);
  fichesCache = { at: Date.now(), map: over };
  const cat = (await catalogLive(lang)).concours.find((c) => c.id === id);
  return { id, fiche: cat };
});

// Sujet d'une épreuve : abonnés, ou l'unique épreuve offerte du compte.
route("GET", "/api/epreuves/:id/sujet", async (req, p) => {
  const u = await currentUser(req);
  const e = await liveEpreuve(p.id);
  if (!e) throw httpError(404, "Épreuve introuvable.");
  if (!isPremium(u)) {
    if (!u.free_id) {
      u.free_id = e.id;
      await store.saveUser(u);
    } else if (u.free_id !== e.id) {
      throw httpError(402, "Vous avez déjà utilisé votre épreuve offerte. Abonnez-vous pour accéder à toutes les épreuves.", { code: "locked" });
    }
  }
  const { corrige, bareme, grille, source_doc, rights, ...sujet } = e;
  return { ...sujet, free_id: u.free_id || null };
});

route("GET", "/api/epreuves/:id/corrige", async (req, p) => {
  await currentPremium(req);
  const e = await liveEpreuve(p.id);
  if (!e) throw httpError(404, "Épreuve introuvable.");
  const { source_doc, rights, ...pub } = e; // les références internes du recueil ne sortent jamais
  return pub;
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
  const plan = PLANS.find((x) => x.id === b.plan) || CONCOURS_PLANS[0];
  const data = await chariow("POST", "/checkout", {
    product_id: plan.product,
    email: u.email,
    first_name: str(b.first_name, 50) || first.slice(0, 50),
    last_name: str(b.last_name, 50) || rest.join(" ").slice(0, 50) || first.slice(0, 50),
    phone: { number: phone, country_code: str(b.country_code, 2).toUpperCase() || "CM" },
    redirect_url: `${PUBLIC_URL}/?sale={sale_id}`,
    custom_metadata: { app: "weldon", account: u.email, plan: plan.id },
    customer_ip: req.ip,
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
  const raw = readRaw(req, 1024 * 1024);
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
  const until = days ? new Date(Date.now() + days * DAY_MS).toISOString() : null;
  if (b.product === "bourses") target.bourses_until = until; // Pass Bourses offert
  else target.premium_until = until;
  target.granted_by = admin.email;
  await store.saveUser(target);
  return profile(target);
});

// Signaler une erreur dans un sujet, un corrigé ou un barème. Le concepteur les traite dans son espace.
const REPORT_KINDS = ["sujet", "corrige", "bareme", "autre"];
route("POST", "/api/report", async (req) => {
  const u = await currentUser(req);
  if (tooManyAttempts(`report:${u.email}`)) throw httpError(429, "Trop de signalements. Réessayez plus tard.");
  const b = await readJson(req);
  const message = str(b.message, 1000);
  if (message.length < 5) throw httpError(400, "Décrivez l'erreur en quelques mots.");
  const target = str(b.epreuve, 120);
  if (!content.epreuve(target) && !(target.startsWith("quiz:") && content.quizQuestion(target.slice(5)))) throw httpError(404, "Épreuve introuvable.");
  const id = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  await store.saveReport({
    id, at: new Date().toISOString(), email: u.email, epreuve: b.epreuve,
    kind: REPORT_KINDS.includes(b.kind) ? b.kind : "autre", message, status: "open",
  });
  return { ok: true };
});

route("GET", "/api/admin/reports", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  return (await store.listReports()).sort((a, b) => (a.status === b.status ? b.at.localeCompare(a.at) : a.status === "open" ? -1 : 1)).slice(0, 100);
});

route("POST", "/api/admin/report-close", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const r = await store.getReport(str((await readJson(req)).id, 80));
  if (!r) throw httpError(404, "Signalement introuvable.");
  r.status = "closed";
  r.closed_by = admin.email;
  await store.saveReport(r);
  return { ok: true };
});

// Interrupteur par épreuve : retirer immédiatement une épreuve (droits, erreur grave).
route("GET", "/api/admin/epreuves", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const off = await epreuvesOff();
  return content.allEpreuves().map((e) => ({ ...e, off: off.has(e.id) }));
});

route("POST", "/api/admin/epreuve-switch", async (req) => {
  const admin = await currentUser(req);
  if (!isAdmin(admin)) throw httpError(403, "Réservé au concepteur.");
  const b = await readJson(req);
  if (!content.epreuve(str(b.id, 120))) throw httpError(404, "Épreuve introuvable.");
  const off = new Set((await store.getSetting("epreuves_off")) || []);
  if (b.off) off.add(b.id);
  else off.delete(b.id);
  await store.setSetting("epreuves_off", [...off]);
  offCache = { at: Date.now(), set: off };
  return { id: b.id, off: off.has(b.id) };
});

// Traite une requête : { method, url (URL), headers (clés en minuscules), ip, raw (Buffer) }.
// Renvoie { status, body } ; body est un objet JSON.
export async function handle(req) {
  if (!TOKEN_SECRET || TOKEN_SECRET.length < 32) {
    console.error("TOKEN_SECRET manquant ou trop court (32 caractères minimum).");
    return { status: 503, body: { error: "Serveur mal configuré (TOKEN_SECRET)." } };
  }
  const url = req.url;
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = url.pathname.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    try {
      return { status: 200, body: await r.handler(req, params, url) };
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      return {
        status,
        body: { error: status >= 500 && !err.status ? "Erreur interne." : err.message, ...(err.details?.code ? { code: err.details.code } : {}) },
      };
    }
  }
  return { status: 404, body: { error: "Route inconnue" } };
}

export { store, PUBLIC_URL };
