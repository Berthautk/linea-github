// Tests du serveur Weldon, sans réseau : l'API Chariow est simulée.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "weldon-"));
Object.assign(process.env, {
  TOKEN_SECRET: "x".repeat(40),
  CHARIOW_API_KEY: "sk_test_fake",
  CHARIOW_PRODUCT_ID: "prd_weldon",
  CHARIOW_PULSE_SECRET: "whsec_test",
  PUBLIC_URL: "http://localhost",
  ADMIN_EMAILS: "concepteur@weldon.cm",
  DATA_DIR: dataDir,
});
delete process.env.DATABASE_URL;
delete process.env.ANTHROPIC_API_KEY;

const realFetch = globalThis.fetch;
const now = new Date().toISOString();
const sales = {
  sal_paid: { id: "sal_paid", status: "completed", completed_at: now, product: { id: "prd_weldon" }, customer: { email: "awa@exemple.cm" } },
  sal_wait: { id: "sal_wait", status: "awaiting_payment", product: { id: "prd_weldon" }, customer: { email: "awa@exemple.cm" } },
  sal_otherproduct: { id: "sal_otherproduct", status: "completed", completed_at: now, product: { id: "prd_autre" }, customer: { email: "awa@exemple.cm" } },
  sal_bob: { id: "sal_bob", status: "completed", completed_at: now, product: { id: "prd_weldon" }, customer: { email: "bob@exemple.cm" } },
};
let lastCheckout = null;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (!u.startsWith("https://api.chariow.com")) return realFetch(url, opts);
  const json = (data, status = 200) => new Response(JSON.stringify({ data }), { status, headers: { "Content-Type": "application/json" } });
  const m = u.match(/\/v1\/sales\/(\w+)$/);
  if (m) return sales[m[1]] ? json(sales[m[1]]) : json(null, 404);
  if (u.includes("/v1/sales?")) {
    const q = decodeURIComponent(new URL(u).searchParams.get("search") || "");
    return json({ data: Object.values(sales).filter((s) => s.customer.email === q) });
  }
  if (u.endsWith("/v1/checkout")) {
    lastCheckout = JSON.parse(opts.body);
    return json({ step: "payment", purchase: { id: "sal_new" }, payment: { checkout_url: "https://payment.chariow.com/checkout?token=t" } });
  }
  return json(null, 404);
};

