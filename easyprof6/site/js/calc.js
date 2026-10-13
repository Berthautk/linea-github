// Moteur de calcul EasyProf : heures dues / faites, leçons attendues (rythme), retards, périodes, fiche d'inspection.
// Fonctions pures : aucune dépendance à l'écran. `state` = { dept, teachers, classes, assign, regul, entries }.
import { dow, eachDay, addDays, minISO, maxISO, diffDays, mondayOf, monthStart, monthEnd, addMonths, todayISO } from './dates.js';
import { reasonOf, isLessonType, THRESHOLDS } from './consts.js';

export const r1 = (x) => Math.round(x * 10) / 10;
export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

/* ---------- contexte (index et calendrier) ---------- */
export function makeCtx(state, today = todayISO()) {
  const dept = state.dept || {};
  const terms = (dept.terms || []).filter(t => t.start && t.end).map(t => ({ ...t, last: t.last || t.end })).sort((a, b) => (a.start < b.start ? -1 : 1));
  const off = new Set();
  for (const r of dept.calendar || []) if (r.f) eachDay(r.f, r.t || r.f).forEach(d => off.add(d));
  const teachers = (state.teachers || []).filter(t => !t.deleted);
  const classes = (state.classes || []).filter(c => !c.deleted);
  const assign = (state.assign || []).filter(a => !a.deleted);
  const regul = (state.regul || []).filter(r => !r.deleted);
  const entries = (state.entries || []).filter(e => !e.deleted);
  const byTeacher = {}, abs = {};
  for (const e of entries) {
    (byTeacher[e.teacherId] = byTeacher[e.teacherId] || []).push(e);
    if (e.type === 'absence' && e.date) (abs[e.teacherId] = abs[e.teacherId] || {})[e.date] = e.reason || 'other';
  }
  const ys = terms.length ? terms[0].start : today;
  const ye = terms.length ? terms[terms.length - 1].last : today;
  const ctx = {
    dept, terms, off, teachers, classes, assign, regul, entries, byTeacher, abs, today, ys, ye, lh: +dept.lh || 2,
    teacher: (id) => teachers.find(t => t.id === id),
    cls: (id) => classes.find(c => c.id === id),
    termOf: (iso) => (terms.find(t => iso >= t.start && iso <= t.end) || {}).id || '',
    inWindow: (iso) => terms.some(t => iso >= t.start && iso <= t.last),
    reasonOut: (id) => (dept.dueOut && dept.dueOut[id] != null ? !!dept.dueOut[id] : reasonOf(id).out),
    _day: new Map(), _year: new Map(),
  };
  ctx.isTeaching = (iso) => dow(iso) !== 0 && ctx.inWindow(iso) && !off.has(iso);
  return ctx;
}

/* heures prévues par l'emploi du temps un jour donné : { classId: heures } */
function slotsOn(ctx, tid, iso) {
  const key = tid + '|' + iso;
  if (ctx._day.has(key)) return ctx._day.get(key);
  const t = ctx.teacher(tid), res = {}; let total = 0;
  const d = dow(iso), term = ctx.termOf(iso);
  for (const s of (t && t.slots) || []) {
    if (+s.d !== d) continue;
    if (s.tm && term && s.tm !== term) continue;
    if (s.only && s.only.length && !s.only.includes(iso)) continue;
    res[s.c] = (res[s.c] || 0) + (+s.h || 0); total += +s.h || 0;
  }
  const out = { byClass: res, total };
  ctx._day.set(key, out); return out;
}

