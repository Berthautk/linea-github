// Tests de la lecture des périodes (calendrier) et de la veille (extraction des annonces).
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMois, moisOf } from "./calendar.js";
import { extractCandidates, robotsAllows } from "../tools/veille/extract.js";

test("périodes en toutes lettres", () => {
  assert.deepEqual(parseMois("juin–juillet"), [6, 7]);
  assert.deepEqual(parseMois("novembre–janvier"), [1, 11, 12]);
  assert.deepEqual(parseMois("février"), [2]);
  assert.deepEqual(parseMois("septembre à octobre"), [9, 10]);
  assert.deepEqual(parseMois("mi-juin à début août"), [6, 7, 8]);
  assert.deepEqual(parseMois("mars, juin et septembre"), [3, 6, 9]);
  assert.deepEqual(parseMois("Août - Septembre"), [8, 9]);
  assert.deepEqual(parseMois("March to May"), [3, 4, 5]);
  assert.deepEqual(parseMois("décembre"), [12]);
  assert.deepEqual(parseMois(null), []);
  assert.deepEqual(parseMois("selon l'arrêté"), []);
});

test("périodes d'un concours", () => {
  assert.deepEqual(moisOf({ mois_lancement: "juin–juillet", mois_epreuves: "septembre" }), { lancement: [6, 7], depot: [], epreuves: [9] });
  assert.equal(moisOf({ marque: "probable" }), null);
  assert.equal(moisOf(null), null);
});

const PAGE = `
  <a href="/category/concours/">Concours</a>
  <a href="/2026/09/29/concours-ius/">Concours d&rsquo;entrée à l&#039;IUS, à l’INUBIL et au CEFR.</a>
  <a href="https://x.cm/wp-content/Concours_CEFR.pdf">Concours_CEFR_IUBC_L1</a>
  <a href="/2026/10/01/a/">Recrutement de 500 élèves gardiens de la paix</a>
  <a href="/2026/10/01/a/#top">Recrutement de 500 élèves gardiens de la paix</a>
  <a href="/category/resultats/">Résultats des concours de la session</a>
  <a href="javascript:void(0)">Avis de concours à ne pas suivre ici</a>
  <a href="/contact">Nous contacter pour toute question</a>`;

test("la veille repère les annonces et ignore le bruit", () => {
  const r = extractCandidates(PAGE, "https://www.exemple.cm/accueil/");
  assert.deepEqual(r.map((x) => x.url), ["https://www.exemple.cm/2026/09/29/concours-ius/", "https://www.exemple.cm/2026/10/01/a/"]);
  assert.equal(r[0].titre, "Concours d’entrée à l'IUS, à l’INUBIL et au CEFR.");
  assert.equal(extractCandidates(PAGE, "https://www.exemple.cm/", { max: 1 }).length, 1);
});

test("robots.txt : le groupe * décide", () => {
  assert.equal(robotsAllows("User-agent: *\nDisallow: /wp-admin/\n", "/index.php/category/concours/"), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /\n", "/x"), false);
  assert.equal(robotsAllows("User-agent: autre\nDisallow: /\n\nUser-agent: *\nAllow: /\n", "/x"), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /prive\n", "/prive/a"), false);
  assert.equal(robotsAllows("", "/x"), true);
});
