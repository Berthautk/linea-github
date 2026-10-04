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
  const correctionDemo = read("correction_demo.json");

  const ids = new Set();
  for (const e of epreuves) {
    if (ids.has(e.id)) throw new Error(`Identifiant d'épreuve en double : ${e.id}`);
    ids.add(e.id);
    if (!LANGS.includes(e.lang)) throw new Error(`Langue inconnue pour ${e.id} : ${e.lang}`);
    if (!concours.some((c) => c.id === e.concours)) throw new Error(`Concours inconnu pour ${e.id} : ${e.concours}`);
  }
  const byId = new Map(epreuves.map((e) => [e.id, e]));

  return {
    epreuve: (id) => byId.get(id) || null,
    concours: (id) => concours.find((c) => c.id === id) || null,
    correctionDemo: (lang) => correctionDemo[lang] || correctionDemo.fr,

    // Ce que tout le monde peut voir : fiches, liste des épreuves (sans texte), déroulement de l'oral.
    catalog(lang) {
      return {
        lang,
        groupes: Object.fromEntries(Object.entries(groupes).map(([k, v]) => [k, v[lang]])),
        categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v[lang]])),
        concours: concours
          .filter((c) => c[lang])
          .map((c) => ({ id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, categorie: c.categorie, tutelle: c.tutelle, oral: c.oral, ...c[lang] })),
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
