// État de l'application : tout est gardé sur l'appareil (localStorage) ; la synchronisation envoie/reçoit les changements.
import { useState, useEffect } from './vendor/preact-htm.js';
import { newDept } from './defaults.js';
import { setLang } from './i18n.js';

const K = { session: 'ep6:session', lang: 'ep6:lang', ui: 'ep6:ui', data: (u) => 'ep6:data:' + u };
export const emptyData = () => ({ dept: newDept(), teachers: [], classes: [], assign: [], regul: [], entries: [] });
const emptySync = () => ({ metaRev: null, eRev: {}, pushU: 0, status: 'idle', last: 0, error: '' });
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage plein ou bloqué */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* rien */ } },
};

export const state = { lang: 'fr', session: null, data: emptyData(), sync: emptySync(), ui: { scope: 'dept', period: { kind: 'term' } }, toast: null, online: true };
const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function useStore() { const [, set] = useState(0); useEffect(() => subscribe(() => set(n => n + 1)), []); return state; }

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { if (state.session) ls.set(K.data(state.session.username), { data: state.data, sync: { ...state.sync, status: 'idle' } }); ls.set(K.ui, state.ui); }, 150);
}
export function update(fn) { fn(state); persist(); listeners.forEach(f => f()); }
export function flush() { if (state.session) ls.set(K.data(state.session.username), { data: state.data, sync: { ...state.sync, status: 'idle' } }); }

export function init() {
  state.lang = ls.get(K.lang, (navigator.language || 'fr').startsWith('en') ? 'en' : 'fr'); setLang(state.lang);
  state.ui = { ...state.ui, ...ls.get(K.ui, {}) };
  const s = ls.get(K.session, null);
  if (s && s.username) { state.session = s; loadUser(s.username); }
}
function loadUser(username) {
  const saved = ls.get(K.data(username), null);
  state.data = saved && saved.data ? { ...emptyData(), ...saved.data } : emptyData();
  state.sync = saved && saved.sync ? { ...emptySync(), ...saved.sync } : emptySync();
  skew = +state.sync.skew || 0;
  observe([state.data.dept, ...state.data.teachers, ...state.data.classes, ...state.data.assign, ...state.data.regul, ...state.data.entries]);
}
export function setLanguage(l) { state.lang = l; setLang(l); ls.set(K.lang, l); update(() => { }); }
export function startSession(session, meta) {
  ls.set(K.session, session);
  update(s => {
    s.session = session; loadUser(session.username);
    if (meta) { s.data = { ...s.data, ...metaToData(meta) }; s.sync.metaRev = meta.rev; }
  });
}
export function metaToData(meta) { return { dept: meta.dept, teachers: meta.teachers || [], classes: meta.classes || [], assign: meta.assign || [], regul: meta.regul || [] }; }
export function logout({ wipe } = {}) {
  const u = state.session && state.session.username;
  ls.del(K.session); if (wipe && u) ls.del(K.data(u));
  update(s => { s.session = null; s.data = emptyData(); s.sync = emptySync(); s.ui.scope = 'dept'; s.ui.scopeT = 'me'; });
}
export function setToast(msg, kind, action) { update(s => { s.toast = msg ? { msg, kind, action, id: Date.now() } : null; }); if (msg) { const id = state.toast.id; setTimeout(() => { if (state.toast && state.toast.id === id) update(s => { s.toast = null; }); }, action ? 6000 : 3200); } }
export const setUI = (patch) => update(s => { s.ui = { ...s.ui, ...patch }; });
/** Qui regarde-t-on ? L'animateur choisit librement ; l'enseignant regarde par défaut ses propres données (le reste est en lecture seule). */
export const getScope = () => (state.session && state.session.role === 'ap' ? state.ui.scope : state.ui.scopeT || 'me');
export const setScope = (v) => setUI(state.session && state.session.role === 'ap' ? { scope: v } : { scopeT: v });
/** Le rôle a changé sur le serveur (transfert de l'animation pédagogique) : on met la session à jour. */
export function refreshSession(sess) {
  if (!state.session || !sess || !sess.role || sess.role === state.session.role) return false;
  const ns = { ...state.session, role: sess.role }; ls.set(K.session, ns);
  update(s => { s.session = ns; s.ui = { ...s.ui, scope: sess.role === 'ap' ? 'dept' : s.ui.scope, scopeT: 'me' }; });
  return true;
}

/* ---------- raccourcis ---------- */
// Horodatage strictement croissant : deux modifications ne portent jamais la même date (la règle « le plus récent gagne » reste fiable).
// Les dates suivent l'horloge du SERVEUR (décalage mesuré à chaque échange) : un téléphone mal réglé ne perd pas ses modifications contre celles des autres.
let lastU = 0, skew = 0;
export const nextU = () => (lastU = Math.max(Date.now() + skew, lastU + 1));
export function observe(list) { for (const r of list || []) if (r && r.u > lastU) lastU = r.u; }
export function setServerTime(serverNow) { skew = serverNow - Date.now(); state.sync.skew = skew; }

export const isAP = () => !!state.session && state.session.role === 'ap';
export const myId = () => state.session && state.session.teacherId;
export const me = () => state.data.teachers.find(t => t.id === myId());
