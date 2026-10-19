// Convertit les guides de bourses du concepteur (texte extrait des .docx) en content/bourses-guide.json.
// Usage : node tools/ingest/bourses-guide.mjs <dossier des .txt> [fichier de sortie]
// Rien n'est inventé : un champ absent du guide reste absent. Tout est « to_verify » : les dates des guides sont celles
// de leur édition (2025-2026) et passent « expirées » d'elles-mêmes ; le concepteur les met à jour dans l'espace concepteur.
import fs from "node:fs";
import path from "node:path";
import { parseMois } from "../../server/calendar.js";

const dir = process.argv[2];
const out = process.argv[3] || new URL("../../content/bourses-guide.json", import.meta.url).pathname;
if (!dir) throw new Error("dossier des .txt manquant");

const lines = (f) => fs.readFileSync(path.join(dir, f), "utf8").split("\n").map((s) => s.trim());
const raws = [];

// Format A (« guide ultime ») : « Bourse n°N », le nom, puis « Clé : valeur ».
function parseA(file) {
  const L = lines(file);
  let part = null, pays = null, cur = null;
  const flush = () => { if (cur) raws.push(cur); cur = null; };
  const PAYS_PART = { II: "Canada", III: "Australie", IV: "Royaume-Uni", V: "États-Unis", VI: "Allemagne", VII: "Nouvelle-Zélande", VIII: "Pays-Bas" };
  const SEC = { "🇵🇹": "Portugal", "🇫🇷": "France", "🇪🇸": "Espagne", "🇮🇹": "Italie", "🇪🇺": "Europe (plusieurs pays)" };
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    const pm = l.match(/^PARTIE ([IVX]+)$/);
    if (pm) { flush(); part = pm[1]; pays = PAYS_PART[part] || null; continue; }
    const sm = l.match(/^(🇵🇹|🇫🇷|🇪🇸|🇮🇹|🇪🇺) .*: \d+ BOURSES?/);
    if (sm && part === "IX") { flush(); pays = SEC[sm[1]]; continue; }
    if (/^Bourse n°\d+$/.test(l)) {
      flush();
      let j = i + 1; while (!L[j]) j++;
      cur = { nom: L[j], pays, raw: {}, desc: [], src: "guide" };
      i = j; continue;
    }
    if (!cur) continue;
    if (/^(PARTIE|ANNEXE|Tableau récapitulatif|Points forts)/.test(l)) { flush(); continue; }
    const m = l.match(/^(Université|Organisme|Valeur|Niveau d'études|Éligibilité|Domaine d'études|Date limite|Lien officiel)\s*:\s*(.*)$/);
    if (m) cur.raw[m[1]] = m[2]; else if (l.length > 80) cur.desc.push(l);
  }
  flush();
}

// Format B (« manuel ») : tableau Paramètre / Détails, une étiquette puis sa valeur sur deux lignes.
const LABELS = ["Nom complet", "Université / Organisme", "Pays", "Valeur financière", "Couverture", "Ne couvre pas", "Niveau d'études", "Filières éligibles", "Éligibilité", "Coût de candidature", "Date limite", "Lien officiel"];
function parseB(file) {
  const L = lines(file);
  let cur = null;
  const flush = () => { if (cur) raws.push(cur); cur = null; };
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    const m = l.match(/^Bourse n°\d+\s*:\s*(.+)$/);
    if (m) { flush(); cur = { nom: m[1], pays: null, raw: {}, desc: [], src: "manuel" }; continue; }
    if (!cur) continue;
    if (/^(PARTIE|CHAPITRE|Chapitre|ANNEXE)\b/.test(l)) { flush(); continue; }
    if (LABELS.includes(l)) {
      let j = i + 1; while (j < L.length && !L[j]) j++;
      if (j < L.length && !LABELS.includes(L[j])) { cur.raw[l] = L[j]; i = j; }
      continue;
    }
    const d = l.match(/^(Description|Conseil stratégique)\s*:\s*(.*)$/);
    if (d) cur.raw[d[1]] = d[2];
  }
  flush();
}

const files = fs.readdirSync(dir);
for (const f of files.filter((f) => /GUIDE_ULTIME_DES_BOURSES_D\.txt$/.test(f))) parseA(f);
for (const f of files.filter((f) => /MANUEL/.test(f)).sort()) parseB(f);

// ---------- Normalisation ----------
const strip = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slug = (s) => strip(s).replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
const noFlag = (s) => String(s || "").replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "").replace(/🔗/g, "").trim();
const url = (s) => (noFlag(s).match(/https?:\/\/[^\s)>\]]+/) || [null])[0]?.replace(/[.,;]+$/, "") || null;
const urlKey = (u) => (u ? u.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase() : null);

