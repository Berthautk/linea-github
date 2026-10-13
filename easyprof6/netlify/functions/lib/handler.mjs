// API EasyProf : comptes, connexion, synchronisation d'un département, gestion de l'équipe.
// Chaque département est isolé : toutes les clés de données commencent par son identifiant et chaque appel vérifie le jeton.
import { kv } from './store.mjs';
import { hashPassword, verifyPassword, signToken, verifyToken, normUser, validUser, validPassword, randomCode, recoveryCode, rand, now } from './auth.mjs';
import { mergeById, mergeMeta, prune, sameJSON } from '../../../site/js/shared/merge.js';

const MAX = { body: 2_000_000, teachers: 60, classes: 200, assign: 600, regul: 3000, entries: 20000, str: 400 };
const ENTRY_TYPES = ['lesson', 'practical', 'orientation', 'revision', 'assessment', 'absence'];

const json = (status, obj) => new Response(JSON.stringify({ now: now(), ...obj }), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error, message) => json(status, { error, message });

const users = () => kv('users');
const depts = () => kv('depts');
const data = () => kv('data');

/** Nom court : le nom de famille (écrit en majuscules : « Mr. KAMDEM Emmanuel » → KAMDEM), sinon le dernier mot. */
export function shortName(name) {
  const toks = String(name || '').replace(/[.,]/g, ' ').split(/\s+/).filter(w => w && !/^(mr|mme|mlle|m|dr|prof|pr|mrs|ms)$/i.test(w));
  const sur = toks.find(w => /^[A-ZÀ-ÝŒ'’-]{3,}$/.test(w));
  return (sur || toks[toks.length - 1] || '').toUpperCase().slice(0, 14);
}
const str = (v, n = MAX.str) => (typeof v === 'string' ? v.slice(0, n) : '');
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

/* ---------- nettoyage des données reçues ---------- */
function cleanSlots(slots) {
  if (!Array.isArray(slots)) return [];
  return slots.slice(0, 80).map(s => ({ d: Math.min(6, Math.max(1, num(s.d, 1))), c: str(s.c, 40), h: Math.min(12, Math.max(0, num(s.h))), tm: str(s.tm, 8), st: str(s.st, 5), only: (Array.isArray(s.only) ? s.only : []).slice(0, 60).map(x => str(x, 10)).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)) }));
}
function cleanEntry(e, tid) {
  if (!e || typeof e.id !== 'string' || e.id.length > 60) return null;
  const type = ENTRY_TYPES.includes(e.type) ? e.type : 'lesson';
  const out = { id: e.id, teacherId: tid, u: num(e.u, now()) };
  if (e.deleted) return { ...out, deleted: true };
  return {
    ...out, type, classId: str(e.classId, 40), date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '', start: str(e.start, 5), end: str(e.end, 5),
    minutes: Math.min(1440, Math.max(0, num(e.minutes))), n: e.n == null || e.n === '' ? null : num(e.n, null), title: str(e.title, 200), digital: !!e.digital,
    eval: e.eval && typeof e.eval === 'object' ? { evaluated: num(e.eval.evaluated), passed: num(e.eval.passed) } : null,
    reason: str(e.reason, 20), note: str(e.note, 200), term: str(e.term, 8),
  };
}
function cleanClass(c) {
  if (!c || typeof c.id !== 'string' || c.id.length > 40) return null;
  if (c.deleted) return { id: c.id, u: num(c.u, now()), deleted: true };
  const enr = c.effectif || {};
  return { id: c.id, u: num(c.u, now()), name: str(c.name, 60), level: str(c.level, 40), cycle: c.cycle === '2nd' ? '2nd' : '1er', effectif: { total: num(enr.total), girls: num(enr.girls), boys: num(enr.boys) } };
}
// affectation = un enseignant dans une classe, avec le nombre de leçons prévues dans l'année (fixé par l'animateur pédagogique)
function cleanAssign(a) {
  if (!a || typeof a.id !== 'string' || a.id.length > 90) return null;
  if (a.deleted) return { id: a.id, u: num(a.u, now()), deleted: true };
  return { id: a.id, u: num(a.u, now()), teacherId: str(a.teacherId, 40), classId: str(a.classId, 40), th: Math.max(0, num(a.th)), pr: Math.max(0, num(a.pr)), hours: Math.max(0, num(a.hours)) };
}
function cleanRegul(r) {
  if (!r || typeof r.id !== 'string' || r.id.length > 40) return null;
  if (r.deleted) return { id: r.id, u: num(r.u, now()), deleted: true };
  return { id: r.id, u: num(r.u, now()), teacherId: str(r.teacherId, 40), classId: str(r.classId, 40), d: str(r.d, 10), d2: str(r.d2, 10), h: Math.min(500, Math.max(-500, num(r.h))), lessons: Math.min(2000, Math.max(-2000, num(r.lessons))), note: str(r.note, 200), tag: str(r.tag, 12) };
}
function cleanDept(d, id) {
  if (!d || typeof d !== 'object') return null;
  const hdr = {}; for (const [k, v] of Object.entries(d.header || {}).slice(0, 40)) hdr[str(k, 40)] = str(v, 200);
  const terms = Array.isArray(d.terms) ? d.terms.slice(0, 4).map(t => ({ id: str(t.id, 4), name: str(t.name, 40), start: str(t.start, 10), end: str(t.end, 10), last: str(t.last, 10) })) : [];
  const cal = Array.isArray(d.calendar) ? d.calendar.slice(0, 200).map(c => ({ f: str(c.f, 10), t: str(c.t, 10), n: str(c.n, 80) })) : [];
  return {
    id, u: num(d.u, now()), name: str(d.name, 120), discipline: str(d.discipline, 80), abbr: str(d.abbr, 8), system: d.system === 'francophone' ? 'francophone' : 'anglophone',
    year: str(d.year, 12), lh: Math.min(6, Math.max(0.5, num(d.lh, 2))), header: hdr, terms, calendar: cal,
    dueOut: d.dueOut && typeof d.dueOut === 'object' ? Object.fromEntries(Object.entries(d.dueOut).slice(0, 20).map(([k, v]) => [str(k, 20), !!v])) : {},
  };
}

