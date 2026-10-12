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
  CHARIOW_PRODUCT_ID_MONTHLY: "prd_weldon_m",
  VEILLE_TOKEN: "jeton-de-veille-de-test",
  WHATSAPP_CHANNEL_URL: "https://whatsapp.com/channel/test",
  WHATSAPP_NUMBER: "+237 6 99 00 11 22",
  CHARIOW_PULSE_SECRET: "whsec_test",
  PUBLIC_URL: "http://localhost",
  ADMIN_EMAILS: "concepteur@weldon.cm",
  DATA_DIR: dataDir,
});
delete process.env.DATABASE_URL;

const realFetch = globalThis.fetch;
const now = new Date().toISOString();
const sales = {
  sal_paid: { id: "sal_paid", status: "completed", completed_at: now, product: { id: "prd_weldon" }, customer: { email: "awa@exemple.cm" } },
  sal_wait: { id: "sal_wait", status: "awaiting_payment", product: { id: "prd_weldon" }, customer: { email: "awa@exemple.cm" } },
  sal_otherproduct: { id: "sal_otherproduct", status: "completed", completed_at: now, product: { id: "prd_autre" }, customer: { email: "awa@exemple.cm" } },
  sal_month: { id: "sal_month", status: "completed", completed_at: now, product: { id: "prd_weldon_m" }, customer: { email: "mois@exemple.cm" } },
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

test("profil et orientation : conditions du catalogue, profil validé", async () => {
  const t = await register("orient@exemple.cm");
  assert.equal((await call("GET", "/api/orientation", undefined, t)).status, 400); // pas encore de profil
  assert.equal((await call("POST", "/api/me", { profil: { niveau: "docteur" } }, t)).status, 400);
  assert.equal((await call("POST", "/api/me", { profil: { annee_naissance: 1800 } }, t)).status, 400);
  const me = await json(await call("POST", "/api/me", { lang: "fr", profil: { niveau: "bac", serie: "c", annee_naissance: 2004, interets: ["ordre", "zzz"] } }, t));
  assert.deepEqual(me.profil, { niveau: "bac", serie: "C", annee_naissance: 2004, interets: ["ordre"] });
  assert.equal((await json(await call("POST", "/api/me", { profil: { region: "littoral" } }, t))).profil.niveau, "bac"); // fusion, rien d'effacé
  const o = await json(await call("GET", "/api/orientation?lang=fr", undefined, t));
  assert.equal(o.status, 200);
  const cat = await json(await call("GET", "/api/catalog?lang=fr"));
  assert.equal(o.resultats.length, cat.concours.length);
  assert.ok(o.resultats.every((r) => ["bien", "adapte", "possible", "improbable", "inconnu", "non"].includes(r.categorie)));
  // Rien n'est déclaré « bien adapté » sans source solide : toutes les conditions sont encore à vérifier
  assert.ok(o.resultats.filter((r) => r.categorie === "bien").every((r) => cat.concours.find((c) => c.id === r.id).status === "to_verify"));
  // Un concours sans conditions renseignées reste « inconnu », jamais deviné
  assert.equal(o.resultats.find((r) => r.id === "enam")?.categorie === "bien", false);
  assert.equal((await call("GET", "/api/orientation", undefined, undefined)).status, 401);
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

test("signalement d'erreur, interrupteur par épreuve, corrigé proposé", async () => {
  const t = await register("signal@exemple.cm");
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  assert.equal((await call("POST", "/api/report", { epreuve: "gp-2025-redaction-fr", message: "ok" }, t)).status, 400);
  assert.equal((await call("POST", "/api/report", { epreuve: "inconnue", message: "Une erreur ici" }, t)).status, 404);
  assert.equal((await call("POST", "/api/report", { epreuve: "gp-2025-redaction-fr", kind: "corrige", message: "La question 3 est fausse" }, t)).status, 200);
  assert.equal((await call("GET", "/api/admin/reports", undefined, t)).status, 403);
  const reps = await (await call("GET", "/api/admin/reports", undefined, admin)).json();
  assert.equal(reps.length, 1);
  assert.equal(reps[0].status, "open");
  assert.equal(reps[0].kind, "corrige");
  assert.equal((await call("POST", "/api/admin/report-close", { id: reps[0].id }, admin)).status, 200);
  assert.equal((await (await call("GET", "/api/admin/reports", undefined, admin)).json())[0].status, "closed");

  const full = await json(await call("GET", "/api/epreuves/gp-2025-redaction-fr/corrige", undefined, admin));
  assert.equal(full.corrige_source, "propose");
  assert.equal(full.verifie, "non_verifie");

  assert.equal((await call("POST", "/api/admin/epreuve-switch", { id: "gp-2025-redaction-fr", off: true }, t)).status, 403);
  assert.equal((await call("POST", "/api/admin/epreuve-switch", { id: "gp-2025-redaction-fr", off: true }, admin)).status, 200);
  const cat = await json(await call("GET", "/api/catalog?lang=fr"));
  assert.ok(!cat.epreuves.some((e) => e.id === "gp-2025-redaction-fr"));
  assert.equal((await call("GET", "/api/epreuves/gp-2025-redaction-fr/sujet", undefined, admin)).status, 404);
  assert.equal((await call("GET", "/api/epreuves/gp-2025-redaction-fr/corrige", undefined, admin)).status, 404);
  const all = await (await call("GET", "/api/admin/epreuves", undefined, admin)).json();
  assert.equal(all.find((e) => e.id === "gp-2025-redaction-fr").off, true);
  assert.equal((await call("POST", "/api/admin/epreuve-switch", { id: "gp-2025-redaction-fr", off: false }, admin)).status, 200);
  assert.equal((await call("GET", "/api/epreuves/gp-2025-redaction-fr/sujet", undefined, admin)).status, 200);
});

test("formules annuelle et mensuelle, contact WhatsApp", async () => {
  const cfg = await json(await call("GET", "/api/config"));
  assert.deepEqual(cfg.plans, [
    { id: "annual", price_xaf: 10000, days: 365 },
    { id: "monthly", price_xaf: 1500, days: 30 },
  ]);
  assert.equal(cfg.whatsapp_channel, "https://whatsapp.com/channel/test");
  assert.equal(cfg.whatsapp_contact, "https://wa.me/237699001122");
  const t = await register("mois@exemple.cm", "Awa Mensuel");
  assert.equal((await call("POST", "/api/checkout", { phone: "699001122", plan: "monthly" }, t)).status, 200);
  assert.equal(lastCheckout.product_id, "prd_weldon_m");
  assert.equal(lastCheckout.custom_metadata.plan, "monthly");
  await call("POST", "/api/checkout", { phone: "699001122", plan: "inconnu" }, t);
  assert.equal(lastCheckout.product_id, "prd_weldon"); // formule inconnue : annuelle
  const ok = await json(await call("POST", "/api/verify-sale", { sale_id: "sal_month" }, t));
  assert.equal(ok.paid, true);
  const days = (Date.parse(ok.user.premium_until) - Date.now()) / 864e5;
  assert.ok(days > 29 && days < 31, `accès mensuel de 30 jours, obtenu ${days}`);
});

test("export des données et suppression du compte", async () => {
  const t = await register("partir@exemple.cm", "Awa Partir");
  await call("POST", "/api/me", { profil: { niveau: "bac" } }, t);
  await call("POST", "/api/report", { epreuve: "gp-2025-redaction-fr", message: "Une erreur ici" }, t);
  const exp = await (await call("GET", "/api/me/export", undefined, t)).json();
  assert.equal(exp.compte.email, "partir@exemple.cm");
  assert.equal(exp.compte.profil.niveau, "bac");
  assert.equal(exp.signalements.length, 1);
  assert.ok(!("pw" in exp.compte) && !JSON.stringify(exp).includes("scrypt"));
  assert.equal((await call("POST", "/api/account/delete", { password: "mauvais!!" }, t)).status, 401);
  assert.equal((await call("POST", "/api/account/delete", { password: "motdepasse1" }, t)).status, 200);
  assert.equal((await call("GET", "/api/me", undefined, t)).status, 401); // le compte n'existe plus
  assert.equal((await call("POST", "/api/login", { email: "partir@exemple.cm", password: "motdepasse1" })).status, 401);
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  const reps = await (await call("GET", "/api/admin/reports", undefined, admin)).json();
  assert.ok(!reps.some((r) => r.email === "partir@exemple.cm"));
  assert.ok(await register("partir@exemple.cm", "Nouveau")); // l'adresse est de nouveau libre
});

test("suivi de concours : 2 gratuits, illimité pour les abonnés", async () => {
  const t = await register("suiveur@exemple.cm");
  const cat = await json(await call("GET", "/api/catalog?lang=fr"));
  const [a, b, c] = cat.concours.map((x) => x.id);
  assert.deepEqual((await json(await call("POST", "/api/follow", { id: a }, t))).suivis, [a]);
  assert.deepEqual((await json(await call("POST", "/api/follow", { id: a }, t))).suivis, [a]); // idempotent
  assert.deepEqual((await json(await call("POST", "/api/follow", { id: b }, t))).suivis, [a, b]);
  const third = await json(await call("POST", "/api/follow", { id: c }, t));
  assert.equal(third.status, 402);
  assert.equal(third.code, "follow_limit");
  assert.deepEqual((await json(await call("POST", "/api/follow", { id: a, on: false }, t))).suivis, [b]);
  assert.equal((await call("POST", "/api/follow", { id: "inconnu" }, t)).status, 404);
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  for (const x of cat.concours.slice(0, 5)) assert.equal((await call("POST", "/api/follow", { id: x.id }, admin)).status, 200);
  assert.equal((await json(await call("GET", "/api/me", undefined, admin))).suivis.length, 5);
});

test("calendrier : les mois lus dans les périodes sont dans le catalogue", async () => {
  const cat = await json(await call("GET", "/api/catalog?lang=fr"));
  const withMonths = cat.concours.filter((c) => c.calendrier?.mois);
  assert.ok(withMonths.length >= 10);
  for (const c of withMonths) {
    for (const k of ["lancement", "depot", "epreuves"]) assert.ok(c.calendrier.mois[k].every((m) => m >= 1 && m <= 12));
  }
});

test("annonces : brouillons, publication, veille automatique", async () => {
  const t = await register("lecteur@exemple.cm");
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  assert.equal((await call("POST", "/api/admin/annonce", { titre: "Ouverture du concours" }, t)).status, 403);
  assert.equal((await call("POST", "/api/admin/annonce", { titre: "abc" }, admin)).status, 400);
  const draft = await (await call("POST", "/api/admin/annonce", { titre: "Ouverture du concours des gardiens de la paix", concours: "gardiens-paix", kind: "lancement", date: "2026-12-31", lien: "https://exemple.cm/a", message: "Dépôt jusqu'au 31 décembre." }, admin)).json();
  assert.equal(draft.status, "draft");
  assert.equal((await (await call("GET", "/api/annonces")).json()).length, 0); // un brouillon n'est pas public
  const pub = await (await call("POST", "/api/admin/annonce", { ...draft, publish: true }, admin)).json();
  assert.equal(pub.id, draft.id);
  assert.equal(pub.status, "published");
  const list = await (await call("GET", "/api/annonces")).json();
  assert.equal(list.length, 1);
  assert.equal(list[0].concours, "gardiens-paix");
  assert.equal(list[0].date, "2026-12-31");
  // mauvaises valeurs nettoyées
  const odd = await (await call("POST", "/api/admin/annonce", { titre: "Annonce aux valeurs douteuses", concours: "inconnu", kind: "zzz", date: "31/12/2026", lien: "javascript:alert(1)" }, admin)).json();
  assert.deepEqual([odd.concours, odd.kind, odd.date, odd.lien], [null, "info", null, null]);

  // Veille : jeton obligatoire, doublons ignorés, rejet définitif
  assert.equal((await call("POST", "/api/veille/draft", { items: [] })).status, 401);
  assert.equal((await call("POST", "/api/veille/draft", { items: [] }, undefined, { Authorization: "Bearer mauvais" })).status, 401);
  const auth = { Authorization: "Bearer jeton-de-veille-de-test" };
  const items = [{ source: "MINESUP", titre: "Concours d'entrée à l'IUS et à l'INUBIL", url: "https://www.minesup.gov.cm/2026/09/29/concours-ius/" }, { source: "X", titre: "x", url: "ftp://nope" }];
  assert.equal((await json(await call("POST", "/api/veille/draft", { items }, undefined, auth))).created, 1);
  assert.equal((await json(await call("POST", "/api/veille/draft", { items }, undefined, auth))).created, 0);
  const all = await (await call("GET", "/api/admin/annonces", undefined, admin)).json();
  const v = all.find((a) => a.source === "MINESUP");
  assert.equal(v.status, "draft");
  assert.equal((await (await call("GET", "/api/annonces")).json()).length, 1); // toujours invisible
  assert.equal((await call("POST", "/api/admin/annonce-reject", { id: v.id }, admin)).status, 200);
  assert.equal((await json(await call("POST", "/api/veille/draft", { items }, undefined, auth))).created, 0); // ne revient pas
  assert.ok(!(await (await call("GET", "/api/admin/annonces", undefined, admin)).json()).some((a) => a.id === v.id));
});

test("quiz du jour, carnet d'erreurs et révisions espacées", async () => {
  const t = await register("quizeur@exemple.cm", "Awa Quiz");
  await call("POST", "/api/me", { lang: "fr" }, t);
  const d = await json(await call("GET", "/api/quiz/daily", undefined, t));
  assert.equal(d.status, 200);
  assert.equal(d.questions.length, 5);
  assert.equal(d.done, false);
  assert.ok(d.questions.every((q) => q.options.length === 4 && !("answer" in q) && !("explication" in q)));
  assert.doesNotMatch(JSON.stringify(d), /"answer"/); // aucune réponse ne sort avant la correction
  const again = await json(await call("GET", "/api/quiz/daily", undefined, t));
  assert.deepEqual(again.questions.map((q) => q.id), d.questions.map((q) => q.id)); // même quiz toute la journée

  // Droits : un élève gratuit ne peut corriger que le quiz du jour et son carnet
  const other = (await json(await call("GET", "/api/quiz/series?theme=maths", undefined, t))).status;
  assert.equal(other, 402);
  const stranger = "maths-01";
  const notToday = d.questions.some((q) => q.id === stranger) ? "maths-02" : stranger;
  assert.equal((await call("POST", "/api/quiz/check", { mode: "daily", answers: [{ id: notToday, choice: 0 }] }, t)).status, 403);
  assert.equal((await call("POST", "/api/quiz/check", { mode: "revision", answers: [{ id: notToday, choice: 0 }] }, t)).status, 403);
  assert.equal((await call("POST", "/api/quiz/check", { mode: "series", answers: [{ id: notToday, choice: 0 }] }, t)).status, 402);
  assert.equal((await call("POST", "/api/quiz/check", { mode: "blanc", answers: [] }, t)).status, 402);
  assert.equal((await call("POST", "/api/quiz/check", { mode: "zzz", answers: [] }, t)).status, 400);
  assert.equal((await call("POST", "/api/quiz/check", { mode: "daily", answers: [{ id: d.questions[0].id, choice: 7 }] }, t)).status, 400);

  // Première question : on se trompe exprès (la bonne réponse est révélée par la correction)
  const first = d.questions[0];
  const probe = await json(await call("POST", "/api/quiz/check", { mode: "daily", answers: [{ id: first.id, choice: 0 }] }, t));
  const r0 = probe.results[0];
  assert.equal(r0.ok, r0.answer === 0);
  assert.ok(r0.explication.length > 5);
  // Rejouer la même question ne compte pas deux fois
  const replay = await json(await call("POST", "/api/quiz/check", { mode: "daily", answers: [{ id: first.id, choice: (r0.answer + 1) % 4 }] }, t));
  assert.equal(replay.results[0].ok, r0.ok);
  assert.equal(replay.results[0].choice, 0);
  // Les quatre autres : toutes fausses
  const rest = [];
  for (const q of d.questions.slice(1)) {
    const peek = await json(await call("POST", "/api/quiz/check", { mode: "daily", answers: [{ id: q.id, choice: 0 }] }, t));
    rest.push(peek.results[0]);
  }
  const done = await json(await call("GET", "/api/quiz/daily", undefined, t));
  assert.equal(done.done, true);
  assert.equal(done.score, [r0, ...rest].filter((r) => r.ok).length);
  assert.ok(Object.values(done.results).every((r) => typeof r.answer === "number"));
  const st = await json(await call("GET", "/api/quiz/stats", undefined, t));
  assert.equal(st.daily_done, true);
  assert.equal(st.streak, 1);
  const wrongCount = [r0, ...rest].filter((r) => !r.ok).length;
  assert.equal(st.carnet, wrongCount);
  assert.equal(st.due, 0); // une erreur revient le lendemain
  assert.equal(Object.values(st.themes).reduce((n, x) => n + x.ok + x.ko, 0), 5);

  // Le lendemain : on simule l'échéance
  const u = await mod.store.getUser("quizeur@exemple.cm");
  const wrongId = Object.keys(u.quiz.carnet)[0];
  if (wrongId) {
    u.quiz.carnet[wrongId].due = "2000-01-01";
    await mod.store.saveUser(u);
    const rev = await json(await call("GET", "/api/quiz/revision", undefined, t));
    assert.equal(rev.due, 1);
    assert.equal(rev.questions[0].id, wrongId);
    const sol = (await json(await call("POST", "/api/quiz/check", { mode: "revision", answers: [{ id: wrongId, choice: 0 }] }, t))).results[0];
    const good = await json(await call("POST", "/api/quiz/check", { mode: "revision", answers: [{ id: wrongId, choice: sol.answer }] }, t));
    assert.equal(good.results[0].ok, true);
    const after = await mod.store.getUser("quizeur@exemple.cm");
    assert.ok(after.quiz.carnet[wrongId].box >= 1 || !after.quiz.carnet[wrongId]); // espacé ou maîtrisé
  }
});

test("séries et concours blanc pour les abonnés, signalement d'une question", async () => {
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  await call("POST", "/api/me", { lang: "fr" }, admin);
  const s = await json(await call("GET", "/api/quiz/series?theme=maths&n=20", undefined, admin));
  assert.equal(s.status, 200);
  assert.equal(s.questions.length, 20);
  assert.ok(s.questions.every((q) => q.theme === "maths"));
  assert.equal((await call("GET", "/api/quiz/series?theme=inconnu&n=10", undefined, admin)).status, 200); // thème inconnu : tous les thèmes
  const b = await json(await call("GET", "/api/quiz/blanc", undefined, admin));
  assert.equal(b.questions.length, 40);
  assert.equal(b.duree, 40);
  assert.ok(new Set(b.questions.map((q) => q.theme)).size >= 8);
  const res = await json(await call("POST", "/api/quiz/check", { mode: "blanc", answers: b.questions.slice(0, 10).map((q) => ({ id: q.id, choice: 1 })) }, admin));
  assert.equal(res.results.length, 10);
  assert.ok(res.results.every((r) => "answer" in r && "explication" in r));
  // En anglais, les questions sont dans l'autre langue
  const en = await json(await call("GET", "/api/quiz/series?theme=langue2&n=10&lang=en", undefined, admin));
  assert.ok(en.questions.length > 0);
  // Signalement d'une question
  assert.equal((await call("POST", "/api/report", { epreuve: "quiz:maths-01", message: "La réponse me semble fausse" }, admin)).status, 200);
  assert.equal((await call("POST", "/api/report", { epreuve: "quiz:inconnue-99", message: "La réponse me semble fausse" }, admin)).status, 404);
});

test("plan à rebours : création, aperçu gratuit d'une semaine, plan complet pour les abonnés", async () => {
  const t = await register("planneur@exemple.cm", "Awa Plan");
  await call("POST", "/api/me", { lang: "fr" }, t);
  assert.equal((await json(await call("GET", "/api/plan", undefined, t))).plan, null);
  const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  assert.equal((await call("POST", "/api/plan", { concours: "emia", date: inDays(100), hours: 4 }, t)).status, 400); // heures inconnues
  assert.equal((await call("POST", "/api/plan", { concours: "emia", date: inDays(-3), hours: 5 }, t)).status, 400); // date passée
  assert.equal((await call("POST", "/api/plan", { concours: "emia", date: inDays(900), hours: 5 }, t)).status, 400); // trop loin
  assert.equal((await call("POST", "/api/plan", { concours: "nexiste-pas", date: inDays(100), hours: 5 }, t)).status, 404);
  const made = await json(await call("POST", "/api/plan", { concours: "emia", date: inDays(100), hours: 5 }, t));
  assert.equal(made.status, 200);
  assert.equal(made.built.weeks.length, 15);
  assert.equal(made.built.mode, "normal");
  assert.ok(made.built.weeks[0].sessions.length >= 10);
  assert.ok(made.built.weeks.slice(1).every((w) => w.locked && w.sessions.length === 0)); // gratuit : première semaine seulement
  const admin = (await json(await call("POST", "/api/login", { email: "concepteur@weldon.cm", password: "motdepasse1" }))).token;
  await call("POST", "/api/plan", { concours: "emia", date: inDays(100), hours: 8 }, admin);
  const full = await json(await call("GET", "/api/plan", undefined, admin));
  assert.ok(full.built.weeks.every((w) => !w.locked && w.sessions.length > 0));
  assert.ok(full.built.weeks.flatMap((w) => w.sessions).some((s) => s.kind === "quiz_theme"));
  assert.equal((await json(await call("POST", "/api/plan", { clear: true }, t))).plan, null);
  assert.equal((await json(await call("GET", "/api/plan", undefined, t))).plan, null);
});
