// Plan à rebours : de la date du concours vers aujourd'hui, par semaines, avec des séances de 25 minutes.
// Fonction pure, testée dans plan.test.js. Les textes (consignes) sont dans l'interface ; ici, des codes.

import { addDays } from "./quiz.js";

export const HOURS = [3, 5, 8, 12]; // heures de travail par semaine
export const SESSION_MIN = 25;
export const BASE_THEMES = ["histoire", "geographie", "institutions", "civisme", "sciences", "logique"];

const days = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

// Thèmes d'entraînement et travail d'écriture d'après les matières du concours.
export function subjectThemes(matieres = [], lang = "fr") {
  const themes = new Set();
  let writing = false;
  for (const m of matieres) {
    const s = String(m).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    if (/culture|general|knowledge|histoire|geograph|civique|droit|institution/.test(s)) BASE_THEMES.slice(0, 5).forEach((t) => themes.add(t));
    if (/redaction|essay|disserta|composition|expression ecrite/.test(s)) writing = true;
    if (/math|calcul|arithm/.test(s)) themes.add("maths");
    if (/logique|logic|raisonnement|psychotechn/.test(s)) themes.add("logique");
    if (/francais|french/.test(s)) themes.add(lang === "en" ? "langue2" : "langue1");
    if (/anglais|english/.test(s)) themes.add(lang === "en" ? "langue1" : "langue2");
  }
  if (!themes.size) BASE_THEMES.forEach((t) => themes.add(t));
  return { themes: [...themes], writing };
}

export function planMode(daysLeft) {
  return daysLeft >= 56 ? "normal" : daysLeft >= 30 ? "court" : daysLeft >= 14 ? "urgence30" : "urgence14";
}

// weak : thèmes du plus faible au plus fort (d'après les statistiques de l'élève)
export function buildPlan({ examDate, today, hours, themes, writing = false, papers = [], weak = [] }) {
  const left = days(today, examDate);
  if (left < 1) return null;
  const mode = planMode(left);
  const perWeek = Math.max(4, Math.round((hours * 60) / SESSION_MIN));
  const focusThemes = [...themes].sort((a, b) => (weak.includes(a) ? weak.indexOf(a) : 99) - (weak.includes(b) ? weak.indexOf(b) : 99));
  const nWeeks = Math.ceil(left / 7);
  const weeks = [];
  let paper = 0;
  for (let w = 0; w < nWeeks; w++) {
    const from = addDays(today, w * 7);
    const weekEnd = addDays(today, w * 7 + 6);
    const beforeExam = addDays(examDate, -1); // aucune séance le jour J
    const last = weekEnd < beforeExam ? weekEnd : beforeExam;
    const span = days(from, last) + 1;
    const p = nWeeks === 1 ? 1 : w / (nWeeks - 1);
    const final = w === nWeeks - 1;
    const phase = final ? "final" : mode.startsWith("urgence") ? (p < 0.5 ? "entrainement" : "simulation") : p < 0.4 ? "bases" : p < 0.8 ? "entrainement" : "simulation";

    const kinds = [];
    const revisions = final ? 3 : 2;
    for (let i = 0; i < revisions; i++) kinds.push({ kind: "revision" });
    if (phase === "simulation" || phase === "final" || (phase === "entrainement" && w % 2 === 1)) {
      if (papers.length) kinds.push({ kind: "epreuve", epreuve: papers[paper++ % papers.length], minutes: 120 });
      kinds.push({ kind: "blanc", minutes: 40 });
    }
    if (writing && phase !== "bases" && !final) kinds.push({ kind: "redaction", minutes: 60 });
    // Le reste : séances par thème, en insistant sur les thèmes faibles (poids 2 pour les trois plus faibles)
    const pool = focusThemes.flatMap((t, i) => (i < 3 && weak.includes(t) ? [t, t] : [t]));
    const rest = Math.max(1, perWeek - kinds.length * (final ? 1 : 1));
    const quizSessions = final ? Math.min(rest, 4) : rest;
    for (let i = 0; i < quizSessions; i++) kinds.push({ kind: "quiz_theme", theme: pool[(w * 3 + i) % pool.length], minutes: SESSION_MIN });
    // Répartition sur les jours de la semaine (le dernier jour de chaque semaine pleine est un jour de repos)
    const usable = span === 7 && !final ? 6 : span;
    const sessions = kinds.map((k, i) => ({ day: addDays(from, i % usable), ...k })).sort((a, b) => a.day.localeCompare(b.day));
    weeks.push({ n: w + 1, from, to: last, phase, focus: focusThemes.slice(0, 3), sessions });
  }
  return { days_left: left, mode, weeks };
}
