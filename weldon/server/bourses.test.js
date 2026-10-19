// Tests des bourses : cycle de vie, relance des bourses expirées, filtres par branche et filière.
import { test } from "node:test";
import assert from "node:assert/strict";
import { statut, prochaineOuverture, trier, filtrer, branchesOf, checkBourse } from "./bourses.js";

const NOW = new Date("2026-10-19T10:00:00Z");
const bourse = (extra = {}) => ({ id: "b", nom: "B", niveaux: ["master"], domaines: ["tous"], cycle: { type: "annuelle", ouverture_mois: "août–septembre", cloture_mois: "octobre" }, edition: {}, ...extra });

test("bourse ouverte, clôture proche, à venir, expirée", () => {
  assert.equal(statut(bourse({ edition: { ouverture: "2026-09-01", cloture: "2026-12-01", confirme: true } }), NOW).code, "ouverte");
  assert.equal(statut(bourse({ edition: { ouverture: "2026-09-01", cloture: "2026-12-01", confirme: true } }), NOW).jours, 43);
  const near = statut(bourse({ edition: { cloture: "2026-10-30", confirme: true } }), NOW);
  assert.deepEqual([near.code, near.jours], ["cloture_proche", 11]);
  assert.equal(statut(bourse({ edition: { cloture: "2026-10-19", confirme: true } }), NOW).jours, 0); // le jour même : encore ouverte
  assert.equal(statut(bourse({ edition: { cloture: "2026-10-19" } }), NOW).code, "cloture_proche");
  const soon = statut(bourse({ edition: { ouverture: "2026-11-15", cloture: "2027-01-15", confirme: true } }), NOW);
  assert.deepEqual([soon.code, soon.jours], ["a_venir", 27]);
  const old = statut(bourse({ edition: { ouverture: "2026-03-01", cloture: "2026-10-05", confirme: true } }), NOW);
  assert.deepEqual([old.code, old.jours], ["expiree", -14]);
});

test("ouverte sans date de clôture publiée : ouverte, sans échéance inventée, classée après les échéances datées", () => {
  const s = statut(bourse({ edition: { ouverture: "2026-09-11", confirme: true } }), NOW);
  assert.deepEqual([s.code, s.jours, s.cloture, s.sans_cloture], ["ouverte", null, null, true]);
  const mk = (id, edition) => {
    const b = bourse({ id, nom: id, edition });
    return { ...b, statut: statut(b, NOW) };
  };
  assert.deepEqual(trier([mk("sans-cloture", { ouverture: "2026-09-11" }), mk("datee", { cloture: "2027-03-01" })]).map((b) => b.id), ["datee", "sans-cloture"]);
});

test("une bourse expirée annonce sa relance probable d'après le cycle", () => {
  const s = statut(bourse({ edition: { cloture: "2026-10-05", confirme: true } }), NOW);
  assert.deepEqual(s.relance, { annee: 2027, mois: 8 }); // le premier mois d'ouverture qui suit octobre 2026
  assert.deepEqual(prochaineOuverture({ ouverture_mois: "août–septembre" }, new Date("2026-08-15")), { annee: 2026, mois: 9 });
  assert.deepEqual(prochaineOuverture({ ouverture_mois: "janvier" }, new Date("2026-10-19")), { annee: 2027, mois: 1 });
  assert.equal(prochaineOuverture(null, NOW), null);
  assert.equal(statut(bourse({ cycle: undefined, edition: { cloture: "2026-10-05" } }), NOW).relance, null);
});

test("sans date d'édition : attendue d'après le cycle, sinon inconnue ; une date non confirmée reste probable", () => {
  const a = statut(bourse(), NOW);
  assert.equal(a.code, "attendue");
  assert.equal(a.probable, true);
  assert.equal(statut(bourse({ cycle: { type: "unique" } }), NOW).code, "inconnue");
  assert.equal(statut(bourse({ edition: { cloture: "2026-12-01" } }), NOW).probable, true);
  assert.equal(statut(bourse({ edition: { cloture: "2026-12-01", confirme: true } }), NOW).probable, false);
});