// « Italie (Piémont — Turin, Novara) » → Italie ; plusieurs pays séparés par « / » ou « et » hors parenthèses.
const BASES = ["Canada", "Australie", "Royaume-Uni", "États-Unis", "Allemagne", "Nouvelle-Zélande", "Pays-Bas", "France", "Portugal", "Espagne", "Italie", "Belgique", "Suisse", "Japon", "Malaisie", "Inde"];
function paysOf(t) {
  const s = noFlag(t).replace(/\([^)]*\)/g, "");
  const out = new Set();
  for (const part of s.split(/\s*[\/;]\s*|\s+et\s+/).map(clean).filter(Boolean)) {
    const hit = BASES.find((b) => strip(part).startsWith(strip(b)));
    if (hit) out.add(hit);
    else if (/^usa$|etats-unis/.test(strip(part))) out.add("États-Unis");
    else if (/multi|plusieurs|monde entier|programme phare|commonwealth/.test(strip(part))) out.add("Plusieurs pays");
  }
  return [...out];
}

function niveaux(t) {
  const s = strip(t);
  const out = new Set();
  if (/licence|bachelor|undergrad|premier cycle|lycee|secondaire|terminale/.test(s)) out.add("licence");
  if (/master|mba|maitrise|msc|\bma\b|postgrad|graduate|deuxieme cycle|llm/.test(s) && !/^undergrad/.test(s)) out.add("master");
  if (/phd|doctor|dphil|troisieme cycle/.test(s)) out.add("doctorat");
  if (/post-?doc/.test(s)) out.add("postdoc");
  if (/tous (les )?niveaux|all levels/.test(s)) ["licence", "master", "doctorat"].forEach((n) => out.add(n));
  return out.size ? [...out] : ["autre"];
}

const DOM = [
  ["maths", /math|statist|actuar/],
  ["informatique", /informatique|computer|data|intelligence artificielle|\bia\b|numerique|cyber|logiciel|software/],
  ["physique-chimie", /physi|chim|sciences? naturelles|biolog|geolog|astro|materiaux|natural sciences/],
  ["sante", /sante|health|medec|medic|pharma|infirm|nurs|dentaire|epidemi|sciences? de la vie|life sciences/],
  ["ingenierie", /ingenier|engineer|\bgenie\b|stem|technolog|architectur|energie|energy/],
  ["agronomie-environnement", /agri|agro|environnement|environment|climat|climate|foret|forest|durable|sustainab|ocean|marin|eau\b|water|ecolog/],
  ["droit-politique", /droit|\blaw\b|legal|politi|relations internationales|international relations|gouvernance|governance|administration publique|public (policy|administration)|diplomat|securite|paix|peace|human rights|droits? humains/],
  ["histoire-geographie", /histoire|history|geograph|archeolog|patrimoine|heritage|etudes? africaines|area studies/],
  ["lettres-langues", /lettres|langue|language|linguist|litterat|literature|arts?\b|culture|traduction|translation|humanit|musique|music|cinema|theatre|design/],
  ["philo-sociologie", /philo|sociolog|anthropolog|psycholog|sciences? sociales?|social sciences|social work|travail social|gender|genre|theolog/],
  ["communication", /communic|journalis|media|medias/],
  ["education", /education|pedagog|enseign|teaching/],
  ["economie-gestion", /econom|gestion|business|management|finance|commerce|marketing|developpement|development|entrepreneur|comptab|accounting|mba|public policy/],
];
function domaines(t) {
  const s = strip(t);
  if (!s || /tous (les )?domaines|toutes (les )?(disciplines|filieres|matieres)|all (fields|subjects|disciplines)|tous domaines|any field/.test(s)) return ["tous"];
  const out = DOM.filter(([, re]) => re.test(s)).map(([k]) => k);
  if (/stem/.test(s)) for (const k of ["maths", "informatique", "physique-chimie", "ingenierie"]) if (!out.includes(k)) out.push(k);
  return out.length ? out : ["tous"];
}

function couverture(valeur, couv) {
  const s = strip(`${valeur} ${couv || ""}`);
  const tuition = /scolarite|tuition|frais d.etudes/.test(s);
  const life = /allocation|stipend|logement|housing|vie\b|living|billet|airfare|assurance|insurance|salaire/.test(s);
  if (/couverture totale|entierement finance|fully.?funded|full funding|bourse complete|tout inclus|tous les frais|full scholarship|100 ?%/.test(s) || (tuition && life)) return "complete";
  if (/jusqu.a|up to|partiel|partial|reduction|exoneration|waiver|\d/.test(s)) return "partielle";
  return "variable";
}

