// Actions sur les données : chaque modification est datée (u) ; l'enregistrement le plus récent gagne à la synchronisation.
import { state, update, myId, nextU, observe } from './store.js';
import { scheduleSync } from './sync.js';
import { minutesBetween } from './dates.js';
import { isLessonType } from './consts.js';
import { mergeMeta } from './shared/merge.js';

export const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const stamp = (r) => ({ ...r, u: nextU() });
const upsert = (list, rec) => { const i = list.findIndex(x => x.id === rec.id); const out = list.slice(); if (i >= 0) out[i] = rec; else out.push(rec); return out; };
function termOf(date) { const t = (state.data.dept.terms || []).find(x => date >= x.start && date <= x.end); return t ? t.id : ''; }
const changed = () => scheduleSync();

/* saisies */
export function saveEntry(e) {
  const type = e.type || 'lesson';
  const rec = stamp({ id: e.id || uid(), teacherId: e.teacherId || myId(), type, classId: e.classId || '', date: e.date, start: e.start || '', end: e.end || '',
    minutes: e.minutes != null ? +e.minutes : minutesBetween(e.start, e.end), n: isLessonType(type) && e.n !== '' && e.n != null ? +e.n : null, title: (e.title || '').trim(), digital: !!e.digital,
    eval: e.eval || null, reason: e.reason || '', note: e.note || '', term: termOf(e.date) });
  update(s => { s.data = { ...s.data, entries: upsert(s.data.entries, rec) }; }); changed(); return rec;
}
export function deleteEntry(id) {
  const old = state.data.entries.find(e => e.id === id); if (!old) return null;
  update(s => { s.data = { ...s.data, entries: upsert(s.data.entries, { id, teacherId: old.teacherId, deleted: true, u: nextU() }) }; }); changed(); return old;
}
export function restoreEntry(e) { update(s => { s.data = { ...s.data, entries: upsert(s.data.entries, stamp(e)) }; }); changed(); }
export function declareAbsence({ teacherId, from, to, reason, note }) {
  const made = []; const have = new Set(state.data.entries.filter(e => !e.deleted && e.type === 'absence' && !e.classId && e.teacherId === teacherId).map(e => e.date));
  for (let d = from, k = 0; d <= (to || from) && k < 62; d = nextDay(d), k++) {
    if (new Date(d + 'T00:00:00Z').getUTCDay() === 0 || have.has(d)) continue;
    made.push(stamp({ id: uid(), teacherId, type: 'absence', classId: '', date: d, start: '', end: '', minutes: 0, n: null, title: '', digital: false, eval: null, reason, note: note || '', term: termOf(d) }));
  }
  if (made.length) { update(s => { s.data = { ...s.data, entries: [...s.data.entries, ...made] }; }); changed(); }
  return made.length;
}
const nextDay = (iso) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

/* données du département (animateur pédagogique) */
const setData = (patch) => { update(s => { s.data = { ...s.data, ...patch }; }); changed(); };
export const saveDept = (patch) => setData({ dept: stamp({ ...state.data.dept, ...patch }) });
export const saveClass = (c) => setData({ classes: upsert(state.data.classes, stamp({ id: c.id || uid(), name: c.name, level: c.level || '', cycle: c.cycle || '1er', effectif: c.effectif || { total: 0, girls: 0, boys: 0 } })) });
export const deleteClass = (id) => setData({ classes: upsert(state.data.classes, { id, deleted: true, u: nextU() }), assign: state.data.assign.map(a => (a.classId === id ? { id: a.id, deleted: true, u: nextU() } : a)) });
export const saveAssign = ({ teacherId, classId, th, pr, hours }) => setData({ assign: upsert(state.data.assign, stamp({ id: teacherId + ':' + classId, teacherId, classId, th: +th || 0, pr: +pr || 0, hours: +hours || 0 })) });
export const removeAssign = (teacherId, classId) => setData({ assign: upsert(state.data.assign, { id: teacherId + ':' + classId, deleted: true, u: nextU() }) });
export const saveTeacher = (id, patch) => setData({ teachers: state.data.teachers.map(t => (t.id === id ? stamp({ ...t, ...patch }) : t)) });
export const saveRegul = (r) => setData({ regul: upsert(state.data.regul, stamp({ id: r.id || uid(), teacherId: r.teacherId, classId: r.classId || '', d: r.d, d2: r.d2 || '', h: +r.h || 0, lessons: +r.lessons || 0, note: r.note || '', tag: r.tag || '' })) });
/** Remplace les régularisations « de départ » par une nouvelle série. */
export function replaceStartRegul(list) {
  const now = nextU(); const old = state.data.regul.filter(r => !r.deleted && r.tag === 'start').map(r => ({ id: r.id, deleted: true, u: nextU() }));
  const made = list.map(r => stamp({ id: uid(), teacherId: r.teacherId, classId: r.classId || '', d: r.d, d2: r.d2 || '', h: +r.h || 0, lessons: +r.lessons || 0, note: r.note || '', tag: 'start' }));
  const keep = state.data.regul.filter(r => !old.some(o => o.id === r.id));
  setData({ regul: [...keep, ...old, ...made] });
}
export const deleteRegul = (id) => setData({ regul: upsert(state.data.regul, { id, deleted: true, u: nextU() }) });
/** Intègre la version du serveur SANS écraser ce qui n'est pas encore synchronisé (le plus récent gagne, par enregistrement). */
export function replaceMeta(meta) {
  observe([meta.dept, ...(meta.teachers || []), ...(meta.classes || []), ...(meta.assign || []), ...(meta.regul || [])]);
  update(s => { const m = mergeMeta(s.data, meta); s.data = { ...s.data, ...m }; s.sync.metaRev = meta.rev; });
}