/** Heures dues d'un enseignant sur [ps, pe] (emploi du temps − jours sans cours de l'établissement − jours « excusés »). */
export function dueRange(ctx, tid, ps, pe) {
  const out = { due: 0, excused: 0, absent: 0, closed: 0, byClass: {}, declared: [] };
  for (const iso of eachDay(ps, pe)) {
    if (dow(iso) === 0) continue;
    const { byClass, total } = slotsOn(ctx, tid, iso); if (!total) continue;
    if (!ctx.isTeaching(iso)) { if (ctx.inWindow(iso) && ctx.off.has(iso)) out.closed += total; continue; }
    const reason = (ctx.abs[tid] || {})[iso];
    if (reason && ctx.reasonOut(reason)) { out.excused += total; out.declared.push({ date: iso, reason, h: total, out: true }); continue; }
    out.due += total; for (const c in byClass) out.byClass[c] = (out.byClass[c] || 0) + byClass[c];
    if (reason) { out.absent += total; out.declared.push({ date: iso, reason, h: total, out: false }); }
  }
  return out;
}
function yearDue(ctx, tid) {
  if (!ctx._year.has(tid)) ctx._year.set(tid, dueRange(ctx, tid, ctx.ys, ctx.ye));
  return ctx._year.get(tid);
}

/** Part (0..1) d'une régularisation dans [ps,pe] (répartie sur sa plage de dates). */
function regulShare(r, ps, pe) {
  if (!r.d) return 0;
  const w1 = r.d, w2 = r.d2 && r.d2 > r.d ? r.d2 : r.d;
  const o1 = maxISO(w1, ps), o2 = minISO(w2, pe);
  return o2 < o1 ? 0 : (diffDays(o1, o2) + 1) / (diffDays(w1, w2) + 1);
}

/* ---------- ce que l'enseignant a saisi ---------- */
export function doneRange(ctx, tid, ps, pe) {
  const out = { hours: 0, lessons: new Set(), theory: new Set(), practical: new Set(), revisionH: 0, orientationH: 0, assessH: 0, digital: 0, evaluated: 0, passed: 0, byClass: {}, count: 0 };
  for (const e of ctx.byTeacher[tid] || []) {
    if (e.type === 'absence' || !e.date || e.date < ps || e.date > pe) continue;
    const h = (+e.minutes || 0) / 60; out.hours += h; out.count++;
    if (e.classId) { const b = (out.byClass[e.classId] = out.byClass[e.classId] || { hours: 0, theory: new Set(), practical: new Set() }); b.hours += h; if (e.type === 'lesson' && e.n != null) b.theory.add(e.n); if (e.type === 'practical' && e.n != null) b.practical.add(e.n); }
    if (e.type === 'lesson' && e.n != null) { out.lessons.add(e.classId + '|L|' + e.n); out.theory.add(e.classId + '|' + e.n); }
    else if (e.type === 'practical' && e.n != null) { out.lessons.add(e.classId + '|P|' + e.n); out.practical.add(e.classId + '|' + e.n); }
    else if (e.type === 'revision') out.revisionH += h;
    else if (e.type === 'orientation') out.orientationH += h;
    else if (e.type === 'assessment') out.assessH += h;
    if (e.digital) out.digital++;
    if (e.eval) { out.evaluated += +e.eval.evaluated || 0; out.passed += +e.eval.passed || 0; }
  }
  return out;
}

/* ---------- rythme des leçons ---------- */
/** Leçons attendues pour une affectation (enseignant × classe) sur [ps,pe], proportionnellement aux heures de cours de la période. */
function expectedLessons(ctx, a, ps, pe, dueCache) {
  const total = (+a.th || 0) + (+a.pr || 0); if (!total) return 0;
  const yr = yearDue(ctx, a.teacherId).byClass[a.classId] || 0; if (!yr) return 0;
  const part = (dueCache || dueRange(ctx, a.teacherId, ps, pe)).byClass[a.classId] || 0;
  return total * part / yr;
}
export function lagStatus(lag) { return lag <= -1.5 ? 'ahead' : lag <= 1 ? 'ok' : lag <= 3 ? 'slight' : 'late'; }

