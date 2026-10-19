// Orientation : « Quel concours pour moi ? »
//
// Les règles reposent UNIQUEMENT sur les conditions d'accès renseignées dans les fiches
// (content/concours.json, champ `acces`). Ce qui n'est pas renseigné n'est jamais deviné :
// le concours passe en « possible » ou « inconnu » avec la raison, jamais en « bien adapté ».

export const NIVEAUX = ["bepc", "probatoire", "terminale", "bac", "bac+2", "licence", "master", "doctorat"];
// Rang de chaque niveau d'études. « cep » n'est qu'un seuil minimal (concours d'entrée en 6e).
// « terminale » : élève en classe d'examen, bac pas encore obtenu (même rang que le probatoire).
const RANG = { cep: 0, bepc: 1, probatoire: 2, terminale: 2, bac: 3, "bac+2": 4, licence: 5, master: 6, doctorat: 7 };

// Séries anglophones : LA1 à LA5 (Lower Sixth Arts) et LS1 à LS4 (Lower Sixth Science) se rattachent à ARTS et SCIENCE.
export const SERIES = ["A", "C", "D", "E", "TI", "F", "G", "ARTS", "LA1", "LA2", "LA3", "LA4", "LA5", "SCIENCE", "LS1", "LS2", "LS3", "LS4", "TECH", "AUTRE"];
export const canonSerie = (s) => (/^LA\d$/.test(s) ? "ARTS" : /^LS\d$/.test(s) ? "SCIENCE" : s);
export const REGIONS = ["adamaoua", "centre", "est", "extreme-nord", "littoral", "nord", "nord-ouest", "ouest", "sud", "sud-ouest"];
export const INTERETS = ["ordre", "enseignement", "sante", "administration", "finances", "technique", "nature", "ecoles"];

// Thème d'un concours (champ `theme`) → centre d'intérêt.
const THEME_INTERET = {
  police: "ordre", gendarmerie: "ordre", militaire: "ordre",
  enseignant: "enseignement", eleves: "enseignement", sport: "enseignement",
  infirmier: "sante", medecin: "sante", social: "sante",
  administration: "administration", justice: "administration", journalisme: "administration",
  finance: "finances",
  genie: "technique", informatique: "technique", transport: "technique",
  agriculture: "nature", foret: "nature",
  universite: "ecoles",
};
export const interetOf = (c) => THEME_INTERET[c.theme] || null;

import { targetYear, enPause } from "./calendar.js";
export { targetYear };

// Seule l'année de naissance est connue : l'âge réel est l'un de deux entiers consécutifs.
export function ageRange(anneeNaissance, year) {
  return [year - anneeNaissance - 1, year - anneeNaissance];
}

// Les séries se nomment différemment dans les deux sous-systèmes (A, C, D… / Arts, Science…).
// On ne compare que dans le même système : sinon la correspondance est à vérifier, jamais devinée.
const isAnglo = (s) => /^(ARTS|SCIENCE|TECH)/.test(String(s).toUpperCase().replace(/[^A-Z]/g, ""));

const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9+]/g, "");
const serieMatch = (profileSerie, list) => list.some((s) => norm(s).startsWith(norm(profileSerie)) || norm(profileSerie).startsWith(norm(s)));

