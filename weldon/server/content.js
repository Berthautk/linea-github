// Catalogue Weldon : fiches des concours, épreuves et oral, en français et en anglais.
// Les textes des sujets et corrigés ne sortent du serveur que pour les comptes autorisés.

import fs from "node:fs";
import path from "node:path";
import { moisOf, PERIODICITES, parseMois } from "./calendar.js";
import { checkBourse, branchesOf } from "./bourses.js";

export const LANGS = ["fr", "en"];

export function loadContent(dir) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const concours = read("concours.json");
  const epreuves = read("epreuves.json");
  const oral = read("oral.json");
  const groupes = read("groupes.json");
  const categories = read("categories.json");
  const grilles = read("grilles.json");
  const quiz = fs.existsSync(path.join(dir, "quiz.json")) ? read("quiz.json") : [];
  checkQuiz(quiz);
  const quizById = new Map(quiz.map((q) => [q.id, q]));
  // Deux sources : bourses.json (relevées une à une sur les pages officielles) et bourses-guide.json (guides du concepteur, à vérifier).
  const bourses = ["bourses.json", "bourses-guide.json"].flatMap((f) => (fs.existsSync(path.join(dir, f)) ? read(f) : []));
  const ids_b = new Set();
  for (const b of bourses) {
    checkBourse(b);
    if (ids_b.has(b.id)) throw new Error(`Bourse en double : ${b.id}`);
    ids_b.add(b.id);
  }
  // Conseils et modèles (articles) : gratuits ou réservés aux abonnés. Français uniquement pour l'instant.
  const conseils = fs.existsSync(path.join(dir, "bourses-conseils.json")) ? read("bourses-conseils.json") : [];
  const cids = new Set();
  for (const a of conseils) {
    if (!a.id || cids.has(a.id) || !a.fr?.titre || !Array.isArray(a.fr.sections)) throw new Error(`Conseil invalide ou en double : ${a.id}`);
    cids.add(a.id);
  }
  const alertes = fs.existsSync(path.join(dir, "alertes-pays.json")) ? Object.fromEntries(Object.entries(read("alertes-pays.json")).filter(([k]) => !k.startsWith("_"))) : {};
  const photos = Object.fromEntries(Object.entries(read("photos.json")).filter(([k]) => !k.startsWith("_")));

  const ids = new Set();
  for (const e of epreuves) {
    if (ids.has(e.id)) throw new Error(`Identifiant d'épreuve en double : ${e.id}`);
    ids.add(e.id);
    if (!LANGS.includes(e.lang)) throw new Error(`Langue inconnue pour ${e.id} : ${e.lang}`);
    if (!concours.some((c) => c.id === e.concours)) throw new Error(`Concours inconnu pour ${e.id} : ${e.concours}`);
    checkOfficiel(e);
    if (e.corrige_a_verifier != null && !(Array.isArray(e.corrige_a_verifier) && e.corrige_a_verifier.every((x) => typeof x === "string"))) throw new Error(`Épreuve ${e.id} : corrige_a_verifier : liste de textes attendue`);
  }
  for (const c of concours) {
    checkAcces(c);
    checkPeriodicite(c.id, c.periodicite);
  }
  const byId = new Map(epreuves.map((e) => [e.id, withGrille(e, grilles)]));

  return {
    epreuve: (id) => byId.get(id) || null,
    // Banque de questions d'entraînement. Les réponses ne sortent que par la correction (/api/quiz/check).
    // Bourses d'études : texte dans la langue demandée, dates et cycle neutres. Le statut du jour est calculé par l'appelant.
    bourses: (lang) =>
      bourses
        .filter((b) => b[lang])
        .map((b) => {
          const out = localizeBourse(b, lang);
          // Alerte propre au pays d'accueil (ex. visa étudiant suspendu), en plus de celle de la fiche.
          const al = (b.pays_accueil || []).map((p) => alertes[p]?.[lang]).filter(Boolean);
          out.alerte = [out.alerte, ...al].filter(Boolean).join(" ");
          return out;
        }),
    bourse: (id) => bourses.find((b) => b.id === id) || null,
    conseils: () => [...conseils].sort((a, b) => (a.ordre || 99) - (b.ordre || 99)),
    conseil: (id) => conseils.find((a) => a.id === id) || null,
    quizIds: () => quiz.map((q) => q.id).sort(),
    quizThemes: () => [...new Set(quiz.map((q) => q.theme))],
    quizQuestion: (id) => quizById.get(id) || null,
    quizList: () => quiz,
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

// Banque de questions : 4 options, une réponse, dans les deux langues ; refus au démarrage sinon.
const NIVEAUX_QUIZ = ["facile", "moyen", "difficile"];
function checkQuiz(bank) {
  const ids = new Set();
  for (const q of bank) {
    const bad = (m) => {
      throw new Error(`Question ${q.id} : ${m}`);
    };
    if (!q.id || ids.has(q.id)) bad("identifiant manquant ou en double");
    ids.add(q.id);
    if (!q.theme) bad("thème manquant");
    if (!NIVEAUX_QUIZ.includes(q.niveau)) bad(`niveau inconnu (${q.niveau})`);
    for (const l of LANGS) {
      const v = q[l];
      if (!v?.q || !v.explication) bad(`texte ou explication manquant (${l})`);
      if (!Array.isArray(v.options) || v.options.length !== 4 || new Set(v.options).size !== 4 || v.options.some((o) => !o)) bad(`il faut 4 options distinctes (${l})`);
      if (!Number.isInteger(v.answer) || v.answer < 0 || v.answer > 3) bad(`réponse hors 0..3 (${l})`);
    }
  }
}

// Sujets officiels : on ne publie qu'un texte transcrit, avec sa source et son droit d'usage (jamais le corrigé
// ni la mise en page d'un auteur de recueil). `source` est affichée aux élèves ; `source_doc` et `rights` restent internes.
export const RIGHTS = ["recueil_achete", "officiel_public", "autorisation"];
function checkOfficiel(e) {
  if (e.exemple) return;
  const bad = (m) => {
    throw new Error(`Épreuve officielle ${e.id} : ${m}`);
  };
  if (!e.source || typeof e.source !== "string") bad("source manquante (concours, session, organisme)");
  if (!e.source_doc || typeof e.source_doc !== "string") bad("source_doc manquant (fichier du recueil ou lien)");
  if (!RIGHTS.includes(e.rights)) bad(`rights inconnu (${e.rights}) : ${RIGHTS.join(" | ")}`);
  if (e.a_verifier != null && !(Array.isArray(e.a_verifier) && e.a_verifier.every((x) => typeof x === "string"))) bad("a_verifier : liste de textes attendue");
  if (e.corrige_source === "officiel" && e.verifie === "non_verifie") bad("un corrigé officiel ne peut pas être « non_verifie »");
}

// Conditions d'accès : valeurs contrôlées au démarrage, pour qu'une faute de frappe ne fausse jamais l'orientation.
const NIVEAUX_OK = ["cep", "bepc", "probatoire", "bac", "bac+2", "licence", "master", "doctorat"];
function checkAcces(c) {
  checkAccesValues(c.id, c.acces, c.status);
  for (const x of c.sources || []) if (!x.titre) throw new Error(`Conditions d'accès de ${c.id} : une source n'a pas de titre`);
}

export function checkAccesValues(id, a, status) {
  const bad = (m) => {
    throw new Error(`Conditions d'accès de ${id} : ${m}`);
  };
  if (!a) return;
  for (const k of ["niveaux_min", "niveaux_max"]) if (a[k] != null && !NIVEAUX_OK.includes(a[k])) bad(`${k} inconnu (${a[k]})`);
  if (!["arrete", "site_officiel", "secondaire", "non_trouve"].includes(a.confiance)) bad(`confiance inconnue (${a.confiance})`);
  for (const k of ["age_min", "age_max"]) if (a[k] != null && !(Number.isInteger(a[k]) && a[k] >= 5 && a[k] <= 70)) bad(`${k} invalide (${a[k]})`);
  if (a.age_min != null && a.age_max != null && a.age_min > a.age_max) bad("l'âge minimum dépasse l'âge maximum");
  if (a.series != null && !(Array.isArray(a.series) && a.series.every((x) => typeof x === "string"))) bad("series doit être une liste");
  if (status && !["to_verify", "verified"].includes(status)) bad(`status inconnu (${status})`);
}

// Périodicité : annuelle, tous les N ans, irrégulière ; historique des sessions et prochaine session probable.
export function checkPeriodicite(id, per) {
  if (!per) return;
  const bad = (m) => {
    throw new Error(`Périodicité de ${id} : ${m}`);
  };
  if (!PERIODICITES.includes(per.type)) bad(`type inconnu (${per.type})`);
  const year = (v) => Number.isInteger(v) && v >= 1990 && v <= 2100;
  if (per.type === "pluriannuelle" && !(Number.isInteger(per.intervalle_ans) && per.intervalle_ans >= 2 && per.intervalle_ans <= 10)) bad("intervalle de 2 à 10 ans requis");
  if (per.intervalle_ans != null && per.type !== "pluriannuelle") bad("un intervalle n'a de sens que pour un cycle de plusieurs années");
  for (const k of ["sessions", "annees_sans_session"]) if (per[k] != null && !(Array.isArray(per[k]) && per[k].every(year))) bad(`${k} : liste d'années attendue`);
  for (const k of ["derniere_session", "prochaine_probable"]) if (per[k] != null && !year(per[k])) bad(`${k} invalide`);
  if (per.prochaine_probable && per.derniere_session && per.prochaine_probable <= per.derniere_session) bad("la prochaine session doit suivre la dernière");
  if (per.confiance != null && !["officiel", "secondaire", "deduit", "non_trouve"].includes(per.confiance)) bad(`confiance inconnue (${per.confiance})`);
}

// Bourse dans une langue : champs neutres + textes de la langue.
// Les intitulés de pays varient d'une source à l'autre (« France (Sciences Po) », « Pays d'étude variable ») : on ramène à un pays, sinon « Plusieurs pays ».
const MULTI = /plusieurs|variable|autres|partenaires|subsaharienne|instituts|europe|pays du sud|multi/i;
export function normPays(list) {
  const out = new Set();
  for (const raw of list || []) {
    const base = String(raw).replace(/\s*\(.*\)\s*$/, "").trim();
    out.add(MULTI.test(base) ? "Plusieurs pays" : base);
  }
  return [...out];
}

export function localizeBourse(b, lang) {
  // Les bourses issues des guides n'ont que le français : les textes manquants en anglais retombent sur le français.
  const t = { ...(b.fr || {}), ...Object.fromEntries(Object.entries(b[lang] || {}).filter(([, v]) => v)) };
  return {
    origine: b.origine || null,
    vedette: Boolean(b.vedette),
    apercu_gratuit: Boolean(b.apercu_gratuit),
    valeur: t.valeur || "",
    resume_long: t.resume_long || "",
    ne_couvre_pas: t.ne_couvre_pas || "",
    eligibilite: t.eligibilite || "",
    cout_candidature: t.cout_candidature || "",
    alerte: t.alerte || "",
    id: b.id,
    nom: t.nom,
    organisme: b.organisme,
    pays_accueil: normPays(b.pays_accueil),
    cameroun: b.cameroun || "non_precise",
    niveaux: b.niveaux,
    domaines: b.domaines,
    branches: branchesOf(b),
    couverture: { niveau: b.couverture_niveau || "variable", detail: t.couverture_detail || "" },
    conditions: { age_max: b.age_max ?? null, diplome: t.diplome || "", langue: t.langue || "", autres: t.autres || [] },
    cycle: b.cycle ? { ...b.cycle, mois: { ouverture: parseMois(b.cycle.ouverture_mois), cloture: parseMois(b.cycle.cloture_mois) } } : null,
    edition: { ...(b.edition || {}), note: t.edition_note || "" },
    resume: t.resume || "",
    dossier: t.dossier || [],
    conseil: t.conseil || "",
    lien_officiel: b.lien_officiel || null,
    sources: b.sources || [],
    last_verified: b.last_verified || null,
    status: b.status || "to_verify",
  };
}

// Fiche publique d'un concours dans une langue : textes de la langue + conditions d'accès structurées.
// Les champs `acces`, `calendrier`, `sources`… sont neutres (chiffres, codes) ; leurs textes sont dans c[lang].
function fiche(c, lang) {
  const { acces_txt, cal_txt, periodicite_txt, debouches, variantes, ...texts } = c[lang];
  const out = {
    id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, categorie: c.categorie, tutelle: c.tutelle,
    oral: c.oral, priorite: c.priorite || 999, theme: c.theme, ...texts,
  };
  if (c.acces) out.acces = { ...c.acces, ...acces_txt };
  if (c.calendrier) {
    out.calendrier = { ...c.calendrier, ...cal_txt };
    const mois = moisOf(c.calendrier);
    if (mois) out.calendrier.mois = mois;
  }
  if (c.periodicite) out.periodicite = { ...c.periodicite, ...periodicite_txt };
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