/** Avancement de chaque affectation d'un enseignant à une date (depuis la rentrée). */
export function classProgress(ctx, tid, asOf = ctx.today) {
  const cut = minISO(asOf, ctx.ye), due = dueRange(ctx, tid, ctx.ys, cut), done = doneRange(ctx, tid, ctx.ys, cut);
  const rows = [];
  const mine = ctx.assign.filter(a => a.teacherId === tid);
  const classIds = new Set([...mine.map(a => a.classId), ...Object.keys(done.byClass)]);
  for (const cid of classIds) {
    const a = mine.find(x => x.classId === cid) || { teacherId: tid, classId: cid, th: 0, pr: 0, hours: 0 };
    const cls = ctx.cls(cid); const d = done.byClass[cid] || { hours: 0, theory: new Set(), practical: new Set() };
    const exp = expectedLessons(ctx, a, ctx.ys, cut, due);
    let rl = 0, rh = 0; for (const r of ctx.regul) if (r.teacherId === tid && r.classId === cid) { const sh = regulShare(r, ctx.ys, cut); rl += (+r.lessons || 0) * sh; rh += (+r.h || 0) * sh; }
    const doneL = d.theory.size + d.practical.size + rl, total = (+a.th || 0) + (+a.pr || 0);
    const lag = r1(exp - doneL);
    rows.push({ classId: cid, name: cls ? cls.name : cid, plan: { th: +a.th || 0, pr: +a.pr || 0, hours: +a.hours || 0, total }, doneTh: d.theory.size, doneTP: d.practical.size, done: doneL,
      expected: r1(exp), lag, status: total ? lagStatus(lag) : 'none', hours: r1(d.hours + rh), hoursDue: r1(due.byClass[cid] || 0), progress: total ? pct(doneL, total) : 0, expectedPct: total ? pct(exp, total) : 0 });
  }
  return rows.sort((x, y) => (x.name < y.name ? -1 : 1));
}

/* ---------- statistiques d'une période ---------- */
function emptyStats(ps, pe, cut) {
  return { ps, pe, cut, dueFull: 0, due: 0, excused: 0, absent: 0, closed: 0, hours: 0, regul: 0, lessonsDone: 0, regulL: 0, theory: 0, practical: 0, lessonsPlanned: 0, planned: false, revisionH: 0, orientationH: 0, assessH: 0,
    digital: 0, evaluated: 0, passed: 0, entries: 0, planYear: { hours: 0, lessons: 0 }, declared: [] };
}
function teacherStats(ctx, tid, ps, pe) {
  const cut = minISO(pe, ctx.today);
  const full = dueRange(ctx, tid, ps, pe), now = pe > cut ? dueRange(ctx, tid, ps, cut) : full;
  const done = doneRange(ctx, tid, ps, pe);
  const S = emptyStats(ps, pe, cut);
  let regul = 0, regulL = 0; for (const r of ctx.regul) if (r.teacherId === tid) { const sh = regulShare(r, ps, pe); regul += (+r.h || 0) * sh; regulL += (+r.lessons || 0) * sh; }
  S.dueFull = full.due; S.due = now.due; S.excused = full.excused; S.absent = full.absent; S.closed = full.closed; S.declared = full.declared;
  S.regul = regul; S.hours = done.hours + regul; S.entries = done.count;
  S.regulL = regulL; S.lessonsDone = done.lessons.size + regulL; S.theory = done.theory.size; S.practical = done.practical.size;
  S.revisionH = done.revisionH; S.orientationH = done.orientationH; S.assessH = done.assessH; S.digital = done.digital; S.evaluated = done.evaluated; S.passed = done.passed;
  const mine = ctx.assign.filter(a => a.teacherId === tid);
  if (mine.length) { S.planned = true; for (const a of mine) S.lessonsPlanned += expectedLessons(ctx, a, ps, cut, now); }
  else S.lessonsPlanned = now.due / ctx.lh;
  const yd = yearDue(ctx, tid);
  S.planYear.hours = mine.reduce((s, a) => s + (+a.hours || 0), 0) || yd.due;
  S.planYear.lessons = mine.reduce((s, a) => s + (+a.th || 0) + (+a.pr || 0), 0) || yd.due / ctx.lh;
  return S;
}
const SUM = ['dueFull', 'due', 'excused', 'absent', 'closed', 'hours', 'regul', 'regulL', 'lessonsDone', 'theory', 'practical', 'lessonsPlanned', 'revisionH', 'orientationH', 'assessH', 'digital', 'evaluated', 'passed', 'entries'];