test("tri : la clôture la plus proche d'abord, puis ouvertes, à venir, attendues, expirées, inconnues", () => {
  const mk = (id, edition, cycle) => {
    const b = bourse({ id, nom: id, edition, ...(cycle !== undefined ? { cycle } : {}) });
    return { ...b, statut: statut(b, NOW) };
  };
  const list = [
    mk("expiree-hier", { cloture: "2026-10-18" }),
    mk("inconnue", {}, { type: "unique" }),
    mk("ouverte-lointaine", { cloture: "2027-02-01" }),
    mk("proche-3j", { cloture: "2026-10-22" }),
    mk("a-venir", { ouverture: "2026-11-01", cloture: "2027-01-01" }),
    mk("proche-10j", { cloture: "2026-10-29" }),
    mk("attendue", {}),
    mk("expiree-ancienne", { cloture: "2026-06-01" }),
  ];
  assert.deepEqual(trier(list).map((b) => b.id), ["proche-3j", "proche-10j", "ouverte-lointaine", "a-venir", "attendue", "expiree-hier", "expiree-ancienne", "inconnue"]);
});

test("branches et filières : « tous » vaut pour toutes ; une filière appartient à sa branche", () => {
  assert.deepEqual(branchesOf(bourse()), ["sciences", "lettres"]);
  assert.deepEqual(branchesOf(bourse({ domaines: ["droit-politique", "histoire-geographie"] })), ["lettres"]);
  assert.deepEqual(branchesOf(bourse({ domaines: ["maths", "droit-politique"] })), ["sciences", "lettres"]);
  const list = [
    bourse({ id: "tous", domaines: ["tous"] }),
    bourse({ id: "droit", domaines: ["droit-politique"], niveaux: ["master", "doctorat"] }),
    bourse({ id: "maths", domaines: ["maths"], niveaux: ["licence"], pays_accueil: ["France"] }),
  ];
  const ids = (f) => filtrer(list, f).map((b) => b.id);
  assert.deepEqual(ids({ branche: "lettres" }), ["tous", "droit"]);
  assert.deepEqual(ids({ branche: "sciences" }), ["tous", "maths"]);
  assert.deepEqual(ids({ domaine: "droit-politique" }), ["tous", "droit"]);
  assert.deepEqual(ids({ branche: "lettres", niveau: "doctorat" }), ["droit"]);
  assert.deepEqual(ids({ pays: "France" }), ["maths"]);
  assert.deepEqual(ids({}), ["tous", "droit", "maths"]);
});

test("contrôle des valeurs d'une bourse", () => {
  const ok = { id: "x", fr: { nom: "X" }, en: { nom: "X" }, niveaux: ["master"], domaines: ["tous"], cycle: { type: "annuelle" }, edition: { ouverture: "2026-09-01", cloture: "2026-10-01" }, cameroun: "oui", lien_officiel: "https://exemple.org" };
  assert.doesNotThrow(() => checkBourse(ok));
  assert.throws(() => checkBourse({ ...ok, niveaux: ["bac"] }), /niveaux/);
  assert.throws(() => checkBourse({ ...ok, domaines: ["magie"] }), /domaines/);
  assert.throws(() => checkBourse({ ...ok, cycle: { type: "souvent" } }), /cycle/);
  assert.throws(() => checkBourse({ ...ok, edition: { cloture: "1er octobre" } }), /AAAA-MM-JJ/);
  assert.throws(() => checkBourse({ ...ok, edition: { ouverture: "2026-11-01", cloture: "2026-10-01" } }), /ouverture/);
  assert.throws(() => checkBourse({ ...ok, lien_officiel: "javascript:alert(1)" }), /lien/);
  assert.throws(() => checkBourse({ ...ok, cameroun: "peut-etre" }), /cameroun/);
});