/* ---------- accès aux données ---------- */
async function loadMeta(deptId) { return (await data().get(`${deptId}/meta`)) || null; }
async function saveMeta(deptId, meta) { await data().set(`${deptId}/meta`, meta); }
async function entryRev(deptId, tid) { const r = await data().get(`${deptId}/r/${tid}`); return r ? r.rev : 0; }

async function auth(req) {
  const h = req.headers.get('authorization') || '';
  const p = await verifyToken(h.startsWith('Bearer ') ? h.slice(7) : '');
  if (!p) return null;
  const u = await users().get('u:' + p.u);
  if (!u || u.disabled || u.deptId !== p.d) return null;
  return { ...p, user: u };
}
const session = (u) => ({ username: u.username, deptId: u.deptId, role: u.role, teacherId: u.teacherId });

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX.body) throw Object.assign(new Error('too_large'), { status: 413 });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error('bad_json'), { status: 400 }); }
}

/* ---------- routes ---------- */
async function signup(b) {
  const username = normUser(b.username);
  if (!validUser(username)) return fail(400, 'bad_username', 'Identifiant : 3 à 24 caractères (lettres, chiffres, point, tiret).');
  if (!validPassword(b.password)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères.');
  const name = str(b.name, 80).trim();
  if (!name) return fail(400, 'bad_name', 'Indiquez votre nom.');
  if (await users().get('u:' + username)) return fail(409, 'username_taken', 'Cet identifiant est déjà utilisé.');
  const deptId = 'd' + rand(5), teacherId = 't' + rand(4), t = now();
  const dept = cleanDept({ ...(b.dept || {}), u: t }, deptId) || cleanDept({ u: t }, deptId);
  const meta = { rev: 1, dept, teachers: [{ id: teacherId, name, short: str(b.short, 20).toUpperCase() || shortName(name), username, role: 'ap', phone: str(b.phone, 30), slots: [], u: t }], classes: [], assign: [], regul: [] };
  const code = recoveryCode();
  await users().set('u:' + username, { username, deptId, role: 'ap', teacherId, ...(await hashPassword(b.password)), created: t });
  await depts().set('d:' + deptId, { id: deptId, created: t, ap: username, recovery: await hashPassword(code.replace(/-/g, '')) });
  await saveMeta(deptId, meta);
  const user = await users().get('u:' + username);
  const token = await signToken({ u: username, d: deptId });
  return json(200, { ok: true, token, session: session(user), meta, recovery: code, now: now() });
}

const LOCK = { max: 8, ms: 10 * 60 * 1000 };
async function login(b) {
  const username = normUser(b.username);
  const u = username ? await users().get('u:' + username) : null;
  if (!u) { await hashPassword('x'); return fail(401, 'bad_credentials', 'Identifiant ou mot de passe incorrect.'); }
  if (u.disabled) return fail(403, 'account_disabled', "Ce compte a été désactivé par l'animateur pédagogique.");
  if (u.failed && u.failed.until > now()) return fail(429, 'locked', 'Trop de tentatives. Réessayez dans quelques minutes.');
  if (!(await verifyPassword(String(b.password || ''), u))) {
    const n = ((u.failed && u.failed.n) || 0) + 1;
    u.failed = { n, until: n >= LOCK.max ? now() + LOCK.ms : 0 };
    if (n >= LOCK.max) u.failed.n = 0;
    await users().set('u:' + username, u);
    return fail(401, 'bad_credentials', 'Identifiant ou mot de passe incorrect.');
  }
  if (u.failed) { delete u.failed; await users().set('u:' + username, u); }
  return json(200, { ok: true, token: await signToken({ u: username, d: u.deptId }), session: session(u), now: now() });
}

function mergeTeachersAP(curT, incT) {
  const byId = new Map(curT.map(t => [t.id, t]));
  const out = curT.map(t => ({ ...t }));
  for (const inc of incT || []) {
    const cur = byId.get(inc.id);
    if (!cur || inc.deleted || (+inc.u || 0) <= (+cur.u || 0)) continue;
    const i = out.findIndex(t => t.id === inc.id);
    out[i] = { ...cur, name: str(inc.name, 80) || cur.name, short: str(inc.short, 20) || cur.short, phone: str(inc.phone, 30), slots: cleanSlots(inc.slots), u: num(inc.u) };
  }
  return out;
}
function applyMetaPush(cur, push, ctx) {
  if (ctx.role === 'ap') {
    const inc = {
      dept: cleanDept(push.dept, ctx.deptId),
      classes: (push.classes || []).slice(0, MAX.classes).map(cleanClass).filter(Boolean),
      assign: (push.assign || []).slice(0, MAX.assign).map(cleanAssign).filter(Boolean),
      regul: (push.regul || []).slice(0, MAX.regul).map(cleanRegul).filter(Boolean),
    };
    const merged = mergeMeta({ ...cur, teachers: [] }, { dept: inc.dept, classes: inc.classes, assign: inc.assign, regul: inc.regul });
    merged.teachers = mergeTeachersAP(cur.teachers || [], push.teachers);
    merged.rev = cur.rev; merged.dept = { ...merged.dept, id: ctx.deptId };
    if (!merged.assign) merged.assign = [];
    return merged;
  }
  // enseignant : seulement son propre nom et son téléphone
  const mine = (push.teachers || []).find(t => t && t.id === ctx.teacherId);
  const out = { ...cur, teachers: (cur.teachers || []).map(t => ({ ...t })) };
  const i = out.teachers.findIndex(t => t.id === ctx.teacherId);
  if (mine && i >= 0 && (+mine.u || 0) > (+out.teachers[i].u || 0)) out.teachers[i] = { ...out.teachers[i], name: str(mine.name, 80) || out.teachers[i].name, phone: str(mine.phone, 30), u: num(mine.u) };
  return out;
}

async function sync(req, ctx, b) {
  const deptId = ctx.d; let meta = await loadMeta(deptId);
  if (!meta) return fail(404, 'no_department', 'Département introuvable.');
  const have = b.have || {}, push = b.push || {};
  let metaChanged = false;
  if (push.meta && typeof push.meta === 'object') {
    const merged = applyMetaPush(meta, push.meta, { role: ctx.r || ctx.user.role, teacherId: ctx.user.teacherId, deptId });
    if (!sameJSON({ ...merged, rev: 0 }, { ...meta, rev: 0 })) { merged.rev = (meta.rev || 0) + 1; await saveMeta(deptId, merged); meta = merged; metaChanged = true; }
  }
  const role = ctx.user.role, me = ctx.user.teacherId;
  const knownTeacher = new Set((meta.teachers || []).map(t => t.id));
  const out = {};
  for (const [tid, doc] of Object.entries(push.e || {})) {
    if (!(role === 'ap' ? knownTeacher.has(tid) : tid === me)) continue;
    const incoming = (doc.entries || []).slice(0, MAX.entries).map(e => cleanEntry(e, tid)).filter(Boolean);
    const cur = (await data().get(`${deptId}/e/${tid}`)) || { rev: 0, entries: [] };
    const merged = prune(mergeById(cur.entries, incoming));
    if (merged.length > MAX.entries) return fail(413, 'too_many_entries', 'Trop de saisies pour un seul enseignant.');
    if (!sameJSON(merged, cur.entries)) {
      const rev = (cur.rev || 0) + 1;
      await data().set(`${deptId}/e/${tid}`, { rev, entries: merged });
      await data().set(`${deptId}/r/${tid}`, { rev });
    }
  }
  const wanted = role === 'ap' ? [...knownTeacher] : [me];
  for (const tid of wanted) {
    const rev = await entryRev(deptId, tid);
    const known = (have.e || {})[tid];
    const pushed = !!(push.e || {})[tid];
    if (rev > 0 && (known == null || rev > known || pushed)) { const d = await data().get(`${deptId}/e/${tid}`); if (d) out[tid] = d; }
  }
  const res = { ok: true, now: now(), e: out };
  if (metaChanged || have.meta == null || meta.rev > have.meta) res.meta = role === 'ap' ? meta : { ...meta, teachers: meta.teachers };
  if (ctx.exp - now() < 30 * 864e5) res.token = await signToken({ u: ctx.u, d: deptId });
  return json(200, res);
}

function needAP(ctx) { return ctx.user.role === 'ap' ? null : fail(403, 'forbidden', "Réservé à l'animateur pédagogique."); }

async function teamAdd(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const deptId = ctx.d, meta = await loadMeta(deptId);
  if ((meta.teachers || []).filter(t => !t.deleted).length >= MAX.teachers) return fail(400, 'too_many', 'Nombre maximal de collègues atteint.');
  const name = str(b.name, 80).trim(); if (!name) return fail(400, 'bad_name', 'Indiquez le nom du collègue.');
  const base = normUser(b.username) || name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 18) || 'prof';
  let username = base.length >= 3 ? base : base + '.prof';
  if (!validUser(username)) return fail(400, 'bad_username', 'Identifiant invalide.');
  if (b.username && (await users().get('u:' + username))) return fail(409, 'username_taken', 'Cet identifiant est déjà utilisé.');
  for (let i = 2; await users().get('u:' + username); i++) username = base.slice(0, 20) + i;
  const password = b.password ? String(b.password) : randomCode(6);
  if (!validPassword(password)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères.');
  const tid = 't' + rand(4), t = now();
  await users().set('u:' + username, { username, deptId, role: 'teacher', teacherId: tid, ...(await hashPassword(password)), created: t });
  const teacher = { id: tid, name, short: str(b.short, 20).toUpperCase() || shortName(name), username, role: 'teacher', phone: str(b.phone, 30), slots: [], u: t };
  meta.teachers = [...(meta.teachers || []), teacher]; meta.rev = (meta.rev || 0) + 1;
  await saveMeta(deptId, meta);
  return json(200, { ok: true, teacher, username, password, meta });
}
async function teamReset(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const meta = await loadMeta(ctx.d), t = (meta.teachers || []).find(x => x.id === b.teacherId && !x.deleted);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  const u = await users().get('u:' + t.username); if (!u) return fail(404, 'not_found', 'Compte introuvable.');
  const password = randomCode(6); Object.assign(u, await hashPassword(password)); delete u.failed; delete u.disabled;
  await users().set('u:' + t.username, u);
  return json(200, { ok: true, username: t.username, password });
}
async function teamRemove(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const meta = await loadMeta(ctx.d), t = (meta.teachers || []).find(x => x.id === b.teacherId);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  if (t.id === ctx.user.teacherId) return fail(400, 'self', 'Vous ne pouvez pas retirer votre propre compte.');
  const u = await users().get('u:' + t.username); if (u) { u.disabled = true; await users().set('u:' + t.username, u); }
  meta.teachers = meta.teachers.map(x => x.id === t.id ? { ...x, deleted: true, u: now() } : x); meta.rev = (meta.rev || 0) + 1;
  await saveMeta(ctx.d, meta);
  return json(200, { ok: true, meta });
}
async function changePassword(ctx, b) {
  if (!validPassword(b.password)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères.');
  if (!(await verifyPassword(String(b.old || ''), ctx.user))) return fail(403, 'bad_credentials', 'Ancien mot de passe incorrect.');
  Object.assign(ctx.user, await hashPassword(b.password)); await users().set('u:' + ctx.user.username, ctx.user);
  return json(200, { ok: true });
}
async function recover(b) {
  const username = normUser(b.username), u = username ? await users().get('u:' + username) : null;
  if (!u || u.role !== 'ap' || !validPassword(b.password)) return fail(400, 'bad_request', 'Informations invalides.');
  const d = await depts().get('d:' + u.deptId);
  if (u.failed && u.failed.until > now()) return fail(429, 'locked', 'Trop de tentatives. Réessayez dans quelques minutes.');
  if (!d || !(await verifyPassword(String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), d.recovery))) {
    const n = ((u.failed && u.failed.n) || 0) + 1; u.failed = { n: n >= LOCK.max ? 0 : n, until: n >= LOCK.max ? now() + LOCK.ms : 0 };
    await users().set('u:' + username, u);
    return fail(403, 'bad_code', 'Code de récupération incorrect.');
  }
  Object.assign(u, await hashPassword(b.password)); delete u.failed; delete u.disabled; await users().set('u:' + username, u);
  const code = recoveryCode(); d.recovery = await hashPassword(code.replace(/-/g, '')); await depts().set('d:' + u.deptId, d);
  return json(200, { ok: true, recovery: code });
}

export async function handle(req) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)/, '').replace(/\/+$/, '') || '/';
    if (path === '/ping') return json(200, { ok: true, time: now() });
    if (req.method !== 'POST') return fail(405, 'method', 'Méthode non autorisée.');
    const body = await readBody(req);
    if (path === '/signup') return await signup(body);
    if (path === '/login') return await login(body);
    if (path === '/recover') return await recover(body);
    const ctx = await auth(req);
    if (!ctx) return fail(401, 'unauthorized', 'Session expirée : reconnectez-vous.');
    switch (path) {
      case '/sync': return await sync(req, ctx, body);
      case '/team/add': return await teamAdd(ctx, body);
      case '/team/reset': return await teamReset(ctx, body);
      case '/team/remove': return await teamRemove(ctx, body);
      case '/me/password': return await changePassword(ctx, body);
      case '/me': return json(200, { ok: true, session: session(ctx.user) });
      default: return fail(404, 'not_found', 'Route inconnue.');
    }
  } catch (e) {
    if (e && e.status) return fail(e.status, e.message, 'Requête invalide.');
    console.error('api error', e && e.stack || e);
    return fail(500, 'server_error', 'Erreur du serveur. Réessayez.');
  }
}
