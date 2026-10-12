// Catalogue Weldon : fiches des concours, épreuves et oral, en français et en anglais.
// Les textes des sujets et corrigés ne sortent du serveur que pour les comptes autorisés.

import fs from "node:fs";
import path from "node:path";

export const LANGS = ["fr", "en"];

export function loadContent(dir) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const concours = read("concours.json");
  const epreuves = read("epreuves.json");
  const oral = read("oral.json");
  const groupes = read("groupes.json");
  const categories = read("categories.json");
  const grilles = read("grilles.json");
  const photos = Object.fromEntries(Object.entries(read("photos.json")).filter(([k]) => !k.startsWith("_")));

  const ids = new Set();
  for (const e of epreuves) {
    if (ids.has(e.id)) throw new Error(`Identifiant d'épreuve en double : ${e.id}`);
    ids.add(e.id);
    if (!LANGS.includes(e.lang)) throw new Error(`Langue inconnue pour ${e.id} : ${e.lang}`);
    if (!concours.some((c) => c.id === e.concours)) throw new Error(`Concours inconnu pour ${e.id} : ${e.concours}`);
  }
  for (const c of concours) checkAcces(c);
  const byId = new Map(epreuves.map((e) => [e.id, withGrille(e, grilles)]));

  return {
    epreuve: (id) => byId.get(id) || null,
    allEpreuves: () => epreuves.map(({ id, concours: cid, lang, annee, matiere, exemple }) => ({ id, concours: cid, lang, annee, matiere, exemple: Boolean(exemple) })),
    concours: (id) => concours.find((c) => c.id === id) || null,

    // Ce que tout le monde peut voir : fiches, liste des épreuves (sans texte), déroulement de l'oral.
    catalog(lang) {
      return {
        lang,
        groupes: Object.fromEntries(Object.entries(groupes).map(([k, v]) => [k, v[lang]])),
        categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v[lang]])),
        photos,
        concours: concours.filter((c) => c[lang]).map((c) => fiche(c, lang)),
        epreuves: epreuves
          .filter((e) => e.lang === lang)
          .map(({ id, concours: cid, annee, matiere, duree, exemple, sujet }) => ({
            id,
            concours: cid,
            annee,
            matiere,
            duree,
            exemple: Boolean(exemple),
            apercu: sujet.slice(0, 140),
          })),
        oral: Object.fromEntries(
          Object.entries(oral)
            .filter(([, v]) => v[lang])
            .map(([k, v]) => [k, { deroulement: v[lang].deroulement }])
        ),
      };
    },

    oralFull: (concoursId, lang) => oral[concoursId]?.[lang] || null,
  };
}

// Conditions d'accès : valeurs contrôlées au démarrage, pour qu'une faute de frappe ne fausse jamais l'orientation.
const NIVEAUX_OK = ["cep", "bepc", "probatoire", "bac", "bac+2", "licence", "master", "doctorat"];
function checkAcces(c) {
  const bad = (m) => {
    throw new Error(`Conditions d'accès de ${c.id} : ${m}`);
  };
  const a = c.acces;
  if (!a) return;
  for (const k of ["niveaux_min", "niveaux_max"]) if (a[k] != null && !NIVEAUX_OK.includes(a[k])) bad(`${k} inconnu (${a[k]})`);
  if (!["arrete", "site_officiel", "secondaire", "non_trouve"].includes(a.confiance)) bad(`confiance inconnue (${a.confiance})`);
  for (const k of ["age_min", "age_max"]) if (a[k] != null && !(Number.isInteger(a[k]) && a[k] >= 5 && a[k] <= 70)) bad(`${k} invalide (${a[k]})`);
  if (a.age_min != null && a.age_max != null && a.age_min > a.age_max) bad("age_min dépasse age_max");
  if (a.series != null && !(Array.isArray(a.series) && a.series.every((x) => typeof x === "string"))) bad("series doit être une liste");
  if (c.status && !["to_verify", "verified"].includes(c.status)) bad(`status inconnu (${c.status})`);
  for (const x of c.sources || []) if (!x.titre) bad("une source n'a pas de titre");
}

// Fiche publique d'un concours dans une langue : textes de la langue + conditions d'accès structurées.
// Les champs `acces`, `calendrier`, `sources`… sont neutres (chiffres, codes) ; leurs textes sont dans c[lang].
function fiche(c, lang) {
  const { acces_txt, cal_txt, debouches, variantes, ...texts } = c[lang];
  const out = {
    id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, categorie: c.categorie, tutelle: c.tutelle,
    oral: c.oral, priorite: c.priorite || 999, theme: c.theme, ...texts,
  };
  if (c.acces) out.acces = { ...c.acces, ...acces_txt };
  if (c.calendrier) out.calendrier = { ...c.calendrier, ...cal_txt };
  if (debouches) out.debouches = debouches;
  if (variantes?.length) out.variantes = variantes;
  if (c.lien_inscription) out.lien_inscription = c.lien_inscription;
  if (c.sources?.length) out.sources = c.sources;
  if (c.last_verified) out.last_verified = c.last_verified;
  if (c.acces || c.calendrier) out.status = c.status || "to_verify";
  return out;
}

// Grille d'auto-correction : blocs partagés (grilles.json, cités par leur nom) ou propres à l'épreuve.
// Chaque critère a ses points et ses niveaux (« comment se noter »). Le total doit faire 20.
function withGrille(e, grilles) {
  e = { ...e, corrige_source: e.corrige_source || "propose", verifie: e.verifie || "non_verifie" };
  if (!["officiel", "propose"].includes(e.corrige_source)) throw new Error(`corrige_source inconnu pour ${e.id} : ${e.corrige_source}`);
  if (!["calcul", "officiel", "non_verifie"].includes(e.verifie)) throw new Error(`verifie inconnu pour ${e.id} : ${e.verifie}`);
  if (!e.grille) return e;
  const blocks = e.grille.flatMap((b) => {
    if (typeof b === "string") {
      const shared = grilles[b]?.[e.lang];
      if (!shared) throw new Error(`Grille inconnue pour ${e.id} : ${b}`);
      return shared;
    }
    const aide = b.aide ? grilles[b.aide]?.[e.lang] : undefined;
    if (b.aide && !aide) throw new Error(`Aide de grille inconnue pour ${e.id} : ${b.aide}`);
    return [{ ...b, aide, pts: b.pts ?? b.criteres.reduce((s, c) => s + c.pts, 0) }];
  });
  const total = blocks.reduce((s, b) => s + b.criteres.reduce((t, c) => t + c.pts, 0), 0);
  if (Math.abs(total - 20) > 1e-9) throw new Error(`La grille de ${e.id} fait ${total} points au lieu de 20.`);
  const unit = e.lang === "fr" ? "pts" : "marks";
  const bareme = blocks.flatMap((b) => b.criteres.map((c) => `${b.titre} – ${c.label} : ${c.pts} ${unit}`)).join("\n");
  return { ...e, grille: blocks, bareme };
}
