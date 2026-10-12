// Tests de l'orientation « Quel concours pour moi ? » : règles d'éligibilité, cas limites d'âge et de série.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, orient, ageRange, targetYear, cleanProfil } from "./orientation.js";

const NOW = new Date("2026-03-15"); // année cible : 2026
const gp = (extra = {}) => ({
  id: "gp", theme: "police", priorite: 2,
  acces: { niveaux_min: "bepc", niveaux_max: null, series: null, age_min: 18, age_max: 28, confiance: "arrete", ...extra },
});
const cat = (profil, c) => evaluate(profil, c, { now: NOW }).categorie;
const codes = (profil, c) => evaluate(profil, c, { now: NOW }).raisons.map((r) => r.code);

test("l'année cible bascule en septembre", () => {
  assert.equal(targetYear(new Date("2026-08-31")), 2026);
  assert.equal(targetYear(new Date("2026-09-01")), 2027);
});

test("l'âge est un intervalle de deux entiers", () => {
  assert.deepEqual(ageRange(2000, 2026), [25, 26]);
});

test("profil dans les conditions : bien adapté", () => {
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, gp()), "bien");
});

test("âge : limite haute certaine, incertaine, et limite basse", () => {
  assert.equal(cat({ niveau: "bepc", annee_naissance: 1990 }, gp()), "non"); // 35 ou 36 ans
  assert.equal(cat({ niveau: "bepc", annee_naissance: 1998 }, gp()), "bien"); // 27 ou 28 ans : dans les deux cas
  assert.equal(cat({ niveau: "bepc", annee_naissance: 1997 }, gp()), "possible"); // 28 ou 29 ans : selon la date de naissance
  assert.equal(cat({ niveau: "bepc", annee_naissance: 1996 }, gp()), "non"); // 29 ou 30 ans
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2010 }, gp()), "non"); // 15 ou 16 ans : trop jeune
  assert.ok(codes({ niveau: "bepc", annee_naissance: 1997 }, gp()).includes("age_border"));
});

test("année de naissance inconnue : possible, jamais bien adapté", () => {
  assert.equal(cat({ niveau: "bepc" }, gp()), "possible");
  assert.ok(codes({ niveau: "bepc" }, gp()).includes("age_unknown"));
});

test("limite d'âge absente des données : à vérifier, sauf si « aucune limite » est affirmé", () => {
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, gp({ age_min: null, age_max: null })), "possible");
  assert.ok(codes({ niveau: "bepc", annee_naissance: 2002 }, gp({ age_min: null, age_max: null })).includes("age_missing"));
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, gp({ age_min: null, age_max: null, age_aucune: true })), "bien");
});

test("niveau insuffisant ou trop élevé", () => {
  const c = gp({ niveaux_min: "bac", niveaux_max: "bac" });
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, c), "non");
  assert.equal(cat({ niveau: "licence", annee_naissance: 2002 }, c), "non");
  assert.ok(codes({ niveau: "licence", annee_naissance: 2002 }, c).includes("level_high"));
});

test("élève de Terminale : possible pour un concours qui exige le bac", () => {
  assert.equal(cat({ niveau: "terminale", annee_naissance: 2008 }, gp({ niveaux_min: "bac", age_min: null })), "possible");
  assert.equal(cat({ niveau: "terminale", annee_naissance: 2002 }, gp({ niveaux_min: "probatoire" })), "bien");
});

test("niveau très supérieur à celui demandé : adapté, pas bien adapté", () => {
  assert.equal(cat({ niveau: "master", annee_naissance: 2000 }, gp({ niveaux_min: "bepc" })), "adapte");
});

test("série : admise, exclue (source solide), exclue (source faible), inconnue", () => {
  const c = (confiance) => gp({ niveaux_min: "bac", series: ["C", "D", "E", "TI"], confiance });
  const p = (serie) => ({ niveau: "bac", serie, annee_naissance: 2002 });
  assert.equal(cat(p("C"), c("arrete")), "bien");
  assert.equal(cat(p("A"), c("arrete")), "non");
  assert.equal(cat(p("A"), c("secondaire")), "improbable"); // source non officielle : alerte, pas d'exclusion
  assert.equal(cat(p("AUTRE"), c("arrete")), "possible");
  assert.equal(cat({ niveau: "bac", annee_naissance: 2002 }, c("arrete")), "possible");
});

