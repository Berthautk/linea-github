// Tests du serveur Weldon, sans réseau : l'API Chariow est simulée.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.TOKEN_SECRET = "x".repeat(40);
process.env.CHARIOW_API_KEY = "sk_test_fake";
process.env.CHARIOW_PRODUCT_ID = "prd_weldon";
process.env.CHARIOW_PULSE_SECRET = "whsec_test";
process.env.PUBLIC_URL = "http://localhost";
process.env.MAX_DEVICES = "2";

const realFetch = globalThis.fetch;
const sales = {
  sal_paid: { id: "sal_paid", status: "completed", completed_at: new Date().toISOString(), product: { id: "prd_weldon" }, customer: { email: "ami@exemple.cm" } },
  sal_old: { id: "sal_old", status: "completed", completed_at: "2020-01-01T00:00:00+00:00", product: { id: "prd_weldon" }, customer: { email: "ancien@exemple.cm" } },
  sal_wait: { id: "sal_wait", status: "awaiting_payment", product: { id: "prd_weldon" }, customer: { email: "x@exemple.cm" } },
  sal_other: { id: "sal_other", status: "completed", completed_at: new Date().toISOString(), product: { id: "prd_autre" }, customer: { email: "x@exemple.cm" } },
};
let lastCheckout = null;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (!u.startsWith("https://api.chariow.com")) return realFetch(url, opts);
  const json = (data, status = 200) => new Response(JSON.stringify({ data }), { status, headers: { "Content-Type": "application/json" } });
  const m = u.match(/\/v1\/sales\/(\w+)$/);
  if (m) return sales[m[1]] ? json(sales[m[1]]) : json(null, 404);
  if (u.includes("/v1/sales?")) return json(Object.values(sales));
  if (u.endsWith("/v1/checkout")) {
    lastCheckout = JSON.parse(opts.body);
    return json({ step: "payment", purchase: { id: "sal_new" }, payment: { checkout_url: "https://payment.chariow.com/checkout?token=t" } });
  }
  return json(null, 404);
};

let base;
let srv;
let mod;
before(async () => {
  process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "weldon-")));
  mod = await import("./server.js");
  srv = mod.server;
  await new Promise((ok) => srv.listen(0, ok));
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => {
  srv.close();
  fs.rmSync(path.join(path.dirname(new URL(import.meta.url).pathname), "data"), { recursive: true, force: true });
});

const post = (p, body, headers = {}) =>
  realFetch(base + p, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

test("jeton signé : valide, falsifié, expiré", () => {
  const t = mod.signToken({ sid: "s", exp: Date.now() + 1000 });
  assert.equal(mod.verifyToken(t).sid, "s");
  assert.equal(mod.verifyToken(t.slice(0, -2) + "xx"), null);
  assert.equal(mod.verifyToken(mod.signToken({ sid: "s", exp: Date.now() - 1 })), null);
});

test("config et application servies", async () => {
  const cfg = await (await realFetch(base + "/api/config")).json();
  assert.equal(cfg.mode, "live");
  assert.equal(cfg.payment_enabled, true);
  const html = await (await realFetch(base + "/")).text();
  assert.match(html, /<title>Weldon<\/title>/);
  assert.equal((await realFetch(base + "/../server/.env")).status, 200); // renvoie index.html, jamais un fichier hors de web/
  assert.doesNotMatch(await (await realFetch(base + "/..%2Fserver%2Fserver.js")).text(), /CHARIOW_API_KEY/);
});

test("checkout : validation puis appel Chariow", async () => {
  assert.equal((await post("/api/checkout", { email: "bad" })).status, 400);
  const r = await (await post("/api/checkout", { first_name: "Awa", last_name: "Ngo", email: "Awa@Exemple.cm", phone: "6 99 00 11 22" })).json();
  assert.equal(r.step, "payment");
  assert.equal(lastCheckout.product_id, "prd_weldon");
  assert.equal(lastCheckout.email, "awa@exemple.cm");
  assert.deepEqual(lastCheckout.phone, { number: "699001122", country_code: "CM" });
  assert.equal(lastCheckout.redirect_url, "http://localhost/?sale={sale_id}");
});

test("verify-sale : payé, en attente, autre produit, expiré, limite d'appareils", async () => {
  const ok = await (await post("/api/verify-sale", { sale_id: "sal_paid", device_id: "d1" })).json();
  assert.equal(ok.paid, true);
  assert.ok(Date.parse(ok.expires_at) > Date.now() + 360 * 864e5);
  const me = await realFetch(base + "/api/me", { headers: { Authorization: "Bearer " + ok.token } });
  assert.equal(me.status, 200);

  assert.equal((await (await post("/api/verify-sale", { sale_id: "sal_wait", device_id: "d1" })).json()).paid, false);
  assert.equal((await post("/api/verify-sale", { sale_id: "sal_other", device_id: "d1" })).status, 403);
  assert.equal((await post("/api/verify-sale", { sale_id: "sal_old", device_id: "d1" })).status, 402);

  assert.equal((await post("/api/verify-sale", { sale_id: "sal_paid", device_id: "d2" })).status, 200);
  assert.equal((await post("/api/verify-sale", { sale_id: "sal_paid", device_id: "d1" })).status, 200); // même appareil : accepté
  assert.equal((await post("/api/verify-sale", { sale_id: "sal_paid", device_id: "d3" })).status, 403);
});

test("restore par e-mail", async () => {
  assert.equal((await post("/api/restore", { email: "inconnu@exemple.cm", device_id: "z" })).status, 404);
  assert.equal((await post("/api/restore", { email: "ancien@exemple.cm", device_id: "z" })).status, 402); // abonnement expiré
  const r = await (await post("/api/restore", { email: "AMI@exemple.cm", device_id: "d1" })).json();
  assert.equal(r.paid, true);
  assert.equal(r.email, "ami@exemple.cm");
});

test("Pulse Chariow : signature et dédoublonnage", async () => {
  const raw = '{"event":"successful.sale","sale":{"id":"sal_paid"},"store":{"url":"https:\\/\\/x.mychariow.com"}}';
  const sig = "sha256=" + crypto.createHmac("sha256", "whsec_test").update(raw).digest("hex");
  assert.equal((await post("/api/webhooks/chariow", raw, { "x-chariow-signature": "sha256=00" })).status, 401);
  const first = await (await post("/api/webhooks/chariow", raw, { "x-chariow-signature": sig, "x-pulse-delivery-id": "dlv_1" })).json();
  assert.equal(first.ok, true);
  const again = await (await post("/api/webhooks/chariow", raw, { "x-chariow-signature": sig, "x-pulse-delivery-id": "dlv_1" })).json();
  assert.equal(again.duplicate, true);
});

test("correction réservée aux abonnés", async () => {
  assert.equal((await post("/api/correct", {})).status, 401);
});
