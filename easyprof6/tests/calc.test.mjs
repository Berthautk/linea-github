import test from 'node:test';
import assert from 'node:assert/strict';
import { slotHours, endFor } from '../site/js/dates.js';
import { followUp, noTimetable, makeCtx, dueRange, stats, classProgress, periodOf, shiftPeriod, series, todaySlots, nextNumber, recap, overall, lagStatus, factors } from '../site/js/calc.js';
import { newDept } from '../site/js/defaults.js';

const S = (d, c, h, extra = {}) => ({ d, c, h, ...extra });
const mk = (over = {}) => ({
  dept: newDept({ name: 'GBHS', discipline: 'GEOGRAPHY' }),
  teachers: [
    { id: 'K', name: 'Kamdem', short: 'KAMDEM', role: 'ap', slots: [S(1, 'F3A', 2), S(1, 'LSA', 2), S(1, 'F4AR', 1), S(1, 'USA', 1), S(2, 'USA', 4), S(2, 'LSA', 3)] },
    { id: 'N', name: 'Nebasibi', short: 'NEB', slots: [S(3, 'LSA', 2), S(3, 'USA', 1), S(3, 'F5SC', 2), S(4, 'LSA', 2), S(4, 'USA', 2), S(5, 'F5A', 2), S(5, 'LSA', 1)] },
    { id: 'A', name: 'Astha', short: 'ASTHA', slots: [S(1, 'F1A', 2), S(1, 'F1B', 2), S(1, 'F1BIL', 2), S(1, 'F3B', 1), S(3, 'F4SC', 2), S(3, 'F4AR', 2), S(4, 'F2A', 2), S(5, 'F3B', 2), S(5, 'F2B', 1), S(5, 'F3A', 1)] },
    { id: 'T', name: 'Tsogo', short: 'TSOGO', slots: [S(3, 'USA', 3), S(4, 'F5A', 1), S(4, 'F4SC', 1), S(4, 'LSA', 2), S(5, 'USA', 1), S(5, 'F5SC', 1)] },
  ],
  classes: ['F3A', 'LSA', 'F4AR', 'USA', 'F1A', 'F5SC'].map((id, i) => ({ id, name: id, cycle: i < 4 && id !== 'F1A' ? '2nd' : '1er', effectif: { total: 50 } })),
  assign: [], regul: [], entries: [], ...over,
});
const E = (id, tid, date, over = {}) => ({ id, teacherId: tid, classId: 'LSA', date, start: '07:30', end: '09:30', minutes: 120, type: 'lesson', n: 1, ...over });
const P1 = ['2026-09-07', '2026-10-09'];

test('heures dues du 07/09 au 09/10/2026 : 255 h (référence validée : 65 + 60 + 85 + 45)', () => {
  const c = makeCtx(mk(), '2026-10-13');
  assert.equal(stats(c, null, ...P1).due, 255);
  assert.deepEqual(['K', 'N', 'A', 'T'].map(id => stats(c, id, ...P1).due), [65, 60, 85, 45]);
});

test('calendrier de l’arrêté : vacances de Noël, Pâques, suivi pédagogique et 3e trimestre aux dates officielles', () => {
  const c = makeCtx(mk(), '2027-06-30');
  const noel = dueRange(c, 'K', '2026-12-19', '2027-01-03'); assert.equal(noel.due, 0); assert.ok(noel.closed > 0);
  assert.equal(dueRange(c, 'K', '2027-03-26', '2027-04-11').due, 0, 'Pâques');
  assert.equal(dueRange(c, 'K', '2026-11-26', '2026-11-27').due, 0, 'deux derniers jours du trimestre');
  const t3 = dueRange(c, 'K', '2027-04-12', '2027-06-11').due; assert.ok(t3 > 80 && t3 <= 9 * 13, '3e trimestre : dates officielles maintenues jusqu’au 11/06 (' + t3 + ' h dues pour K)');
  assert.equal(dueRange(c, 'K', '2027-03-08', '2027-03-25').due, 13 * 3, 'du 8 au 25 mars : 3 semaines de cours (lundi + mardi) du 3e trimestre comptent');
  assert.equal(dueRange(c, 'K', '2026-12-14', '2026-12-18').due, 6 + 7, 'semaine de cours avant les vacances (lundi 6 h + mardi 7 h)');
});

