// Bourses d'études : filières, niveaux et cycle de vie d'une bourse (ouverte, clôture proche, expirée, relance attendue).
// Fonctions pures, testées dans bourses.test.js. Les dates viennent des pages officielles ; une date non confirmée reste « à confirmer ».

import { parseMois } from "./calendar.js";

// Filières regroupées en deux branches, comme le choix « Sciences ou Littérature » (en anglais : Science ou Arts).
export const BRANCHES = {
  sciences: ["maths", "informatique", "physique-chimie", "sante", "ingenierie", "agronomie-environnement"],
  lettres: ["droit-politique", "histoire-geographie", "lettres-langues", "philo-sociologie", "communication", "education", "economie-gestion"],
};
export const DOMAINES = [...BRANCHES.sciences, ...BRANCHES.lettres];
export const NIVEAUX_BOURSE = ["licence", "master", "doctorat", "postdoc", "autre"];
export const CYCLES = ["annuelle", "irreguliere", "unique"];
export const ORIGINES = ["gouvernementale", "universitaire", "fondation"];

const iso = (d) => d.toISOString().slice(0, 10);
export const today = (now = new Date()) => iso(now);
const days = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

// Une bourse est ouverte aux filières de la branche choisie si elle accepte « tous » ou une filière de cette branche.
export const branchesOf = (b) => (b.domaines?.includes("tous") || !b.domaines?.length ? ["sciences", "lettres"] : Object.keys(BRANCHES).filter((k) => b.domaines.some((d) => BRANCHES[k].includes(d))));

// Prochaine ouverture probable d'après le cycle : le premier mois d'ouverture qui suit la date du jour.
export function prochaineOuverture(cycle, now = new Date()) {
  const mois = parseMois(cycle?.ouverture_mois);
  if (!mois.length) return null;
  const m = now.getUTCMonth() + 1;
  const y = now.getUTCFullYear();
  const next = mois.find((x) => x > m);
  return next ? { annee: y, mois: next } : { annee: y + 1, mois: mois[0] };
}

// Mois de clôture habituel : la prochaine fois qu'il revient après aujourd'hui (repère probable, jamais une date annoncée).
export function prochaineCloture(cycle, now = new Date()) {
  const mois = parseMois(cycle?.cloture_mois);
  if (!mois.length) return null;
  const m = now.getUTCMonth() + 1;
  const y = now.getUTCFullYear();
  const next = mois.find((x) => x >= m);
  return next ? { annee: y, mois: next } : { annee: y + 1, mois: mois[0] };
}

// Statut du jour :
//  ouverte | cloture_proche (14 jours ou moins) | a_venir (ouverture datée) | expiree (clôture passée) | attendue (dates inconnues, cycle connu) | inconnue
export function statut(b, now = new Date()) {
  const t = today(now);
  const e = b.edition || {};
  const probable = !e.confirme;
  const relance = prochaineOuverture(b.cycle, now);
  if (e.cloture) {
    if (t > e.cloture) return { code: "expiree", jours: -days(e.cloture, t), cloture: e.cloture, relance, probable, prochaine_cloture: prochaineCloture(b.cycle, now) };
    if (e.ouverture && t < e.ouverture) return { code: "a_venir", jours: days(t, e.ouverture), ouverture: e.ouverture, cloture: e.cloture, probable };
    const left = days(t, e.cloture);
    return { code: left <= 14 ? "cloture_proche" : "ouverte", jours: left, ouverture: e.ouverture || null, cloture: e.cloture, probable };
  }
  if (e.ouverture && t < e.ouverture) return { code: "a_venir", jours: days(t, e.ouverture), ouverture: e.ouverture, probable };
  // Candidatures ouvertes en permanence (attribution à l'admission) : ouverte, sans échéance
  if (e.permanente) return { code: "ouverte", jours: null, cloture: null, sans_cloture: true, permanente: true, probable: true };
  // Ouverte sans date de clôture publiée : on le dit, sans inventer d'échéance
  if (e.ouverture) return { code: "ouverte", jours: null, ouverture: e.ouverture, cloture: null, sans_cloture: true, probable };
  if (relance) return { code: "attendue", relance, probable: true };
  const pc = prochaineCloture(b.cycle, now);
  if (pc) return { code: "attendue", relance: null, prochaine_cloture: pc, probable: true };
  return { code: "inconnue", probable: true };
}