/** Statistiques sur [ps,pe] pour un enseignant (tid) ou pour tout le département (tid = null). */
export function stats(ctx, tid, ps, pe) {
  let S;
  if (tid) S = teacherStats(ctx, tid, ps, pe);
  else {
    S = emptyStats(ps, pe, minISO(pe, ctx.today));
    for (const t of ctx.teachers) {
      const x = teacherStats(ctx, t.id, ps, pe);
      for (const k of SUM) S[k] += x[k];
      S.planned = S.planned || x.planned; S.planYear.hours += x.planYear.hours; S.planYear.lessons += x.planYear.lessons; S.declared = S.declared.concat(x.declared.map(d => ({ ...d, teacherId: t.id })));
    }
  }
  for (const k of ['hours', 'due', 'dueFull', 'lessonsPlanned', 'lessonsDone', 'excused', 'absent', 'closed', 'revisionH', 'orientationH', 'assessH', 'regul', 'regulL']) S[k] = r1(S[k]);
  S.gap = r1(S.hours - S.due); S.rate = pct(S.hours, S.due);
  S.lessonGap = r1(S.lessonsDone - S.lessonsPlanned); S.rateL = pct(S.lessonsDone, S.lessonsPlanned);
  S.rateYH = pct(S.hours, S.planYear.hours); S.rateYL = pct(S.lessonsDone, S.planYear.lessons);
  S.successRate = S.evaluated ? pct(S.passed, S.evaluated) : null;
  S.alerts = [];
  if (S.due > 0 && S.rate < THRESHOLDS.hours) S.alerts.push({ kind: 'hours', value: S.rate, threshold: THRESHOLDS.hours });
  if (S.lessonsPlanned > 0 && S.rateL < THRESHOLDS.lessons) S.alerts.push({ kind: 'lessons', value: S.rateL, threshold: THRESHOLDS.lessons });
  if (S.successRate != null && S.successRate < THRESHOLDS.success) S.alerts.push({ kind: 'success', value: S.successRate, threshold: THRESHOLDS.success });
  return S;
}

/** État global en un mot (pour une pastille) : fondé sur les taux, donc valable pour un enseignant comme pour tout le département. */
export function overall(S) {
  if (!S.due && !S.lessonsPlanned) return 'none';
  const hasL = S.lessonsPlanned >= 1;
  if ((S.due > 0 && S.rate < THRESHOLDS.hours) || (hasL && S.rateL < THRESHOLDS.lessons)) return 'late';
  const worst = Math.min(S.due ? S.rate : 100, hasL ? S.rateL : 100);
  if (worst < 90) return 'slight';
  if (hasL && S.rateL >= 110 && (!S.due || S.rate >= 100)) return 'ahead';
  return 'ok';
}

/* ---------- périodes ---------- */
export function periodOf(ctx, kind, anchor, custom) {
  const a = anchor || ctx.today;
  if (kind === 'week') { const ps = mondayOf(a); return { kind, ps, pe: addDays(ps, 5) }; }
  if (kind === 'month') return { kind, ps: monthStart(a), pe: monthEnd(a) };
  if (kind === 'term') {
    const t = ctx.terms.find(x => a >= x.start && a <= x.end) || ctx.terms.slice().reverse().find(x => x.start <= a) || ctx.terms[0];
    return t ? { kind, ps: t.start, pe: t.end, term: t.id } : { kind: 'year', ps: ctx.ys, pe: ctx.ye };
  }
  if (kind === 'custom') return { kind, ps: (custom && custom.ps) || ctx.ys, pe: (custom && custom.pe) || ctx.today };
  return { kind: 'year', ps: ctx.ys, pe: ctx.ye };
}
export function shiftPeriod(ctx, p, dir) {
  if (p.kind === 'week') return periodOf(ctx, 'week', addDays(p.ps, 7 * dir));
  if (p.kind === 'month') return periodOf(ctx, 'month', addMonths(p.ps, dir));
  if (p.kind === 'term') {
    const i = ctx.terms.findIndex(t => t.id === p.term), j = Math.min(ctx.terms.length - 1, Math.max(0, i + dir));
    return ctx.terms[j] ? { kind: 'term', ps: ctx.terms[j].start, pe: ctx.terms[j].end, term: ctx.terms[j].id } : p;
  }
  return p;
}

