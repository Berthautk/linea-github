// Fusionne les résultats de vérification (out-NN.json ou resultat-NN.json) dans content/bourses*.json.
// Usage : node tools/ingest/merge-verification.mjs <dossier des résultats>
import fs from "node:fs";
import { checkBourse } from "../../server/bourses.js";
const V = process.argv[2].replace(/\/?$/, "/");
const C = new URL("../../content/", import.meta.url).pathname;
const today = new Date().toISOString().slice(0, 10);
const files = { cur: JSON.parse(fs.readFileSync(C + "bourses.json", "utf8")), guide: JSON.parse(fs.readFileSync(C + "bourses-guide.json", "utf8")) };
const done = JSON.parse(fs.existsSync(V + "done.json") ? fs.readFileSync(V + "done.json", "utf8") : "[]");
const find = (id) => { for (const k of Object.keys(files)) { const b = files[k].find((x) => x.id === id); if (b) return [k, b]; } return [null, null]; };
const stats = { verifiee: 0, non: 0, supprimee: 0, rejetee: 0, absente: 0 };
const log = [];
const TXT = ["nom", "resume", "valeur", "couverture_detail", "ne_couvre_pas", "eligibilite", "diplome", "langue", "conseil", "edition_note"];
const best = (eds) => { const f = (eds || []).filter((e) => e && (e.cloture || e.ouverture)); const up = f.filter((e) => (e.cloture || e.ouverture) >= today).sort((a, b) => (a.cloture || a.ouverture).localeCompare(b.cloture || b.ouverture)); return up[0] || f.sort((a, b) => (b.cloture || b.ouverture).localeCompare(a.cloture || a.ouverture))[0] || null; };
const outs = fs.readdirSync(V).filter((f) => /^(out|resultat)-\d+\.json$/.test(f)).sort();
for (const f of outs) {
  let arr; try { arr = JSON.parse(fs.readFileSync(V + f, "utf8")); } catch (e) { log.push(`ILLISIBLE ${f}`); continue; }
  for (const o of arr) {
    const [k, b] = find(o.id);
    if (!b) { stats.absente++; continue; }
    done.includes(o.id) || done.push(o.id);
    if (o.supprimer) { files[k] = files[k].filter((x) => x.id !== o.id); stats.supprimee++; log.push(`supprimée ${o.id} : ${o.motif_non_verifiee || ""}`); continue; }
    if (!o.verifiee) { b.verification_echec = { date: today, motif: o.motif_non_verifiee || "page officielle non lisible" }; stats.non++; continue; }
    // contrôle de complétude : sinon la bourse reste non vérifiée
    const miss = [];
    if (!o.lien_officiel || !/^https?:\/\//.test(o.lien_officiel)) miss.push("lien");
    if (!o.fr?.eligibilite || !o.en?.eligibilite) miss.push("éligibilité FR/EN");
    if (!(o.fr?.dossier || []).length || !(o.en?.dossier || []).length) miss.push("dossier FR/EN");
    if (!o.en?.nom || !o.en?.resume) miss.push("anglais");
    if (!(o.niveaux || []).length) miss.push("niveaux");
    if (!(o.verification?.pages_lues || []).length) miss.push("pages lues");
    if (!(o.editions || []).length && !o.fr?.edition_note) miss.push("dates");
    if (miss.length) { b.verification_echec = { date: today, motif: "incomplète : " + miss.join(", ") }; stats.rejetee++; log.push(`rejetée ${o.id} : ${miss.join(", ")}`); continue; }
    const ed = best(o.editions);
    const next = {
      ...b,
      organisme: o.organisme || b.organisme, pays_accueil: o.pays_accueil?.length ? o.pays_accueil : b.pays_accueil,
      cameroun: o.cameroun === "oui" ? "oui" : "non_precise", niveaux: o.niveaux, domaines: o.domaines?.length ? o.domaines : b.domaines,
      couverture_niveau: o.couverture_niveau || b.couverture_niveau, origine: o.origine || b.origine,
      ...(o.age_max != null ? { age_max: o.age_max } : {}),
      ...(o.cycle?.type ? { cycle: o.cycle } : {}),
      edition: ed ? { libelle: ed.libelle || undefined, ...(ed.ouverture ? { ouverture: ed.ouverture } : {}), ...(ed.cloture ? { cloture: ed.cloture } : {}), confirme: Boolean(ed.confirme) } : (b.edition || {}),
      editions: (o.editions || []).filter((e) => e.annee),
      lien_officiel: o.lien_officiel, sources: o.sources?.length ? o.sources : b.sources,
      last_verified: today, status: "verified", verification: o.verification,
      fr: { ...b.fr, ...Object.fromEntries(TXT.map((t) => [t, o.fr[t]]).filter(([, v]) => v)), autres: o.fr.autres || [], dossier: o.fr.dossier || [], etapes: o.fr.etapes || [] },
      en: { ...Object.fromEntries(TXT.map((t) => [t, o.en[t]]).filter(([, v]) => v)), autres: o.en.autres || [], dossier: o.en.dossier || [], etapes: o.en.etapes || [] },
    };
    // « langue_acces » n'est posé que par le concepteur : enseigner en anglais ne réserve pas une bourse aux anglophones.
    delete next.langue_acces;
    delete next.verification_echec; delete next.guide; // les notes du guide ne sont plus la source
    if (next.edition.ouverture && next.edition.cloture && next.edition.ouverture > next.edition.cloture) delete next.edition.ouverture;
    try { checkBourse(next); } catch (e) { b.verification_echec = { date: today, motif: "format : " + e.message }; stats.rejetee++; log.push("format " + o.id + " " + e.message); continue; }
    Object.assign(b, next); for (const key of Object.keys(b)) if (!(key in next)) delete b[key];
    stats.verifiee++;
  }
}
fs.writeFileSync(C + "bourses.json", JSON.stringify(files.cur, null, 2) + "\n");
fs.writeFileSync(C + "bourses-guide.json", JSON.stringify(files.guide, null, 1) + "\n");
fs.writeFileSync(V + "done.json", JSON.stringify(done));
console.log(stats); console.log(log.join("\n"));
