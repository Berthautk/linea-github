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
  const byId = new Map(epreuves.map((e) => [e.id, withGrille(e, grilles)]));

  return {
    epreuve: (id) => byId.get(id) || null,
    concours: (id) => concours.find((c) => c.id === id) || null,

    // Ce que tout le monde peut voir : fiches, liste des épreuves (sans texte), déroulement de l'oral.
    catalog(lang) {
      return {
        lang,
        groupes: Object.fromEntries(Object.entries(groupes).map(([k, v]) => [k, v[lang]])),
        categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v[lang]])),
        photos,
        concours: concours
          .filter((c) => c[lang])
          .map((c) => ({ id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, categorie: c.categorie, tutelle: c.tutelle, oral: c.oral, priorite: c.priorite || 999, theme: c.theme, ...c[lang] })),
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

// Grille d'auto-correction : blocs partagés (grilles.json, cités par leur nom) ou propres à l'épreuve.
// Chaque critère a ses points et ses niveaux (« comment se noter »). Le total doit faire 20.
function withGrille(e, grilles) {
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