// Évalue un concours pour un profil. Renvoie { categorie, raisons, interet }.
// categorie : bien | adapte | possible | improbable | inconnu | non
//   non        : une condition vérifiée dans une source solide (arrêté, site officiel) n'est pas remplie ;
//   improbable : une condition n'est pas remplie selon une source NON officielle : on ne l'exclut pas, on le dit ;
//   possible   : un point reste à confirmer ; inconnu : conditions pas encore renseignées.
// raison : { code, ok (true | false | null = à vérifier), weak?, ...paramètres }
export function evaluate(profil0, c, { now = new Date() } = {}) {
  const profil = profil0.serie ? { ...profil0, serie: canonSerie(profil0.serie) } : profil0;
  const interet = interetOf(c);
  const a = c.acces;
  if (!a) return { categorie: "inconnu", raisons: [{ code: "no_data", ok: null }], interet };

  const raisons = [];
  let non = false;
  let soft = false;
  let doubt = false;
  let over = false;
  const solid = a.confiance === "arrete" || a.confiance === "site_officiel";
  if (a.confiance === "non_trouve") doubt = true;
  // Condition non remplie : exclusion si la source est solide, sinon simple alerte.
  const fail = (code, extra = {}) => {
    raisons.push({ code, ok: false, ...(solid ? {} : { weak: true }), ...extra });
    if (solid) non = true;
    else soft = true;
  };

  // Niveau d'études
  const mine = RANG[profil.niveau];
  const min = a.niveaux_min ? RANG[a.niveaux_min] : null;
  if (min == null) {
    raisons.push({ code: "level_unknown", ok: null });
    doubt = true;
  } else if (profil.niveau === "terminale" && a.niveaux_min === "bac") {
    raisons.push({ code: "level_terminale", ok: null, min: a.niveaux_min });
    doubt = true;
  } else if (mine < min) {
    fail("level_low", { min: a.niveaux_min });
  } else {
    raisons.push({ code: "level_ok", ok: true, min: a.niveaux_min });
    if (mine - min >= 2) {
      raisons.push({ code: "level_over", ok: null, min: a.niveaux_min });
      over = true;
    }
  }
  const max = a.niveaux_max ? RANG[a.niveaux_max] : null;
  if (max != null && mine > max) {
    fail("level_high", { max: a.niveaux_max });
  }

  // Série du baccalauréat : seulement pour les candidats dont le diplôme le plus élevé est le bac (ou moins)
  if (mine > RANG.bac) {
    raisons.push({ code: "diploma_check", ok: null }); // filière du diplôme à comparer à l'arrêté
  } else if (a.series && a.series.length) {
    if (!profil.serie || profil.serie === "AUTRE") {
      raisons.push({ code: "series_unknown", ok: null, series: a.series });
      doubt = true;
    } else if (!a.series.some((x) => isAnglo(x) === isAnglo(profil.serie))) {
      raisons.push({ code: "series_system", ok: null, series: a.series });
      doubt = true;
    } else if (serieMatch(profil.serie, a.series)) {
      raisons.push({ code: "series_ok", ok: true, series: a.series });
    } else {
      fail("series_no", { series: a.series });
    }
  } else {
    raisons.push({ code: "series_free", ok: true });
  }

  // Âge. Une limite absente des données ne veut PAS dire « pas de limite » : presque tous les concours en ont une.
  // Seul `age_aucune: true` affirme qu'il n'y en a pas.
  if (a.age_min == null && a.age_max == null) {
    if (a.age_aucune) raisons.push({ code: "age_none", ok: true });
    else {
      raisons.push({ code: "age_missing", ok: null });
      doubt = true;
    }
  } else {
    if (!profil.annee_naissance) {
      raisons.push({ code: "age_unknown", ok: null, age_min: a.age_min, age_max: a.age_max });
      doubt = true;
    } else {
      const year = targetYear(now);
      const [lo, hi] = ageRange(profil.annee_naissance, year);
      const p = { age_min: a.age_min, age_max: a.age_max, year, age: hi };
      if (a.age_max != null && lo > a.age_max) {
        fail("age_over", p);
      } else if (a.age_min != null && hi < a.age_min) {
        fail("age_under", p);
      } else if ((a.age_max != null && hi > a.age_max) || (a.age_min != null && lo < a.age_min)) {
        raisons.push({ code: "age_border", ok: null, ...p });
        doubt = true;
      } else {
        raisons.push({ code: "age_ok", ok: true, ...p });
      }
    }
  }

  // Centres d'intérêt : ils ne font que classer, jamais exclure
  const wants = profil.interets || [];
  let offTopic = false;
  if (wants.length && interet) {
    offTopic = !wants.includes(interet);
    raisons.push({ code: offTopic ? "interest_other" : "interest_match", ok: offTopic ? null : true, interet });
  }

  // Concours à cycle de plusieurs années : en pause tant que la prochaine session probable est lointaine
  const pause = enPause(c.periodicite, now) ? c.periodicite.prochaine_probable : null;
  if (pause) raisons.push({ code: "pause", ok: null, prochaine: pause });

  const categorie = non ? "non" : soft ? "improbable" : doubt ? "possible" : over || offTopic ? "adapte" : "bien";
  return { categorie, raisons, interet, ...(pause ? { pause } : {}) };
}

const ORDRE = { bien: 0, adapte: 1, possible: 2, improbable: 3, inconnu: 4, non: 5 };

export function orient(profil, concoursList, opts) {
  return concoursList
    .map((c) => ({ id: c.id, priorite: c.priorite || 999, nom: c.nom || c.id, ...evaluate(profil, c, opts) }))
    // À catégorie égale, un concours en pause passe après ceux qui ont une session proche
    .sort((x, y) => ORDRE[x.categorie] - ORDRE[y.categorie] || Boolean(x.pause) - Boolean(y.pause) || x.priorite - y.priorite || x.nom.localeCompare(y.nom))
    .map(({ priorite, nom, ...r }) => r);
}

// Nettoie le profil reçu du client : ne garde que des valeurs connues.
export function cleanProfil(b, now = new Date()) {
  const out = {};
  if (b.niveau !== undefined) {
    if (b.niveau !== "" && !NIVEAUX.includes(b.niveau)) throw Object.assign(new Error("Niveau d'études inconnu."), { status: 400 });
    out.niveau = b.niveau || null;
  }
  if (b.serie !== undefined) {
    const s = String(b.serie || "").toUpperCase();
    if (s && !SERIES.includes(s)) throw Object.assign(new Error("Série inconnue."), { status: 400 });
    out.serie = s || null;
  }
  if (b.annee_naissance !== undefined) {
    if (b.annee_naissance === "" || b.annee_naissance === null) out.annee_naissance = null;
    else {
      const y = Number(b.annee_naissance);
      const now_ = now.getFullYear();
      if (!Number.isInteger(y) || y < now_ - 70 || y > now_ - 8) throw Object.assign(new Error("Année de naissance invalide."), { status: 400 });
      out.annee_naissance = y;
    }
  }
  if (b.region !== undefined) {
    if (b.region && !REGIONS.includes(b.region)) throw Object.assign(new Error("Région inconnue."), { status: 400 });
    out.region = b.region || null;
  }
  if (b.interets !== undefined) {
    if (!Array.isArray(b.interets)) throw Object.assign(new Error("Centres d'intérêt invalides."), { status: 400 });
    out.interets = [...new Set(b.interets.filter((i) => INTERETS.includes(i)))];
  }
  return out;
}