test('samedi limité à un trimestre', () => {
  const st = mk(); st.teachers[0].slots.push(S(6, 'USA', 2, { tm: 'T1' }));
  const c = makeCtx(st, '2027-03-01');
  assert.equal(dueRange(c, 'K', '2026-09-12', '2026-09-12').due, 2, 'samedi 12/09 (T1)');
  assert.equal(dueRange(c, 'K', '2027-01-09', '2027-01-09').due, 0, 'samedi 09/01/2027 (T2) : pas de cours');
});

test('jours sans cours : férié/activités retirés des heures dues, maladie reste due mais non faite', () => {
  const st = mk({ entries: [{ id: 'a1', teacherId: 'K', type: 'absence', reason: 'sick', date: '2026-10-06' }, { id: 'a2', teacherId: 'A', type: 'absence', reason: 'school', date: '2026-10-09' }] });
  const c = makeCtx(st, '2026-10-13');
  const k = stats(c, 'K', ...P1), a = stats(c, 'A', ...P1);
  assert.equal(k.due, 65); assert.equal(k.absent, 7); assert.equal(k.hours, 0);
  assert.equal(a.due, 85 - 4); assert.equal(a.excused, 4);
  const s2 = makeCtx({ ...st, dept: { ...st.dept, dueOut: { school: false } } }, '2026-10-13');
  assert.equal(stats(s2, 'A', ...P1).due, 85, 'le motif peut être reclassé en absence');
});

test('heures faites = saisies ; leçons distinctes ; révision/évaluation/orientation sans leçon ; régularisation', () => {
  const st = mk({ entries: [
    E('1', 'K', '2026-09-14', { n: 1 }), E('2', 'K', '2026-09-15', { n: 1, minutes: 60 }) /* même leçon en 2 séances */, E('3', 'K', '2026-09-21', { n: 2 }),
    E('4', 'K', '2026-09-22', { type: 'practical', n: 1, classId: 'USA' }), E('5', 'K', '2026-09-23', { type: 'revision', n: null }), E('6', 'K', '2026-09-24', { type: 'orientation', n: null, minutes: 30 }),
    E('7', 'K', '2026-09-25', { type: 'assessment', n: null, eval: { evaluated: 40, passed: 30 } }), E('8', 'K', '2026-11-02', { n: 9 }) /* hors période */, E('9', 'K', '2026-09-26', { digital: true, n: 3, deleted: true }),
  ], regul: [{ id: 'r1', teacherId: 'K', d: '2026-09-07', d2: '2026-10-09', h: -3 }] });
  const c = makeCtx(st, '2026-10-13'); const k = stats(c, 'K', ...P1);
  assert.equal(k.hours, (120 + 60 + 120 + 120 + 120 + 30 + 120) / 60 - 3);
  assert.equal(k.lessonsDone, 3, 'LSA n°1, LSA n°2, USA TP n°1 ; la révision et l’évaluation ne comptent pas');
  assert.equal(k.theory, 2); assert.equal(k.practical, 1); assert.equal(k.revisionH, 2); assert.equal(k.orientationH, 0.5);
  assert.equal(k.successRate, 75); assert.equal(k.regul, -3);
  assert.equal(stats(c, 'K', '2026-09-14', '2026-09-18').regul, -0.5, '−3 h étalées sur 33 jours, 5 jours dans la semaine : −0,45 arrondi à −0,5');
});