let base, srv, mod;
before(async () => {
  mod = await import("./server.js");
  srv = mod.server;
  await new Promise((ok) => srv.listen(0, ok));
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => {
  srv.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

const call = (method, p, body, token, headers = {}) =>
  realFetch(base + p, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
const json = async (r) => ({ status: r.status, ...(await r.json()) });
const register = async (email, name = "Test Élève") => (await json(await call("POST", "/api/register", { email, name, password: "motdepasse1" }))).token;

test("jeton signé : valide, falsifié, expiré", () => {
  const t = mod.signToken({ sub: "s", exp: Date.now() + 1000 });
  assert.equal(mod.verifyToken(t).sub, "s");
  assert.equal(mod.verifyToken(t.slice(0, -2) + "xx"), null);
  assert.equal(mod.verifyToken(mod.signToken({ sub: "s", exp: Date.now() - 1 })), null);
});

test("application et catalogue public dans les deux langues, sans les textes", async () => {
  assert.match(await (await realFetch(base + "/")).text(), /<title>Weldon<\/title>/);
  const fr = await json(await call("GET", "/api/catalog?lang=fr"));
  const en = await json(await call("GET", "/api/catalog?lang=en"));
  assert.ok(fr.epreuves.length > 0 && en.epreuves.length > 0);
  assert.ok(fr.epreuves.every((e) => !("corrige" in e) && !("sujet" in e)));
  assert.ok(en.concours.some((c) => c.nom === "Cadet Police Constables"));
  assert.ok(en.epreuves.some((e) => e.matiere === "Essay writing"));
  assert.doesNotMatch(await (await realFetch(base + "/..%2Fserver%2Fserver.js")).text(), /CHARIOW_API_KEY/);
});

test("inscription, connexion, comptes séparés", async () => {
  assert.equal((await call("POST", "/api/register", { email: "x@y.cm", name: "X", password: "court" })).status, 400);
  const t1 = await register("eleve1@exemple.cm", "Élève Un");
  const t2 = await register("eleve2@exemple.cm", "Élève Deux");
  assert.equal((await call("POST", "/api/register", { email: "eleve1@exemple.cm", name: "Z", password: "motdepasse1" })).status, 409);
  assert.equal((await json(await call("GET", "/api/me", undefined, t1))).email, "eleve1@exemple.cm");
  assert.equal((await json(await call("GET", "/api/me", undefined, t2))).email, "eleve2@exemple.cm");
  assert.equal((await call("POST", "/api/login", { email: "eleve1@exemple.cm", password: "mauvais!!" })).status, 401);
  const login = await json(await call("POST", "/api/login", { email: "ELEVE1@exemple.cm", password: "motdepasse1" }));
  assert.equal(login.user.name, "Élève Un");
  const me = await json(await call("POST", "/api/me", { lang: "en" }, t1));
  assert.equal(me.lang, "en");
});

test("une seule épreuve offerte par compte, corrigés réservés", async () => {
  const t = await register("gratuit@exemple.cm");
  const s1 = await json(await call("GET", "/api/epreuves/pol-2025-redaction-fr/sujet", undefined, t));
  assert.equal(s1.status, 200);
  assert.ok(s1.sujet.length > 50 && !("corrige" in s1));
  assert.equal((await call("GET", "/api/epreuves/pol-2025-redaction-fr/sujet", undefined, t)).status, 200);
  const s2 = await json(await call("GET", "/api/epreuves/pol-2025-culture-fr/sujet", undefined, t));
  assert.equal(s2.status, 402);
  assert.equal(s2.code, "locked");
  assert.equal((await call("GET", "/api/epreuves/pol-2025-redaction-fr/corrige", undefined, t)).status, 402);
  assert.equal((await call("GET", "/api/oral/emia?lang=en", undefined, t)).status, 402);
  assert.equal((await call("GET", "/api/epreuves/pol-2025-redaction-fr/sujet")).status, 401);
});

test("le concepteur a tout l'accès sans payer et peut offrir un accès", async () => {
  const t = await register("concepteur@weldon.cm", "Concepteur");
  const me = await json(await call("GET", "/api/me", undefined, t));
  assert.equal(me.admin, true);
  assert.equal(me.premium, true);
  assert.equal((await call("GET", "/api/epreuves/pol-2025-essay-en/corrige", undefined, t)).status, 200);
  assert.equal((await call("GET", "/api/oral/emia?lang=en", undefined, t)).status, 200);
  const users = await json(await call("GET", "/api/admin/users", undefined, t));
  assert.equal(users.status, 200);
  const tGift = await register("testeur@exemple.cm");
  const granted = await json(await call("POST", "/api/admin/grant", { email: "testeur@exemple.cm", days: 30 }, t));
  assert.equal(granted.premium, true);
  assert.equal((await call("GET", "/api/epreuves/gp-2025-gk-en/corrige", undefined, tGift)).status, 200);
  const tNormal = await register("pasadmin@exemple.cm");
  assert.equal((await call("GET", "/api/admin/users", undefined, tNormal)).status, 403);
});

test("paiement : checkout au nom du compte puis vérification de la vente", async () => {
  const t = await register("awa@exemple.cm", "Awa Ngo Mballa");
  // Le compte a déjà un achat chez Chariow : la synchronisation à l'inscription l'a trouvé.
  assert.equal((await json(await call("GET", "/api/me", undefined, t))).premium, true);

  const tb = await register("nouveau@exemple.cm", "Paul Etoa");
  const r = await json(await call("POST", "/api/checkout", { phone: "+237 6 99 00 11 22" }, tb));
  assert.equal(r.step, "payment");
  assert.equal(lastCheckout.email, "nouveau@exemple.cm");
  assert.equal(lastCheckout.first_name, "Paul");
  assert.equal(lastCheckout.last_name, "Etoa");
  assert.deepEqual(lastCheckout.phone, { number: "699001122", country_code: "CM" });
  assert.equal(lastCheckout.redirect_url, "http://localhost/?sale={sale_id}");

  // Une vente faite par quelqu'un d'autre ne peut pas être récupérée.
  assert.equal((await call("POST", "/api/verify-sale", { sale_id: "sal_bob" }, tb)).status, 403);
  assert.equal((await call("POST", "/api/verify-sale", { sale_id: "sal_otherproduct" }, t)).status, 403);
  assert.equal((await json(await call("POST", "/api/verify-sale", { sale_id: "sal_wait" }, t))).paid, false);
  const ok = await json(await call("POST", "/api/verify-sale", { sale_id: "sal_paid" }, t));
  assert.equal(ok.paid, true);
  assert.ok(Date.parse(ok.user.premium_until) > Date.now() + 360 * 864e5);
});

test("Pulse Chariow : signature, dédoublonnage, activation du compte", async () => {
  const tBob = await register("bob@exemple.cm", "Bob");
  const raw = '{"event":"successful.sale","sale":{"id":"sal_bob"},"customer":{"email":"bob@exemple.cm"},"store":{"url":"https:\\/\\/x.mychariow.com"}}';
  const sig = "sha256=" + crypto.createHmac("sha256", "whsec_test").update(raw).digest("hex");
  assert.equal((await call("POST", "/api/webhooks/chariow", raw, null, { "x-chariow-signature": "sha256=00" })).status, 401);
  assert.equal((await json(await call("POST", "/api/webhooks/chariow", raw, null, { "x-chariow-signature": sig, "x-pulse-delivery-id": "dlv_1" }))).ok, true);
  assert.equal((await json(await call("POST", "/api/webhooks/chariow", raw, null, { "x-chariow-signature": sig, "x-pulse-delivery-id": "dlv_1" }))).duplicate, true);
  assert.equal((await json(await call("GET", "/api/me", undefined, tBob))).premium, true);
});

test("changer de mot de passe déconnecte les autres appareils", async () => {
  const t = await register("secure@exemple.cm");
  const r = await json(await call("POST", "/api/password", { current: "motdepasse1", password: "nouveaumdp2" }, t));
  assert.equal(r.status, 200);
  assert.equal((await call("GET", "/api/me", undefined, t)).status, 401);
  assert.equal((await call("GET", "/api/me", undefined, r.token)).status, 200);
});

test("correction réservée aux abonnés", async () => {
  assert.equal((await call("POST", "/api/correct", {})).status, 401);
  const t = await register("pasabonne@exemple.cm");
  assert.equal((await call("POST", "/api/correct", {}, t)).status, 402);
});