test("séries nommées dans l'autre sous-système : à vérifier, jamais exclu", () => {
  const c = gp({ niveaux_min: "bac", series: ["Science", "Arts"] });
  assert.equal(cat({ niveau: "bac", serie: "C", annee_naissance: 2002 }, c), "possible");
  assert.equal(cat({ niveau: "bac", serie: "ARTS", annee_naissance: 2002 }, c), "bien");
  assert.ok(codes({ niveau: "bac", serie: "C", annee_naissance: 2002 }, c).includes("series_system"));
});

test("la série est ignorée pour un licencié, avec rappel de vérifier le diplôme", () => {
  const c = gp({ niveaux_min: "licence", series: ["C"] });
  const r = codes({ niveau: "licence", serie: "A", annee_naissance: 2000 }, c);
  assert.ok(!r.includes("series_no"));
  assert.ok(r.includes("diploma_check"));
});

test("les codes de série tolèrent les variantes (A4, F3…)", () => {
  const c = gp({ niveaux_min: "bac", series: ["A4", "F3"] });
  assert.equal(cat({ niveau: "bac", serie: "A", annee_naissance: 2002 }, c), "bien");
  assert.equal(cat({ niveau: "bac", serie: "F", annee_naissance: 2002 }, c), "bien");
  assert.equal(cat({ niveau: "bac", serie: "D", annee_naissance: 2002 }, c), "non");
});

test("source non officielle : une limite dépassée donne « improbable », jamais « non »", () => {
  const weak = gp({ confiance: "secondaire" });
  assert.equal(cat({ niveau: "bepc", annee_naissance: 1990 }, weak), "improbable");
  const r = evaluate({ niveau: "bepc", annee_naissance: 1990 }, weak, { now: NOW }).raisons.find((x) => x.code === "age_over");
  assert.equal(r.weak, true);
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, gp({ niveaux_min: "bac", confiance: "secondaire" })), "improbable");
  assert.equal(cat({ niveau: "bepc", annee_naissance: 2002 }, gp({ niveaux_min: "bac", confiance: "arrete" })), "non");
});

test("conditions non renseignées : inconnu, jamais deviné", () => {
  assert.equal(cat({ niveau: "bac", annee_naissance: 2002 }, { id: "x", theme: "police" }), "inconnu");
  assert.equal(cat({ niveau: "bac", annee_naissance: 2002 }, gp({ niveaux_min: null })), "possible");
  assert.equal(cat({ niveau: "bac", annee_naissance: 2002 }, gp({ confiance: "non_trouve" })), "possible");
});

test("les centres d'intérêt classent sans exclure", () => {
  const p = { niveau: "bepc", annee_naissance: 2002, interets: ["sante"] };
  assert.equal(cat(p, gp()), "adapte");
  assert.equal(cat({ ...p, interets: ["ordre"] }, gp()), "bien");
  assert.equal(cat({ ...p, interets: [] }, gp()), "bien");
});

test("le classement place les mieux adaptés d'abord, puis la priorité", () => {
  const list = [
    { id: "non", nom: "N", theme: "police", priorite: 1, acces: { ...gp().acces, age_max: 20 } },
    { id: "b2", nom: "B2", theme: "police", priorite: 9, acces: gp().acces },
    { id: "b1", nom: "B1", theme: "police", priorite: 3, acces: gp().acces },
    { id: "inc", nom: "I", theme: "police", priorite: 2 },
  ];
  const r = orient({ niveau: "bepc", annee_naissance: 2003 }, list, { now: NOW });
  assert.deepEqual(r.map((x) => x.id), ["b1", "b2", "inc", "non"]);
});

test("cleanProfil refuse les valeurs inconnues et nettoie les listes", () => {
  assert.throws(() => cleanProfil({ niveau: "docteur" }), /Niveau/);
  assert.throws(() => cleanProfil({ annee_naissance: 1900 }, NOW), /naissance/);
  assert.throws(() => cleanProfil({ annee_naissance: 2025 }, NOW), /naissance/);
  assert.throws(() => cleanProfil({ serie: "Z" }), /Série/);
  assert.throws(() => cleanProfil({ region: "mars" }), /Région/);
  assert.deepEqual(cleanProfil({ niveau: "bac", serie: "c", annee_naissance: "2004", interets: ["ordre", "ordre", "x"] }, NOW), {
    niveau: "bac", serie: "C", annee_naissance: 2004, interets: ["ordre"],
  });
  assert.deepEqual(cleanProfil({ niveau: "", annee_naissance: "" }), { niveau: null, annee_naissance: null });
});
