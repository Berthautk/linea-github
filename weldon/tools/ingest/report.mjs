// Rapport d'ingestion : ce qui est publié, ce qui manque, ce qui reste à vérifier.
// Usage : node tools/ingest/report.mjs [identifiant-de-concours]
// À lancer après chaque recueil ajouté à content/epreuves.json : le concepteur valide un échantillon, puis publie.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "../../server/content.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const only = process.argv[2] || null;
const content = loadContent(path.join(root, "content")); // refuse tout sujet officiel sans source, droit d'usage ou corrigé cohérent
const concours = JSON.parse(fs.readFileSync(path.join(root, "content", "concours.json"), "utf8"));
const epreuves = JSON.parse(fs.readFileSync(path.join(root, "content", "epreuves.json"), "utf8")).map((e) => content.epreuve(e.id));
const ordre = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "ordre.json"), "utf8"));

const official = epreuves.filter((e) => !e.exemple);
console.log(`Épreuves : ${epreuves.length} au total, ${official.length} officielles, ${epreuves.length - official.length} d'entraînement Weldon.\n`);

for (const g of ordre.groupes) {
  console.log(`Groupe ${g.n} : ${g.titre}`);
  for (const id of g.concours) {
    const c = concours.find((x) => x.id === id || x.id.startsWith(id));
    if (!c || (only && c.id !== only && !c.id.startsWith(only))) continue;
    const mine = official.filter((e) => e.concours === c.id);
    const per = c.periodicite;
    const pause = per?.type === "pluriannuelle" && per.prochaine_probable ? ` · prochaine session probable ${per.prochaine_probable}` : "";
    const years = [...new Set(mine.map((e) => e.annee))].sort().join(", ") || "aucune";
    const doubt = mine.reduce((n, e) => n + (e.a_verifier?.length || 0), 0);
    const noCorr = mine.filter((e) => e.corrige_source === "propose" && e.verifie === "non_verifie").length;
    console.log(`  ${mine.length ? "✓" : "·"} ${c.sigle.padEnd(8)} ${String(mine.length).padStart(2)} épreuve(s) officielle(s) · sessions : ${years}${pause}`);
    if (mine.length) console.log(`      passages à vérifier : ${doubt} · corrigés proposés non vérifiés : ${noCorr}`);
  }
  console.log();
}
const orphans = official.filter((e) => !concours.some((c) => c.id === e.concours));
if (orphans.length) console.log("Épreuves sans concours :", orphans.map((e) => e.id).join(", "));