/* ---------- séries pour les graphiques ---------- */
export function series(ctx, tid, ps, pe, unit = 'week') {
  const buckets = [];
  if (unit === 'day') { for (const d of eachDay(ps, pe)) if (dow(d) !== 0) buckets.push({ key: d, ps: d, pe: d }); }
  else if (unit === 'month') { for (let m = monthStart(ps); m <= pe; m = addMonths(m, 1)) buckets.push({ key: m.slice(0, 7), ps: maxISO(m, ps), pe: minISO(monthEnd(m), pe) }); }
  else { for (let w = mondayOf(ps); w <= pe; w = addDays(w, 7)) buckets.push({ key: w, ps: maxISO(w, ps), pe: minISO(addDays(w, 6), pe) }); }
  return buckets.map(b => {
    const ids = tid ? [tid] : ctx.teachers.map(t => t.id); let due = 0, done = 0;
    for (const id of ids) { due += dueRange(ctx, id, b.ps, b.pe).due; done += doneRange(ctx, id, b.ps, b.pe).hours; }
    return { ...b, due: r1(due), done: r1(done), future: b.ps > ctx.today };
  });
}

/* ---------- aujourd'hui ---------- */
export function todaySlots(ctx, tid, iso = ctx.today) {
  const { byClass } = slotsOn(ctx, tid, iso); const reason = (ctx.abs[tid] || {})[iso];
  const mine = (ctx.byTeacher[tid] || []).filter(e => e.date === iso && e.type !== 'absence');
  const t = ctx.teacher(tid); const rows = [];
  if (!ctx.isTeaching(iso)) return { rows, teaching: false, off: ctx.off.has(iso), reason, entries: mine };
  for (const s of (t && t.slots) || []) {
    if (+s.d !== dow(iso) || (s.tm && ctx.termOf(iso) && s.tm !== ctx.termOf(iso)) || (s.only && s.only.length && !s.only.includes(iso))) continue;
    const done = mine.some(e => e.classId === s.c);
    rows.push({ c: s.c, h: +s.h || 0, st: s.st || '', done });
  }
  return { rows, teaching: true, off: false, reason, entries: mine, hours: Object.values(byClass).reduce((a, b) => a + b, 0) };
}
export function nextNumber(ctx, tid, classId, type) {
  let max = 0;
  for (const e of ctx.byTeacher[tid] || []) if (e.classId === classId && e.type === type && e.n != null && e.n > max) max = e.n;
  return max + 1;
}

/* ---------- facteurs d'écart (données structurées, mises en phrases par l'interface) ---------- */
export function factors(ctx, S) {
  const out = [];
  const byReason = {};
  for (const d of S.declared) if (!d.out) { const k = d.reason; (byReason[k] = byReason[k] || {}); const who = d.teacherId || '_'; byReason[k][who] = (byReason[k][who] || 0) + d.h; }
  for (const k in byReason) out.push({ kind: 'absence', reason: k, who: Object.entries(byReason[k]).map(([id, h]) => ({ teacher: id === '_' ? null : (ctx.teacher(id) || {}).short || id, h: r1(h) })) });
  if (S.closed > 0) out.push({ kind: 'closed', h: S.closed });
  if (S.excused > 0) out.push({ kind: 'excused', h: S.excused });
  if (S.revisionH > 0) out.push({ kind: 'revision', h: S.revisionH });
  if (S.assessH > 0) out.push({ kind: 'assessment', h: S.assessH });
  if (S.regul) out.push({ kind: 'regul', h: S.regul });
  return out;
}