// Ordre d'affichage : ce qui presse d'abord, puis ce qui est ouvert, ce qui vient, ce qui est expiré (relance proche d'abord).
const RANG = { cloture_proche: 0, ouverte: 1, a_venir: 2, attendue: 3, expiree: 4, inconnue: 5 };
export function trier(list) {
  return [...list].sort((a, b) => {
    const [x, y] = [a.statut, b.statut];
    if (RANG[x.code] !== RANG[y.code]) return RANG[x.code] - RANG[y.code];
    if (x.code === "cloture_proche" || x.code === "ouverte") return (x.jours ?? 1e9) - (y.jours ?? 1e9); // la clôture la plus proche d'abord ; sans date de clôture, à la fin
    if (x.code === "a_venir") return x.jours - y.jours;
    if (x.code === "expiree") return y.jours - x.jours; // expirée récemment d'abord (jours négatifs)
    return a.nom.localeCompare(b.nom);
  });
}

// Filtre : branche, filière, niveau, pays d'accueil, couverture.
export function filtrer(list, { branche, domaine, niveau, pays, couverture, origine } = {}) {
  return list.filter((b) => {
    if (branche && !branchesOf(b).includes(branche)) return false;
    if (domaine && !(b.domaines?.includes("tous") || !b.domaines?.length || b.domaines.includes(domaine))) return false;
    if (niveau && !b.niveaux?.includes(niveau)) return false;
    if (pays && !b.pays_accueil?.includes(pays)) return false;
    if (couverture && b.couverture?.niveau !== couverture) return false;
    if (origine && b.origine !== origine) return false;
    return true;
  });
}

// Contrôle des valeurs d'une bourse (refus au démarrage si une faute de frappe fausserait un statut).
export function checkBourse(b) {
  const bad = (m) => {
    throw new Error(`Bourse ${b.id} : ${m}`);
  };
  if (!b.id || !b.fr?.nom || !b.en?.nom) bad("identifiant et noms FR/EN requis");
  if (b.origine && !ORIGINES.includes(b.origine)) bad(`origine inconnue (${b.origine})`);
  if (b.couverture_niveau && !["complete", "partielle", "variable"].includes(b.couverture_niveau)) bad("couverture_niveau invalide");
  if (!Array.isArray(b.niveaux) || !b.niveaux.length || !b.niveaux.every((n) => NIVEAUX_BOURSE.includes(n))) bad("niveaux invalides");
  if (!Array.isArray(b.domaines) || !b.domaines.length || !b.domaines.every((d) => d === "tous" || DOMAINES.includes(d))) bad("domaines invalides");
  if (b.cycle && !CYCLES.includes(b.cycle.type)) bad(`cycle inconnu (${b.cycle.type})`);
  const date = (v) => v == null || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)));
  const e = b.edition || {};
  if (!date(e.ouverture) || !date(e.cloture)) bad("dates au format AAAA-MM-JJ");
  if (e.ouverture && e.cloture && e.ouverture > e.cloture) bad("l'ouverture suit la clôture");
  if (b.cameroun && !["oui", "non", "non_precise"].includes(b.cameroun)) bad("cameroun : oui | non | non_precise");
  if (b.lien_officiel && !/^https?:\/\//.test(b.lien_officiel)) bad("lien officiel invalide");
  if (b.status && !["to_verify", "verified"].includes(b.status)) bad("status inconnu");
}
