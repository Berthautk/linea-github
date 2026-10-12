// Veille semi-automatique des concours (gratuite, sans IA) : lit chaque jour une liste de sources officielles,
// repère par mots-clés les liens qui ressemblent à une annonce et les envoie à Weldon comme BROUILLONS.
// Rien n'est publié sans validation du concepteur dans son espace.
//
// Variables : WELDON_URL (ex. https://weldon-cm.netlify.app) et VEILLE_TOKEN (même valeur que sur le serveur).
// Usage : node tools/veille/veille.mjs [--dry]   (--dry : affiche sans envoyer)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractCandidates, robotsAllows } from "./extract.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry");
const BASE = (process.env.WELDON_URL || "").replace(/\/$/, "");
const TOKEN = process.env.VEILLE_TOKEN || "";
if (!DRY && (!BASE || !TOKEN)) {
  console.log("WELDON_URL ou VEILLE_TOKEN absent : veille non lancée (ajoutez-les dans les secrets du dépôt).");
  process.exit(0);
}
const UA = `WeldonVeille/1.0 (+${BASE || "https://weldon-cm.netlify.app"})`;
const { sources } = JSON.parse(fs.readFileSync(path.join(here, "sources.json"), "utf8"));

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { text: await res.text(), url: res.url };
}

const items = [];
for (const s of sources) {
  try {
    const u = new URL(s.url);
    const robots = await get(`${u.origin}/robots.txt`).then((r) => r.text, () => "");
    if (!robotsAllows(robots, u.pathname)) {
      console.log(`– ${s.nom} : interdit par robots.txt, ignoré`);
      continue;
    }
    const page = await get(s.url);
    const found = extractCandidates(page.text, page.url, { max: 10 });
    console.log(`✓ ${s.nom} : ${found.length} annonce(s) possible(s)`);
    for (const f of found) items.push({ source: s.nom, titre: f.titre, url: f.url });
  } catch (e) {
    console.log(`✗ ${s.nom} : ${e.message}`);
  }
}

if (DRY) {
  for (const i of items) console.log(`  [${i.source}] ${i.titre}\n    ${i.url}`);
  process.exit(0);
}
// Envoi par paquets de 40 ; le serveur ignore les liens déjà vus.
let created = 0;
for (let i = 0; i < items.length; i += 40) {
  const res = await fetch(`${BASE}/api/veille/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ items: items.slice(i, i + 40) }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Envoi refusé (${res.status}) : ${body.error || ""}`);
    process.exit(1);
  }
  created += body.created || 0;
}
console.log(`${created} nouveau(x) brouillon(s) créé(s) sur ${items.length} lien(s) repéré(s).`);
