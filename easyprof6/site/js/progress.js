// Progression d'une classe : leçons prévues (fiche nationale), date prévue de chacune, où en est l'enseignant, leçon à proposer.
// Fonctions pures (aucune dépendance à l'écran).
import { PROG, PARTS, SXW, SXYEAR } from './progressions.js';
import { BRANCHES } from './syllabus.js';
import { addDays, mondayOf, diffDays } from './dates.js';

const LEVELS = ['form 1', 'form 2', 'form 3', 'form 4', 'form 5', 'lower sixth', 'upper sixth'];
/** Niveau d'une classe d'après son nom (« Form 3 A », « Lower Sixth Arts »…). */
export function levelOfName(name) {
  const n = String(name || '').toLowerCase();
  if (/lower\s*sixth|\bl6|\blsa\b/.test(n)) return 'lower sixth'; if (/upper\s*sixth|\bu6|\busa\b/.test(n)) return 'upper sixth';
  const m = /form\s*([1-5])/.exec(n) || /\b(?:geo\s*)?([1-5])\s*[a-z]?\b/.exec(n); return m ? 'form ' + m[1] : '';
}
export const isSixthLevel = (l) => l === 'lower sixth' || l === 'upper sixth';
export { LEVELS };

/** Lundi de la semaine n du trimestre k (1, 2, 3) : on compte les semaines où il y a cours (vacances sautées). */
export function weekMonday(ctx, code) {
  const m = /^T(\d)W(\d+)$/.exec(code || ''); if (!m) return '';
  const term = ctx.terms[+m[1] - 1]; if (!term) return '';
  let d = mondayOf(term.start), k = 0;
  for (let i = 0; i < 60 && d <= term.end; i++, d = addDays(d, 7)) {
    const teach = [0, 1, 2, 3, 4].some(j => { const x = addDays(d, j); return x >= term.start && x <= term.end && !ctx.off.has(x); });
    if (teach && ++k === +m[2]) return d;
  }
  return '';
}

/** Les parties de programme proposées pour un niveau (Form 5 : Human Geography / Cameroon Geography + Map reading). */
export const partsOf = (level) => Object.entries(PARTS[level] || {}).map(([id, p]) => ({ id, label: p.fr, lessons: p.l.length, pw: p.p.length }));

/** Liste ordonnée de ce que l'enseignant doit faire dans cette classe : [{ k, n, t, code, date, branch? }].
 *  Forms : la fiche du niveau (a.level, sinon celui de la classe), éventuellement une partie, à partir de la leçon n0.
 *  Sixth : les sous-branches cochées, numérotées à la suite (1, 2, 3… comme dans la saisie). */
export function planOf(ctx, a, cls) {
  if (!a) return [];
  const level = a.level || levelOfName(cls && cls.name), shift = a.start && a.start > ctx.ys ? diffDays(ctx.ys, a.start) : 0;
  const when = (code) => { const d = weekMonday(ctx, code); return d && shift ? addDays(d, shift) : d; };
  const ids = String(a.sbs || '').split(',').filter(Boolean);
  if (isSixthLevel(levelOfName(cls && cls.name)) && ids.length) {
    const out = []; let i = 0;
    for (const id of ids) {
      const b = BRANCHES.find(x => x.id === id); if (!b) continue;
      for (const [num, title] of b.items.l) { i++; const code = (SXW[id] || {})[num] || ''; out.push({ k: 'l', n: i, num, t: title, branch: b.en, code, date: when(code), sheet: SXYEAR[id] }); }
    }
    const n0 = +a.n0 || 0; return n0 > 1 ? out.filter(x => x.n >= n0) : out;
  }
  const list = PROG[level]; if (!list) return [];
  const part = a.part && PARTS[level] && PARTS[level][a.part];
  const n0 = +a.n0 || 0;
  return list.filter(x => (!part || (x.k === 'l' ? part.l.includes(x.n) : x.k === 'p' ? part.p.includes(x.n) : false)) && (x.k !== 'l' || !(n0 > 1) || x.n >= n0))
    .map(x => ({ k: x.k, n: x.n, t: x.t, code: x.w, date: when(x.w), module: x.m }));
}

/** Titre d'une leçon / d'un TP pour cette affectation. */
export function titleOf(ctx, a, cls, kind, n) {
  const it = planOf(ctx, a, cls).find(x => x.k === kind && x.n === +n);
  return it ? (it.branch ? it.branch + ' · ' : '') + it.t : '';
}

/** Ce que l'enseignant a déjà fait dans cette classe : leçons terminées, leçon en cours (commencée, pas terminée). */
export function doneOf(ctx, tid, classId) {
  const es = (ctx.byTeacher[tid] || []).filter(e => e.classId === classId && e.type === 'lesson' && e.n != null).sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : (x.u || 0) - (y.u || 0)));
  const done = new Set(), first = {}, last = {};
  for (const e of es) { if (e.done !== false) done.add(e.n); if (!first[e.n]) first[e.n] = e.date; last[e.n] = e.date; }
  const open = es.filter(e => !done.has(e.n)).map(e => e.n);
  return { done, inProgress: open.length ? open[open.length - 1] : null, first, last };
}

/** Leçon à proposer à la saisie : celle en cours, sinon la première leçon non faite de la progression. */
export function suggestLesson(ctx, tid, classId) {
  const a = ctx.assign.find(x => x.teacherId === tid && x.classId === classId), cls = ctx.cls(classId);
  const d = doneOf(ctx, tid, classId), plan = planOf(ctx, a, cls).filter(x => x.k === 'l');
  if (d.inProgress != null) { const it = plan.find(x => x.n === d.inProgress); return { n: d.inProgress, t: it ? (it.branch ? it.branch + ' · ' : '') + it.t : '', date: it ? it.date : '', started: d.first[d.inProgress], inProgress: true }; }
  const next = plan.find(x => !d.done.has(x.n));
  if (next) return { n: next.n, t: (next.branch ? next.branch + ' · ' : '') + next.t, date: next.date, inProgress: false };
  const max = Math.max(0, ...d.done, a && +a.n0 > 1 ? +a.n0 - 1 : 0);
  return { n: max + 1, t: '', date: '', inProgress: false };
}