/* ---------- récapitulatif par classe ---------- */
export function recap(ctx, ps, pe) {
  const rows = ctx.classes.map(c => {
    const A = ctx.assign.filter(a => a.classId === c.id);
    let hours = 0, th = new Set(), pr = new Set(), digital = 0, hoursDue = 0;
    for (const t of ctx.teachers) {
      for (const e of ctx.byTeacher[t.id] || []) {
        if (e.classId !== c.id || e.type === 'absence' || !e.date || e.date < ps || e.date > pe) continue;
        hours += (+e.minutes || 0) / 60; if (e.digital) digital++;
        if (e.type === 'lesson' && e.n != null) th.add(t.id + '|' + e.n); if (e.type === 'practical' && e.n != null) pr.add(t.id + '|' + e.n);
      }
      hoursDue += dueRange(ctx, t.id, ps, minISO(pe, ctx.today)).byClass[c.id] || 0;
    }
    const planTh = A.reduce((s, a) => s + (+a.th || 0), 0), planPr = A.reduce((s, a) => s + (+a.pr || 0), 0), planH = A.reduce((s, a) => s + (+a.hours || 0), 0);
    return { id: c.id, name: c.name, cycle: c.cycle, effectif: c.effectif || {}, planTh, planPr, planH, hours: r1(hours), hoursDue: r1(hoursDue), th: th.size, pr: pr.size, digital,
      rateH: pct(hours, planH || hoursDue), rateTh: pct(th.size, planTh), ratePr: pct(pr.size, planPr) };
  });
  const tot = (list) => list.reduce((a, r) => ({ planTh: a.planTh + r.planTh, planPr: a.planPr + r.planPr, planH: a.planH + r.planH, hours: a.hours + r.hours, th: a.th + r.th, pr: a.pr + r.pr, digital: a.digital + r.digital, total: a.total + (+r.effectif.total || 0) }), { planTh: 0, planPr: 0, planH: 0, hours: 0, th: 0, pr: 0, digital: 0, total: 0 });
  const g1 = rows.filter(r => r.cycle !== '2nd'), g2 = rows.filter(r => r.cycle === '2nd');
  const wrap = (list) => { const t = tot(list); return { ...t, hours: r1(t.hours), rateH: pct(t.hours, t.planH), rateTh: pct(t.th, t.planTh), ratePr: pct(t.pr, t.planPr) }; };
  return { rows, g1, g2, t1: wrap(g1), t2: wrap(g2), total: wrap(rows) };
}

/** Outil de reprise : propose, pour chaque affectation, les heures et leçons à compter pour que tout soit « à jour » jusqu'à `date` (ce qui n'a pas déjà été saisi). */
export function catchUp(ctx, date) {
  const cut = minISO(date, ctx.ye), out = [];
  for (const t of ctx.teachers) {
    const due = dueRange(ctx, t.id, ctx.ys, cut), done = doneRange(ctx, t.id, ctx.ys, cut);
    const mine = ctx.assign.filter(a => a.teacherId === t.id), ids = new Set([...mine.map(a => a.classId), ...Object.keys(due.byClass)]);
    for (const cid of ids) {
      const a = mine.find(x => x.classId === cid), d = done.byClass[cid] || { hours: 0, theory: new Set(), practical: new Set() };
      const h = Math.max(0, (due.byClass[cid] || 0) - d.hours);
      const exp = a ? expectedLessons(ctx, a, ctx.ys, cut, due) : 0;
      const l = Math.max(0, Math.round(exp) - d.theory.size - d.practical.size);
      if (h > 0.05 || l > 0) out.push({ teacherId: t.id, classId: cid, h: r1(h), lessons: l });
    }
  }
  return out;
}
