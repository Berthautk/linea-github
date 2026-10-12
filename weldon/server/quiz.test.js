// Tests de l'entraînement : tirages reproductibles, carnet d'erreurs et révisions espacées.
import { test } from "node:test";
import assert from "node:assert/strict";
import { INTERVALS, addDays, pickDaily, pickSeries, pickBlanc, emptyQuiz, recordAnswer, dueIds, streak, rng, seedFrom } from "./quiz.js";

const THEMES = ["histoire", "geographie", "maths", "logique"];
const bank = THEMES.flatMap((t) => Array.from({ length: 12 }, (_, i) => ({ id: `${t}-${i}`, theme: t, niveau: ["facile", "moyen", "difficile"][i % 3] })));

test("le quiz du jour est le même toute la journée, différent d'un jour à l'autre", () => {
  const a = pickDaily(bank, "2026-10-12");
  assert.deepEqual(a, pickDaily(bank, "2026-10-12"));
  assert.notDeepEqual(a, pickDaily(bank, "2026-10-13"));
  assert.equal(a.length, 5);
  assert.equal(new Set(a).size, 5);
  assert.equal(new Set(a.map((id) => id.split("-")[0])).size, 4); // les 4 thèmes d'abord
});

test("séries par thème et par niveau", () => {
  const s = pickSeries(bank, { theme: "maths", n: 10 }, rng(1));
  assert.equal(s.length, 10);
  assert.ok(s.every((id) => id.startsWith("maths")));
  const f = pickSeries(bank, { niveau: "facile", n: 100 }, rng(2));
  assert.equal(f.length, 16);
  assert.equal(pickSeries(bank, { theme: "inconnu" }).length, 0);
});

test("le concours blanc répartit les thèmes", () => {
  const ids = pickBlanc(bank, 20, rng(3));
  assert.equal(ids.length, 20);
  const per = {};
  for (const id of ids) per[id.split("-")[0]] = (per[id.split("-")[0]] || 0) + 1;
  assert.ok(Object.values(per).every((n) => n === 5));
  assert.equal(pickBlanc(bank, 999).length, bank.length);
});

test("carnet d'erreurs : une erreur revient le lendemain puis s'espace", () => {
  const q = { id: "maths-1", theme: "maths" };
  const quiz = emptyQuiz();
  recordAnswer(quiz, q, false, "2026-10-12");
  assert.deepEqual(quiz.carnet["maths-1"], { box: 0, due: "2026-10-13", wrong: 1 });
  assert.deepEqual(dueIds(quiz, "2026-10-12"), []);
  assert.deepEqual(dueIds(quiz, "2026-10-13"), ["maths-1"]);
  recordAnswer(quiz, q, true, "2026-10-13");
  assert.equal(quiz.carnet["maths-1"].due, addDays("2026-10-13", INTERVALS[1]));
  recordAnswer(quiz, q, false, "2026-10-15"); // une nouvelle erreur remet à zéro
  assert.equal(quiz.carnet["maths-1"].box, 0);
  assert.equal(quiz.carnet["maths-1"].wrong, 2);
  let day = "2026-10-16";
  for (let i = 0; i < INTERVALS.length; i++) {
    recordAnswer(quiz, q, true, day);
    day = addDays(day, 20);
  }
  assert.ok(!("maths-1" in quiz.carnet), "maîtrisée après 5 réussites d'affilée");
  assert.deepEqual(quiz.stats.maths, { ok: 6, ko: 2 });
});

test("une bonne réponse sur une question jamais ratée ne crée rien dans le carnet", () => {
  const quiz = emptyQuiz();
  recordAnswer(quiz, { id: "x-1", theme: "x" }, true, "2026-10-12");
  assert.deepEqual(quiz.carnet, {});
  assert.deepEqual(quiz.days, ["2026-10-12"]);
});

test("série de jours actifs", () => {
  assert.equal(streak([], "2026-10-12"), 0);
  assert.equal(streak(["2026-10-10", "2026-10-11", "2026-10-12"], "2026-10-12"), 3);
  assert.equal(streak(["2026-10-10", "2026-10-11"], "2026-10-12"), 2); // pas encore joué aujourd'hui : la série tient
  assert.equal(streak(["2026-10-09", "2026-10-11"], "2026-10-12"), 1);
  assert.equal(streak(["2026-10-08"], "2026-10-12"), 0);
});

test("le générateur est reproductible", () => {
  assert.equal(rng(seedFrom("a"))(), rng(seedFrom("a"))());
  assert.notEqual(rng(seedFrom("a"))(), rng(seedFrom("b"))());
});