test('rythme des leçons : attendues proportionnelles aux heures de cours ; retard par classe', () => {
  const st = mk({ assign: [{ id: 'K:USA', teacherId: 'K', classId: 'USA', th: 20, pr: 0, hours: 0 }] });
  const c = makeCtx(st, '2026-10-30');
  const yearH = dueRange(c, 'K', c.ys, c.ye).byClass.USA, partH = dueRange(c, 'K', c.ys, '2026-10-30').byClass.USA;
  const prog = classProgress(c, 'K', '2026-10-30')[0];
  assert.equal(prog.classId, 'USA'); assert.equal(prog.expected, Math.round(20 * partH / yearH * 10) / 10);
  assert.equal(prog.done, 0); assert.equal(prog.status, 'late'); assert.ok(prog.lag > 3);
  const st2 = mk({ assign: st.assign, entries: Array.from({ length: 5 }, (_, i) => E('x' + i, 'K', '2026-09-1' + i, { classId: 'USA', n: i + 1 })) });
  const p2 = classProgress(makeCtx(st2, '2026-10-30'), 'K')[0];
  assert.equal(p2.done, 5); assert.ok(p2.status === 'ok' || p2.status === 'slight' || p2.status === 'ahead');
  assert.equal(lagStatus(0.5), 'ok'); assert.equal(lagStatus(2), 'slight'); assert.equal(lagStatus(5), 'late'); assert.equal(lagStatus(-2), 'ahead');
});

test('statistiques : département = somme des enseignants ; alertes de seuil ; période en cours', () => {
  const st = mk({ entries: [E('1', 'K', '2026-09-14', { minutes: 60 })] });
  const c = makeCtx(st, '2026-09-18');
  const all = stats(c, null, '2026-09-07', '2026-09-30');
  const sum = ['K', 'N', 'A', 'T'].reduce((a, id) => a + stats(c, id, '2026-09-07', '2026-09-30').due, 0);
  assert.equal(all.due, Math.round(sum * 10) / 10);
  assert.ok(all.dueFull > all.due, 'la période pas encore écoulée n’est pas comptée comme due');
  assert.ok(all.alerts.some(a => a.kind === 'hours') && overall(all) === 'late');
  const full = makeCtx(mk({ entries: [] }), '2026-10-13');
  assert.equal(stats(full, 'K', ...P1).rate, 0);
});

test('périodes et séries', () => {
  const c = makeCtx(mk(), '2026-10-13');
  const w = periodOf(c, 'week', '2026-10-13'); assert.deepEqual([w.ps, w.pe], ['2026-10-12', '2026-10-17']);
  const w2 = shiftPeriod(c, w, -1); assert.equal(w2.ps, '2026-10-05');
  const m = periodOf(c, 'month', '2026-10-13'); assert.deepEqual([m.ps, m.pe], ['2026-10-01', '2026-10-31']);
  assert.equal(shiftPeriod(c, m, 1).ps, '2026-11-01');
  const t = periodOf(c, 'term', '2026-10-13'); assert.equal(t.term, 'T1'); assert.equal(shiftPeriod(c, t, 1).term, 'T2'); assert.equal(shiftPeriod(c, shiftPeriod(c, t, 1), 1).term, 'T3');
  const ser = series(c, null, ...P1); assert.equal(ser.length, 5); assert.equal(ser.reduce((a, b) => a + b.due, 0), 255);
  assert.equal(periodOf(c, 'year').ps, '2026-09-07');
});

test('aujourd’hui, numéro suivant, récapitulatif, facteurs', () => {
  const st = mk({ entries: [E('1', 'K', '2026-10-12', { n: 4 }), E('2', 'K', '2026-10-13', { classId: 'USA', n: 2 }), { id: 'z', teacherId: 'N', type: 'absence', reason: 'sick', date: '2026-10-14' }],
    assign: [{ id: 'K:LSA', teacherId: 'K', classId: 'LSA', th: 30, pr: 4, hours: 66 }, { id: 'N:LSA', teacherId: 'N', classId: 'LSA', th: 20, pr: 2, hours: 40 }] });
  const c = makeCtx(st, '2026-10-13');
  const td = todaySlots(c, 'K', '2026-10-13'); assert.equal(td.teaching, true); assert.equal(td.rows.length, 2);
  assert.deepEqual(td.rows.map(r => [r.c, r.done]), [['USA', true], ['LSA', false]]);
  assert.equal(todaySlots(c, 'K', '2026-12-25').teaching, false);
  assert.equal(nextNumber(c, 'K', 'LSA', 'lesson'), 5); assert.equal(nextNumber(c, 'K', 'F3A', 'lesson'), 1);
  const r = recap(c, '2026-09-07', '2026-10-13'); const lsa = r.rows.find(x => x.id === 'LSA');
  assert.equal(lsa.planTh, 50); assert.equal(lsa.planPr, 6); assert.equal(lsa.planH, 106); assert.equal(lsa.th, 1);
  assert.equal(r.total.planTh, 50);
  const f = factors(c, stats(c, null, '2026-10-12', '2026-10-17')); assert.ok(f.some(x => x.kind === 'absence' && x.reason === 'sick'));
});

