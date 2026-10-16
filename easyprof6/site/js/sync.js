// Synchronisation : on envoie ce qui a changé depuis le dernier envoi, on reçoit ce que les autres ont changé (le plus récent gagne).
import { state, update, observe, refreshSession, setToast, persistSession } from './store.js';
import { api } from './api.js';
import { mergeById, mergeMeta } from './shared/merge.js';

let busy = false, again = false, timer = null, started = false;
export function scheduleSync(ms = 2500) { clearTimeout(timer); timer = setTimeout(() => syncNow(), ms); }

const metaRecords = (d) => [d.dept, ...d.teachers, ...d.classes, ...d.assign, ...d.regul];
function applyResult(s, res, pushedAt) {
  if (res.seen) s.data = { ...s.data, seen: res.seen };
  if (res.meta) {
    const m = mergeMeta({ dept: s.data.dept, teachers: s.data.teachers, classes: s.data.classes, assign: s.data.assign, regul: s.data.regul }, res.meta);
    s.data = { ...s.data, ...m }; s.sync.metaRev = res.meta.rev;
  }
  for (const [tid, doc] of Object.entries(res.e || {})) {
    const mine = s.data.entries.filter(e => e.teacherId === tid), rest = s.data.entries.filter(e => e.teacherId !== tid);
    s.data = { ...s.data, entries: rest.concat(mergeById(mine, doc.entries || [])) }; s.sync.eRev = { ...s.sync.eRev, [tid]: doc.rev };
  }
  observe([s.data.dept, ...s.data.teachers, ...s.data.classes, ...s.data.assign, ...s.data.regul, ...s.data.entries]);
  s.sync.pushU = pushedAt; s.sync.status = 'idle'; s.sync.last = Date.now(); s.sync.error = '';
  if (res.token && s.session) s.session = { ...s.session, token: res.token };
}

export async function syncNow() {
  const sess = state.session; if (!sess || !sess.token) return;
  if (busy) { again = true; return; }
  busy = true; update(s => { s.sync.status = 'syncing'; });
  const startedAt = Date.now();
  try {
    const { data, sync } = state, push = {};
    if (metaRecords(data).some(r => r && (r.u || 0) > sync.pushU)) push.meta = { dept: data.dept, teachers: data.teachers, classes: data.classes, assign: data.assign, regul: data.regul };
    const byT = {};
    for (const e of data.entries) if ((e.u || 0) > sync.pushU && (sess.role === 'ap' || e.teacherId === sess.teacherId)) (byT[e.teacherId] = byT[e.teacherId] || []).push(e);
    if (Object.keys(byT).length) push.e = Object.fromEntries(Object.entries(byT).map(([k, list]) => [k, { entries: list }]));
    const res = await api('/sync', { have: { meta: sync.metaRev, e: sync.eRev }, push }, sess.token);
    update(s => applyResult(s, res, startedAt - 1)); if (res.token) persistSession();
    if (refreshSession(res.session)) setToast(res.session.role === 'ap' ? 'Vous êtes maintenant animateur pédagogique. Pensez à créer votre code de récupération : Réglages › Mon profil.' : 'Vous n’êtes plus animateur pédagogique : vous gardez la saisie de vos propres cours.');
  } catch (e) {
    update(s => { s.sync.status = e.status === 401 ? 'auth' : e.offline ? 'offline' : 'error'; s.sync.error = e.message; });
  } finally { busy = false; if (again) { again = false; scheduleSync(300); } }
}

export function startAutoSync() {
  if (started) return; started = true;
  const kick = () => { if (state.session && !document.hidden) syncNow(); };
  document.addEventListener('visibilitychange', kick); window.addEventListener('online', kick);
  setInterval(kick, 600000); kick();   // toutes les 10 min, plus une synchro à chaque saisie et à l'ouverture : moins d'appels, moins de crédits Netlify
}
