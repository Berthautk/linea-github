// Entraînement : tirage des questions, carnet d'erreurs et révisions espacées (méthode de Leitner).
// Fonctions pures, testées dans quiz.test.js.

// Intervalles de révision en jours : 1, 2, 4, 8, 16. Une question réussie 5 fois de suite sort du carnet.
export const INTERVALS = [1, 2, 4, 8, 16];

export const dayStr = (d = new Date()) => d.toISOString().slice(0, 10);
export function addDays(day, k) {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + k);
  return dayStr(d);
}

// Générateur pseudo-aléatoire reproductible : le quiz du jour est le même pour tout le monde.
export function seedFrom(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prend d'abord une question par thème (variété), puis complète.
function spread(list, n) {
  const seen = new Set();
  const first = [];
  const rest = [];
  for (const q of list) (seen.has(q.theme) ? rest : first).push(q) && seen.add(q.theme);
  return [...first, ...rest].slice(0, n);
}

export const pickDaily = (bank, day, n = 5) => spread(shuffle(bank, rng(seedFrom("daily:" + day))), n).map((q) => q.id);

export function pickSeries(bank, { theme, niveau, n = 10 }, rand = Math.random) {
  const pool = bank.filter((q) => (!theme || q.theme === theme) && (!niveau || q.niveau === niveau));
  return shuffle(pool, rand).slice(0, n).map((q) => q.id);
}

// Concours blanc : tous les thèmes à tour de rôle, pour un total de n questions.
export function pickBlanc(bank, n = 40, rand = Math.random) {
  const byTheme = {};
  for (const q of shuffle(bank, rand)) (byTheme[q.theme] ||= []).push(q);
  const lists = Object.values(byTheme);
  const out = [];
  for (let i = 0; out.length < n && lists.some((l) => l[i]); i++) for (const l of lists) if (l[i] && out.length < n) out.push(l[i].id);
  return shuffle(out, rand);
}

export const emptyQuiz = () => ({ daily: null, carnet: {}, stats: {}, days: [] });

// Enregistre une réponse : statistiques par thème, jour actif, carnet d'erreurs (Leitner).
export function recordAnswer(quiz, q, ok, today) {
  const st = (quiz.stats[q.theme] ||= { ok: 0, ko: 0 });
  st[ok ? "ok" : "ko"]++;
  if (!quiz.days.includes(today)) quiz.days = [...quiz.days, today].slice(-120);
  const entry = quiz.carnet[q.id];
  if (!ok) {
    quiz.carnet[q.id] = { box: 0, due: addDays(today, INTERVALS[0]), wrong: (entry?.wrong || 0) + 1 };
  } else if (entry) {
    const box = entry.box + 1;
    if (box >= INTERVALS.length) delete quiz.carnet[q.id]; // maîtrisée
    else quiz.carnet[q.id] = { ...entry, box, due: addDays(today, INTERVALS[box]) };
  }
}

export const dueIds = (quiz, today) =>
  Object.entries(quiz.carnet)
    .filter(([, e]) => e.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([id]) => id);

// Série de jours d'affilée jusqu'à aujourd'hui (ou hier : la série n'est pas perdue avant la fin de la journée).
export function streak(days, today) {
  const set = new Set(days);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}