test('créneau à dates précises (samedis réellement tenus : 19/09 et 03/10) : les autres samedis ne comptent pas', () => {
  const st = mk(); st.teachers = [{ id: 'K', name: 'Kamdem', short: 'KAMDEM', role: 'ap', slots: [S(6, 'USA', 2, { only: ['2026-09-19', '2026-10-03'] })] }];
  const c = makeCtx(st, '2026-10-13');
  assert.equal(dueRange(c, 'K', '2026-09-07', '2026-10-12').due, 4, 'seulement 2 samedis × 2 h');
  assert.equal(dueRange(c, 'K', '2026-09-12', '2026-09-12').due, 0);
  assert.equal(todaySlots(c, 'K', '2026-09-19').rows.length, 1);
  assert.equal(todaySlots(c, 'K', '2026-09-26').rows.length, 0);
});

test('fiche d’inspection et fiche pédagogique lisent les mêmes saisies : une saisie change les deux', () => {
  const st = mk({ assign: [{ id: 'K:LSA', teacherId: 'K', classId: 'LSA', th: 10, pr: 0, hours: 40 }] });
  const before = makeCtx(st, '2026-10-13'), h0 = stats(before, null, ...P1).hours, f0 = followUp(before, ...P1).total.hours;
  st.entries = [E('e1', 'K', '2026-09-14')];
  const after = makeCtx(st, '2026-10-13');
  assert.equal(stats(after, null, ...P1).hours - h0, 2); assert.equal(followUp(after, ...P1).total.hours - f0, 2);
  assert.equal(followUp(after, ...P1).total.th, stats(after, null, ...P1).lessonsDone, 'mêmes leçons faites');
});

test('emploi du temps manquant détecté (pas de pourcentage trompeur)', () => {
  const st = mk(); st.teachers[1].slots = [];
  const c = makeCtx(st, '2026-10-13');
  assert.deepEqual(noTimetable(c, null).map(x => x.id), ['N']); assert.equal(noTimetable(c, 'K').length, 0);
});

test('heures de début et de fin : la durée ne compte pas les pauses (10:30-10:45 et 12:45-13:15)', () => {
  assert.equal(slotHours('07:30', '09:30'), 2); assert.equal(slotHours('09:30', '11:45'), 2, 'pause de 15 min déduite');
  assert.equal(slotHours('11:45', '15:15'), 3, 'pause de 30 min déduite'); assert.equal(slotHours('07:30', '11:45'), 4);
  assert.equal(endFor('09:30', 2), '11:45'); assert.equal(endFor('11:45', 3), '15:15'); assert.equal(endFor('07:30', 3), '10:30');
});

test('absence à un cours précis : seul ce cours est compté absent ; un motif « hors faute » le retire des heures dues', () => {
  const st = mk(); st.teachers = [{ id: 'K', name: 'Kamdem', short: 'KAMDEM', slots: [S(1, 'F3A', 2, { st: '07:30' }), S(1, 'LSA', 2, { st: '09:30' })] }];
  st.entries = [{ id: 'a1', teacherId: 'K', type: 'absence', classId: 'F3A', date: '2026-10-12', reason: 'unknown', minutes: 0 }];
  const c = makeCtx(st, '2026-10-13'), d = dueRange(c, 'K', '2026-10-12', '2026-10-12');
  assert.equal(d.due, 4); assert.equal(d.absent, 2, 'seul le cours F3A est absent');
  const rows = todaySlots(c, 'K', '2026-10-12').rows; assert.equal(rows.find(r => r.c === 'F3A').absent, 'unknown'); assert.equal(rows.find(r => r.c === 'LSA').absent, '');
  assert.equal(rows[0].en, '09:30', 'heure de fin déduite');
  st.entries[0].reason = 'holiday'; const d2 = dueRange(makeCtx(st, '2026-10-13'), 'K', '2026-10-12', '2026-10-12');
  assert.equal(d2.due, 2); assert.equal(d2.excused, 2);
});
