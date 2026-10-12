// Tests du plan à rebours.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan, subjectThemes, planMode, BASE_THEMES } from "./plan.js";

const base = { today: "2026-10-12", hours: 5, themes: BASE_THEMES.slice(0, 5), writing: true, papers: ["p1", "p2"] };

test("matières du concours → thèmes", () => {
  assert.deepEqual(subjectThemes(["Rédaction", "Culture générale"]).writing, true);
  assert.deepEqual(subjectThemes(["Culture générale"]).themes, ["histoire", "geographie", "institutions", "civisme", "sciences"]);
  assert.deepEqual(subjectThemes(["Mathématiques", "Logique"]).themes, ["maths", "logique"]);
  assert.deepEqual(subjectThemes(["Anglais", "Français"], "fr").themes.sort(), ["langue1", "langue2"]);
  assert.deepEqual(subjectThemes(["French"], "en").themes, ["langue2"]);
  assert.deepEqual(subjectThemes([]).themes, BASE_THEMES); // matières inconnues : culture générale et logique
  assert.deepEqual(subjectThemes(["Épreuve de sport"]).themes, BASE_THEMES);
});

test("mode selon le temps restant", () => {
  assert.equal(planMode(120), "normal");
  assert.equal(planMode(56), "normal");
  assert.equal(planMode(40), "court");
  assert.equal(planMode(20), "urgence30");
  assert.equal(planMode(5), "urgence14");
});

test("plan à rebours : semaines, phases, dernière semaine", () => {
  const p = buildPlan({ ...base, examDate: "2027-02-01" }); // 112 jours
  assert.equal(p.days_left, 112);
  assert.equal(p.mode, "normal");
  assert.equal(p.weeks.length, 16);
  assert.equal(p.weeks[0].phase, "bases");
  assert.equal(p.weeks[0].from, "2026-10-12");
  assert.equal(p.weeks.at(-1).phase, "final");
  assert.ok(p.weeks.some((w) => w.phase === "entrainement") && p.weeks.some((w) => w.phase === "simulation"));
  // Les phases s'enchaînent dans l'ordre
  const order = { bases: 0, entrainement: 1, simulation: 2, final: 3 };
  for (let i = 1; i < p.weeks.length; i++) assert.ok(order[p.weeks[i].phase] >= order[p.weeks[i - 1].phase]);
});

test("aucune séance le jour J ni après, jours croissants dans chaque semaine", () => {
  for (const examDate of ["2026-10-13", "2026-10-20", "2026-11-30", "2027-03-15"]) {
    const p = buildPlan({ ...base, examDate });
    for (const w of p.weeks) {
      const ds = w.sessions.map((s) => s.day);
      assert.deepEqual(ds, [...ds].sort());
      assert.ok(ds.every((d) => d >= w.from && d < examDate), `${examDate}: séance hors période`);
    }
  }
});

test("charge hebdomadaire : séances de 25 minutes selon les heures disponibles", () => {
  const w3 = buildPlan({ ...base, hours: 3, examDate: "2027-02-01" }).weeks[0];
  const w12 = buildPlan({ ...base, hours: 12, examDate: "2027-02-01" }).weeks[0];
  assert.ok(w12.sessions.length > w3.sessions.length * 2);
  assert.ok(w3.sessions.some((s) => s.kind === "revision"));
  assert.ok(w3.sessions.filter((s) => s.kind === "quiz_theme").every((s) => s.minutes === 25));
});

test("les thèmes faibles reviennent plus souvent", () => {
  const p = buildPlan({ ...base, hours: 8, examDate: "2027-02-01", weak: ["civisme", "histoire"] });
  const count = {};
  for (const w of p.weeks.slice(0, 8)) for (const s of w.sessions) if (s.theme) count[s.theme] = (count[s.theme] || 0) + 1;
  assert.ok(count.civisme > count.sciences, JSON.stringify(count));
  assert.deepEqual(p.weeks[0].focus.slice(0, 2), ["civisme", "histoire"]);
});

test("urgence : peu de temps, les essentiels d'abord, blanc et épreuve", () => {
  const p = buildPlan({ ...base, examDate: "2026-10-22" }); // 10 jours
  assert.equal(p.mode, "urgence14");
  assert.equal(p.weeks.length, 2);
  const kinds = new Set(p.weeks.flatMap((w) => w.sessions.map((s) => s.kind)));
  assert.ok(kinds.has("blanc") && kinds.has("revision") && kinds.has("quiz_theme"));
  assert.ok(p.weeks.flatMap((w) => w.sessions).some((s) => s.kind === "epreuve"));
});

test("sans sujets disponibles, pas de séance d'épreuve", () => {
  const p = buildPlan({ ...base, papers: [], examDate: "2027-02-01" });
  assert.ok(!p.weeks.flatMap((w) => w.sessions).some((s) => s.kind === "epreuve"));
});

test("date passée ou jour même : pas de plan", () => {
  assert.equal(buildPlan({ ...base, examDate: "2026-10-12" }), null);
  assert.equal(buildPlan({ ...base, examDate: "2026-09-01" }), null);
});