/** Où en est l'enseignant dans cette classe, par rapport à la fiche : retard ou avance, en leçons. */
export function whereAmI(ctx, tid, classId, today = ctx.today) {
  const a = ctx.assign.find(x => x.teacherId === tid && x.classId === classId), cls = ctx.cls(classId);
  const plan = planOf(ctx, a, cls).filter(x => x.k === 'l'); if (!plan.length) return null;
  const d = doneOf(ctx, tid, classId);
  const dated = plan.filter(x => x.date), sixthOther = plan.some(x => x.sheet) && cls && levelOfName(cls.name) !== (plan[0].sheet === 'ls' ? 'lower sixth' : 'upper sixth');
  const expectedIdx = dated.length ? plan.indexOf(dated.filter(x => x.date <= today).pop() || null) : -1;
  let doneIdx = -1; plan.forEach((x, i) => { if (d.done.has(x.n)) doneIdx = i; });
  const cur = d.inProgress != null ? plan.find(x => x.n === d.inProgress) : null;
  const curIdx = cur ? plan.indexOf(cur) : doneIdx;
  const gap = expectedIdx - Math.max(doneIdx, cur ? curIdx - 0.5 : -1);   // une leçon en cours compte pour une demie
  const status = sixthOther || expectedIdx < 0 ? 'none' : gap >= 1 ? 'late' : gap <= -1 ? 'ahead' : 'ok';
  return { expected: expectedIdx >= 0 ? plan[expectedIdx] : null, last: doneIdx >= 0 ? plan[doneIdx] : null, current: cur, status, gap: Math.round(Math.abs(gap)), total: plan.length, done: plan.filter(x => d.done.has(x.n)).length };
}

/* ---------- évaluations par séquence ---------- */
export const seqTerm = (seq) => Math.ceil((+seq || 0) / 2);   // séquences 1-2 → 1er trimestre, 3-4 → 2e, 5-6 → 3e
const sumRes = (r) => ({ cf: +r.cf || 0, cg: +r.cg || 0, pf: +r.pf || 0, pg: +r.pg || 0, rf: +r.rf || 0, rg: +r.rg || 0 });
/** Résultats par classe et par séquence : la dernière remédiation saisie (sinon l'évaluation, sans les réussites). */
export function seqResults(ctx, { from, to } = {}) {
  const best = {};
  for (const e of ctx.entries) {
    if (!e.seq || !e.res || !e.classId || (e.type !== 'correction' && e.type !== 'assessment')) continue;
    if ((from && e.date < from) || (to && e.date > to)) continue;
    const k = e.classId + '|' + e.seq, cur = best[k], rank = (x) => (x.type === 'correction' ? 1 : 0);
    if (!cur || rank(e) > rank(cur) || (rank(e) === rank(cur) && (e.date > cur.date || (e.date === cur.date && (e.u || 0) > (cur.u || 0))))) best[k] = e;
  }
  const out = {};
  for (const [k, e] of Object.entries(best)) { const [cid, seq] = k.split('|'); (out[cid] = out[cid] || {})[seq] = { ...sumRes(e.res), remed: e.type === 'correction', date: e.date }; }
  return out;
}
/** Cumul de plusieurs séquences d'une classe (trimestre = ses deux séquences). */
export function cumulate(list) {
  const t = { cf: 0, cg: 0, pf: 0, pg: 0, rf: 0, rg: 0, n: 0, remed: 0 };
  for (const r of list) { if (!r) continue; for (const k of ['cf', 'cg', 'pf', 'pg', 'rf', 'rg']) t[k] += r[k]; t.n++; if (r.remed) t.remed++; }
  const comp = t.pf + t.pg, pass = t.rf + t.rg;
  return { ...t, comp, pass, size: t.cf + t.cg, rate: t.remed && comp ? Math.round(pass / comp * 1000) / 10 : null, rateF: t.remed && t.pf ? Math.round(t.rf / t.pf * 1000) / 10 : null, rateG: t.remed && t.pg ? Math.round(t.rg / t.pg * 1000) / 10 : null };
}

/** Semaine d'évaluation en cours (définie par l'animateur), ou null. */
export function evalWeekOf(ctx, iso = ctx.today) {
  return evalWeeks(ctx).find(w => w.f && iso >= w.f && iso <= (w.t || w.f)) || null;
}
/** Les semaines d'évaluation de l'année (celles réglées par l'animateur, sinon le calendrier harmonisé 2026/2027). */
export function evalWeeks(ctx) {
  return Array.isArray(ctx.dept.evalWeeks) ? ctx.dept.evalWeeks : String(ctx.dept.year || '').startsWith('2026') ? DEFAULT_EVAL_WEEKS : [];
}
/** Semaines d'évaluation harmonisées 2026/2027 proposées par défaut (modifiables dans Réglages). */
export const DEFAULT_EVAL_WEEKS = [
  { seq: 1, f: '2026-10-12', t: '2026-10-16' }, { seq: 2, f: '2026-11-23', t: '2026-11-27' }, { seq: 3, f: '2027-01-18', t: '2027-01-22' },
  { seq: 4, f: '2027-03-01', t: '2027-03-05' }, { seq: 5, f: '2027-03-22', t: '2027-03-25' }, { seq: 6, f: '2027-05-24', t: '2027-05-28' },
];