function origine(nom, org) {
  const s = strip(`${nom} ${org}`);
  if (/gouvernement|government|ministere|ministry|campus france|daad|chevening|fulbright|australia awards|commonwealth|manaaki|nuffic|holland|erasmus|eiffel|study in canada|vanier|research training program|\bcsc\b|stipendium|bourse du gouvernement|destination australia|francophonie|\bpbeee\b|\bbcdi\b/.test(s)) return "gouvernementale";
  if (/universit|college|ecole|school|institute|polytechni|campus|\bmit\b|\bubc\b|\banu\b|eth |epfl|sciences po|hec\b|insead|\bfct\b/.test(s)) return /foundation|fondation|stiftung/.test(s) && !/universit|college|school/.test(s) ? "fondation" : "universitaire";
  return "fondation";
}

const MN = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
const MEN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function monthIdx(w) { const i = MN.indexOf(w); return i >= 0 ? i : MEN.indexOf(w); }
function dates(text) {
  const s = strip(text);
  const found = [];
  for (const m of s.matchAll(/(\d{1,2})(?:er)?\s+([a-z]+)\s+(20\d\d)/g)) { const k = monthIdx(m[2]); if (k >= 0) found.push(`${m[3]}-${String(k + 1).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`); }
  for (const m of s.matchAll(/([a-z]+)\s+(20\d\d)/g)) {
    const k = monthIdx(m[1]); if (k < 0) continue;
    const last = new Date(Date.UTC(+m[2], k + 1, 0)).getUTCDate();
    const d = `${m[2]}-${String(k + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
    if (!found.some((x) => x.startsWith(d.slice(0, 7)))) found.push(d);
  }
  return found.filter((d) => !Number.isNaN(Date.parse(d))).sort();
}

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const cut = (s, n) => { s = clean(s); return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n)) + "…"; };

// Déjà présentes, et vérifiées à la main, dans content/bourses.json : on garde cette version.
const DEJA = new Set(["commonwealth-master-s-scholarships", "fulbright-foreign-student-program", "france-excellence-eiffel-scholarship-paris-saclay-university", "france-excellence-eiffel", "mastercard-foundation-scholars-program", "fondation-aga-khan-international-scholarship-programme-isp", "banque-mondiale-jj-wbgsp", "gates-cambridge-scholarship-2026", "gates-cambridge-scholarship-university-of-cambridge-additional-details", "gates-cambridge-scholarships", "nl-scholarship-anciennement-holland-scholarship", "japan-africa-dream-scholarship-bad-jads", "ares-bourses-de-la-cooperation-belge-belgique-francophone", "heinrich-boll-foundation-scholarships-fully-funded", "heinrich-boll-foundation", "konrad-adenauer-stiftung-kas", "erasmus-mundus-joint-masters-emjm"]);
// « À la une » : les programmes les plus recherchés par les étudiants africains.
const UNE = /chevening|fulbright|daad|eiffel|australia-awards|erasmus|mastercard|commonwealth|gates|knight|vanier|pearson|manaaki|nl-scholarship|aga-khan|wbgsp|jads|clarendon|rotary|chinese-government|turkiye|stipendium|mext|trudeau|mo-ibrahim|francophonie|pbeee|boutmy/;

const items = [];
for (const r of raws) {
  const R = r.raw;
  const nom = clean(r.src === "manuel" ? R["Nom complet"] && !/^bourse /i.test(r.nom) ? r.nom : r.nom : r.nom).replace(/\s*\([^)]*\)\s*$/, (m) => m);
  const lien = url(R["Lien officiel"]);
  const org = clean(R["Université"] || R["Organisme"] || R["Université / Organisme"]);
  const pays = r.pays ? [r.pays] : paysOf(R["Pays"]);
  const valeur = clean(R["Valeur"] || R["Valeur financière"]);
  const dl = clean(R["Date limite"]);
  const perm = /permanen|en continu|toute l.annee|rolling|automatiquement/.test(strip(dl));
  const ds = dates(dl);
  const last = ds[ds.length - 1] || null;
  const lastMois = last ? parseMois(MN[+last.slice(5, 7) - 1]) : parseMois(dl).slice(-1);
  const desc = r.src === "manuel" ? clean(R["Description"]) : clean(r.desc[0]);
  const item = {
    id: slug(nom),
    organisme: org || null,
    pays_accueil: pays.length ? pays : ["Plusieurs pays"],
    cameroun: "non_precise",
    niveaux: niveaux(R["Niveau d'études"]),
    domaines: domaines(R["Filières éligibles"] || R["Domaine d'études"]),
    couverture_niveau: couverture(valeur, R["Couverture"]),
    origine: origine(nom, org),
    cycle: lastMois.length ? { type: "annuelle", cloture_mois: MN[lastMois[0] - 1] } : undefined,
    edition: perm ? { permanente: true, confirme: false } : last ? { cloture: last, confirme: false } : undefined,
    lien_officiel: lien,
    sources: [{ titre: r.src === "manuel" ? "Manuel des bourses" : "Guide ultime des bourses", url: lien || null }].filter((x) => x.url),
    last_verified: null,
    status: "to_verify",
    guide: { source: r.src, date_limite_texte: dl || null },
    fr: {
      nom,
      resume: cut(desc, 260),
      resume_long: desc || undefined,
      valeur: valeur || undefined,
      couverture_detail: clean(R["Couverture"]) || undefined,
      ne_couvre_pas: clean(R["Ne couvre pas"]) || undefined,
      eligibilite: clean(R["Éligibilité"]) || undefined,
      cout_candidature: clean(R["Coût de candidature"]) || undefined,
      conseil: clean(R["Conseil stratégique"]) || undefined,
      edition_note: dl ? `Date limite indiquée dans le guide : ${dl}` : undefined,
    },
    en: { nom },
  };
  if (r.src === "manuel" && UNE.test(item.id)) item.vedette = true;
  items.push(item);
}

// Doublons : même lien, sinon même nom ; la version la plus riche (manuel) l'emporte, les liens manquants se complètent.
const byKey = new Map();
const keyOf = (it) => urlKey(it.lien_officiel) || it.id;
const richness = (it) => Object.values(it.fr).filter(Boolean).length + (it.guide.source === "manuel" ? 5 : 0);
// Même bourse sous deux intitulés (« Chevening Scholarship 2026 » / « Chevening Scholarships ») : mots significatifs inclus l'un dans l'autre.
const STOP = new Set("scholarship scholarships bourse bourses fully funded university universite of the de la du des et and for programme program award awards les le en pour d l fondation foundation".split(" "));
const toks = (it) => new Set(strip(it.fr.nom).replace(/\b20\d\d(-20\d\d)?\b/g, " ").split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const same = (a, b) => {
  if (a.pays_accueil[0] !== b.pays_accueil[0]) return false;
  const [x, y] = [toks(a), toks(b)];
  const [small, big] = x.size <= y.size ? [x, y] : [y, x];
  return small.size >= 1 && [...small].every((w) => big.has(w)) && (small.size >= 2 || big.size <= 3);
};
const kept = [];
for (const it of items) {
  const twin = kept.find((k) => same(k, it));
  if (twin) {
    const [keep, drop] = richness(it) > richness(twin) ? [it, twin] : [twin, it];
    if (keep === it) kept[kept.indexOf(twin)] = it;
    for (const [k, v] of Object.entries(drop)) if (keep[k] == null || (Array.isArray(keep[k]) && !keep[k].length)) keep[k] = v;
    keep.fr = { ...drop.fr, ...Object.fromEntries(Object.entries(keep.fr).filter(([, v]) => v)) };
    if (drop.vedette) keep.vedette = true;
    drop.__drop = true;
  } else kept.push(it);
}
for (const it of items) {
  if (it.__drop) continue;
  const ks = [keyOf(it), it.id];
  const hit = ks.map((k) => byKey.get(k)).find(Boolean);
  if (!hit) { ks.forEach((k) => byKey.set(k, it)); continue; }
  const [keep, drop] = richness(it) > richness(hit) ? [it, hit] : [hit, it];
  for (const [k, v] of Object.entries(drop)) if (keep[k] == null || (Array.isArray(keep[k]) && !keep[k].length)) keep[k] = v;
  keep.fr = { ...drop.fr, ...Object.fromEntries(Object.entries(keep.fr).filter(([, v]) => v)) };
  if (keep !== hit) { hit.__drop = true; ks.forEach((k) => byKey.set(k, keep)); byKey.set(keyOf(hit), keep); }
  else it.__drop = true;
}
for (const it of items) if (DEJA.has(it.id)) it.__drop = true;
const uniq = [];
const seen = new Set();
for (const it of items) {
  if (it.__drop || seen.has(it)) continue;
  seen.add(it);
  let id = it.id, n = 2;
  while (uniq.some((x) => x.id === id)) id = `${it.id}-${n++}`;
  it.id = id;
  for (const k of Object.keys(it)) if (it[k] === undefined || it[k] === null && k !== "lien_officiel" && k !== "last_verified") delete it[k];
  uniq.push(it);
}
fs.writeFileSync(out, JSON.stringify(uniq, null, 1) + "\n");
console.log(`${raws.length} blocs lus → ${uniq.length} bourses uniques → ${out}`);
