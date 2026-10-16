// API Rekort : comptes, connexion, synchronisation d'un département, gestion de l'équipe.
// Chaque département est isolé : toutes les clés de données commencent par son identifiant et chaque appel vérifie le jeton.
import { kv } from './store.mjs';
import { hashPassword, verifyPassword, signToken, verifyToken, normUser, validUser, validPassword, randomCode, recoveryCode, rand, now } from './auth.mjs';
import { mergeById, mergeMeta, prune, sameJSON } from '../../../site/js/shared/merge.js';

const MAX = { body: 2_000_000, teachers: 60, classes: 200, assign: 600, regul: 3000, entries: 20000, str: 400 };
const ENTRY_TYPES = ['lesson', 'practical', 'further', 'orientation', 'revision', 'assessment', 'absence'];

const json = (status, obj) => new Response(JSON.stringify({ now: now(), ...obj }), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
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
/** Date de modification : jamais plus de 5 minutes dans le futur (sinon un client pourrait rendre ses données impossibles à corriger par l'animateur). */
const cu = (v) => Math.min(num(v, now()), now() + 300e3);

/* ---------- nettoyage des données reçues ---------- */
function cleanSlots(slots) {
  if (!Array.isArray(slots)) return [];
  return slots.slice(0, 80).filter(s => s && typeof s === 'object').map(s => ({ d: Math.min(6, Math.max(1, num(s.d, 1))), c: str(s.c, 40), h: Math.min(12, Math.max(0, num(s.h))), tm: str(s.tm, 8), st: str(s.st, 5), en: str(s.en, 5), only: (Array.isArray(s.only) ? s.only : []).slice(0, 60).map(x => str(x, 10)).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)) }));
}
function cleanEntry(e, tid) {
  if (!e || typeof e.id !== 'string' || e.id.length > 60) return null;
  const type = ENTRY_TYPES.includes(e.type) ? e.type : 'lesson';
  const out = { id: e.id, teacherId: tid, u: cu(e.u) };
  if (e.deleted) return { ...out, deleted: true };
  return {
    ...out, type, classId: str(e.classId, 40), date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '', start: str(e.start, 5), end: str(e.end, 5),
    minutes: Math.min(1440, Math.max(0, num(e.minutes))), n: e.n == null || e.n === '' ? null : num(e.n, null), title: str(e.title, 200), digital: !!e.digital,
    present: e.present == null || e.present === '' ? null : Math.min(500, Math.max(0, num(e.present))),
    eval: e.eval && typeof e.eval === 'object' ? { evaluated: num(e.eval.evaluated), passed: num(e.eval.passed) } : null,
    reason: str(e.reason, 20), note: str(e.note, 200), term: str(e.term, 8),
  };
}
function cleanClass(c) {
  if (!c || typeof c.id !== 'string' || c.id.length > 40) return null;
  if (c.deleted) return { id: c.id, u: cu(c.u), deleted: true };
  const enr = c.effectif || {};
  return { id: c.id, u: cu(c.u), name: str(c.name, 60), level: str(c.level, 40), cycle: c.cycle === '2nd' ? '2nd' : '1er', effectif: { total: num(enr.total), girls: num(enr.girls), boys: num(enr.boys) } };
}
// affectation = un enseignant dans une classe, avec le nombre de leçons prévues dans l'année (fixé par l'animateur pédagogique)
function cleanAssign(a) {
  if (!a || typeof a.id !== 'string' || a.id.length > 90) return null;
  if (a.deleted) return { id: a.id, u: cu(a.u), deleted: true };
  return { id: a.id, u: cu(a.u), teacherId: str(a.teacherId, 40), classId: str(a.classId, 40), th: Math.max(0, num(a.th)), pr: Math.max(0, num(a.pr)), fs: Math.max(0, num(a.fs)), hth: Math.max(0, num(a.hth)), hpr: Math.max(0, num(a.hpr)), n0: Math.min(999, Math.max(0, num(a.n0))), hours: Math.max(0, num(a.hours)) };
}
function cleanRegul(r) {
  if (!r || typeof r.id !== 'string' || r.id.length > 40) return null;
  if (r.deleted) return { id: r.id, u: cu(r.u), deleted: true };
  return { id: r.id, u: cu(r.u), teacherId: str(r.teacherId, 40), classId: str(r.classId, 40), d: str(r.d, 10), d2: str(r.d2, 10), h: Math.min(500, Math.max(-500, num(r.h))), lessons: Math.min(2000, Math.max(-2000, num(r.lessons))), note: str(r.note, 200), tag: str(r.tag, 12) };
}
/** Années archivées : la configuration de chaque année passée (trimestres, calendrier, emplois du temps, programme) pour la revoir et comparer. */
function cleanYears(ys) {
  if (!Array.isArray(ys)) return [];
  return ys.slice(0, 30).filter(y => y && typeof y === 'object' && typeof y.year === 'string').map(y => ({
    year: str(y.year, 12), closed: num(y.closed), lh: Math.min(6, Math.max(0.5, num(y.lh, 2))), period: [40, 45, 50, 55, 60].includes(+y.period) ? +y.period : 60,
    terms: Array.isArray(y.terms) ? y.terms.slice(0, 4).map(t => ({ id: str(t.id, 4), name: str(t.name, 40), start: str(t.start, 10), end: str(t.end, 10) })) : [],
    calendar: Array.isArray(y.calendar) ? y.calendar.slice(0, 200).map(c => ({ f: str(c.f, 10), t: str(c.t, 10), n: str(c.n, 80) })) : [],
    breaks: Array.isArray(y.breaks) ? y.breaks.slice(0, 6).map(b => ({ f: str(b && b.f, 5), t: str(b && b.t, 5) })) : undefined,
    slots: y.slots && typeof y.slots === 'object' ? Object.fromEntries(Object.entries(y.slots).slice(0, MAX.teachers).map(([k, v]) => [str(k, 40), cleanSlots(v)])) : {},
    assign: Array.isArray(y.assign) ? y.assign.slice(0, MAX.assign).map(cleanAssign).filter(a => a && !a.deleted) : [],
  }));
}
function cleanDept(d, id) {
  if (!d || typeof d !== 'object') return null;
  const hdr = {}; for (const [k, v] of Object.entries(d.header || {}).slice(0, 40)) hdr[str(k, 40)] = str(v, 700);
  const terms = Array.isArray(d.terms) ? d.terms.slice(0, 4).map(t => ({ id: str(t.id, 4), name: str(t.name, 40), start: str(t.start, 10), end: str(t.end, 10), last: str(t.last, 10) })) : [];
  const cal = Array.isArray(d.calendar) ? d.calendar.slice(0, 200).map(c => ({ f: str(c.f, 10), t: str(c.t, 10), n: str(c.n, 80) })) : [];
  return {
    id, u: cu(d.u), name: str(d.name, 120), discipline: str(d.discipline, 80), abbr: str(d.abbr, 8), system: d.system === 'francophone' ? 'francophone' : 'anglophone',
    years: cleanYears(d.years), year: str(d.year, 12), lh: Math.min(6, Math.max(0.5, num(d.lh, 2))), period: [40, 45, 50, 55, 60].includes(+d.period) ? +d.period : 60, header: hdr, ...(Array.isArray(d.breaks) ? { breaks: d.breaks.slice(0, 6).map(b => ({ f: str(b && b.f, 5), t: str(b && b.t, 5) })).filter(b => /^\d{2}:\d{2}$/.test(b.f) && /^\d{2}:\d{2}$/.test(b.t)) } : {}), setup: Object.fromEntries(Object.entries(d.setup || {}).slice(0, 20).map(([k, v]) => [str(k, 20), !!v])), terms, calendar: cal,
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
  if (!u || u.disabled || u.deptId !== p.d || (p.i || '') !== (u.uid || '') || (p.v || 0) !== (u.ver || 0)) return null;
  return { ...p, user: u };
}
/** Le jeton porte l'identité stable (uid) et la version du compte : réinitialiser un mot de passe, récupérer un compte ou le renommer annule tous les anciens jetons. */
const tokenFor = (u) => signToken({ u: u.username, d: u.deptId, i: u.uid || '', v: u.ver || 0 });
const session = (u) => ({ username: u.username, deptId: u.deptId, role: u.role, teacherId: u.teacherId });

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX.body) throw Object.assign(new Error('too_large'), { status: 413 });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error('bad_json'), { status: 400 }); }
}

/* ---------- routes ---------- */
const WEAK = new Set(['123456', '1234567', '12345678', '123456789', 'password', 'motdepasse', 'azerty', 'azerty123', 'qwerty', 'qwerty123', '000000', '111111', 'abcdef', 'abc123', 'rekort', 'rekort123']);
/** Mot de passe trop évident : très courant, un seul caractère répété, ou identique à l'identifiant. */
export function weakPassword(p, username = '') { const x = String(p || '').toLowerCase(); return WEAK.has(x) || /^(.)\1+$/.test(x) || x === String(username).toLowerCase(); }
const SIGNUP = { perIp: 5, ipMs: 3600e3, perDay: 300, dayMs: 864e5 };
async function signup(b, ip = 'local') {
  const need = process.env.REKORT_SIGNUP_CODE;   // facultatif : si défini sur Netlify, seul qui connaît ce code peut créer un département
  if (need && String(b.signupCode || '').trim() !== need) return fail(403, 'signup_code', 'Code d’inscription incorrect.');
  if (await tooMany('signup', ip, SIGNUP.perIp, SIGNUP.ipMs) || await tooMany('signup', 'all', SIGNUP.perDay, SIGNUP.dayMs)) return LOCKED();
  const username = normUser(b.username);
  if (!validUser(username)) return fail(400, 'bad_username', 'Identifiant : 3 à 24 caractères (lettres, chiffres, point, tiret).');
  if (!validPassword(b.password) || weakPassword(b.password, username)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères, pas trop évident (ni 123456, ni votre identifiant).');
  const name = str(b.name, 80).trim();
  if (!name) return fail(400, 'bad_name', 'Indiquez votre nom.');
  if (await users().get('u:' + username)) return fail(409, 'username_taken', 'Cet identifiant est déjà utilisé.');
  const deptId = 'd' + rand(5), teacherId = 't' + rand(4), t = now();
  const dept = cleanDept({ ...(b.dept || {}), u: t }, deptId) || cleanDept({ u: t }, deptId);
  const meta = { rev: 1, dept, teachers: [{ id: teacherId, name, short: str(b.short, 20).toUpperCase() || shortName(name), username, role: 'ap', phone: str(b.phone, 30), slots: [], u: t }], classes: [], assign: [], regul: [] };
  const code = recoveryCode();
  await users().set('u:' + username, { username, uid: rand(6), deptId, role: 'ap', teacherId, ...(await hashPassword(b.password)), created: t });
  await depts().set('d:' + deptId, { id: deptId, created: t, ap: username, recovery: await hashPassword(code.replace(/-/g, '')) });
  await saveMeta(deptId, meta);
  const user = await users().get('u:' + username);
  const token = await tokenFor(user);
  return json(200, { ok: true, token, session: session(user), meta, recovery: code, now: now() });
}

const LOCK = { max: 8, ms: 10 * 60 * 1000 };
/** Chaque tentative écrit d'abord sa marque (clé unique), puis on compte les marques récentes : des requêtes simultanées ne passent plus entre les mailles. */
async function tooMany(scope, id, max = LOCK.max, ms = LOCK.ms) {
  const prefix = `f:${scope}:${id}/`, store = users();
  await store.set(prefix + now() + '-' + rand(3), { t: now() });
  const cut = now() - ms; let n = 0;
  for (const k of await store.list(prefix)) { if (+k.slice(prefix.length).split('-')[0] >= cut) n++; else await store.delete(k); }
  return n > max;
}
async function clearTries(scope, id) { const store = users(); for (const k of await store.list(`f:${scope}:${id}/`)) await store.delete(k); }
/** Adresse du visiteur telle que Netlify la donne (en-tête posé par leur serveur, pas par le navigateur). */
const clientIp = (req) => String(req.headers.get('x-nf-client-connection-ip') || String(req.headers.get('x-forwarded-for') || '').split(',')[0] || 'local').trim().slice(0, 64);
/** Connexion : une limite par couple (identifiant, adresse) pour qu'un inconnu ne puisse pas bloquer un collègue depuis l'extérieur, et une limite plus large par identifiant pour freiner les attaques réparties. */
async function loginLocked(username, ip) {
  const a = await tooMany('login', username + '|' + ip), b = await tooMany('loginu', username, 40);
  return a || b;
}
async function clearLogin(username) { const store = users(); for (const k of await store.list(`f:login:${username}|`)) await store.delete(k); await clearTries('loginu', username); }
const LOCKED = () => fail(429, 'locked', 'Trop de tentatives. Réessayez dans quelques minutes.');
/** Vérifie le mot de passe de l'utilisateur connecté, avec le même verrouillage que la connexion. Renvoie une réponse d'erreur, ou null si tout va bien. */
async function checkOwnPassword(user, pw) {
  if (await tooMany('pw', user.username)) return LOCKED();
  if (!(await verifyPassword(String(pw || ''), user))) return fail(403, 'bad_credentials', 'Mot de passe incorrect.');
  await clearTries('pw', user.username); return null;
}
async function login(b, ip = 'local') {
  const username = normUser(b.username);
  const u = username ? await users().get('u:' + username) : null;
  if (!u) { await hashPassword('x'); return fail(401, 'bad_credentials', 'Identifiant ou mot de passe incorrect.'); }
  if (await loginLocked(username, ip)) return LOCKED();
  if (!(await verifyPassword(String(b.password || ''), u))) return fail(401, 'bad_credentials', 'Identifiant ou mot de passe incorrect.');
  if (u.disabled) return fail(403, 'account_disabled', "Ce compte a été désactivé par l'animateur pédagogique.");   // révélé seulement à qui connaît le mot de passe
  await clearLogin(username);
  return json(200, { ok: true, token: await tokenFor(u), session: session(u), now: now() });
}

function mergeTeachersAP(curT, incT) {
  const byId = new Map(curT.map(t => [t.id, t]));
  const out = curT.map(t => ({ ...t }));
  for (const inc of incT || []) {
    const cur = byId.get(inc.id);
    if (!cur || inc.deleted || (+inc.u || 0) <= (+cur.u || 0)) continue;
    const i = out.findIndex(t => t.id === inc.id);
    out[i] = { ...cur, name: str(inc.name, 80) || cur.name, short: str(inc.short, 20) || cur.short, phone: str(inc.phone, 30), slots: cleanSlots(inc.slots), u: cu(inc.u) };
  }
  return out;
}
function applyMetaPush(cur, push, ctx) {
  if (ctx.role === 'ap') {
    const inc = {
      dept: cleanDept(push.dept, ctx.deptId),
      classes: (Array.isArray(push.classes) ? push.classes : []).slice(0, MAX.classes).map(cleanClass).filter(Boolean),
      assign: (Array.isArray(push.assign) ? push.assign : []).slice(0, MAX.assign).map(cleanAssign).filter(Boolean),
      regul: (Array.isArray(push.regul) ? push.regul : []).slice(0, MAX.regul).map(cleanRegul).filter(Boolean),
    };
    const merged = mergeMeta({ ...cur, teachers: [] }, { dept: inc.dept, classes: inc.classes, assign: inc.assign, regul: inc.regul });
    merged.teachers = mergeTeachersAP(cur.teachers || [], Array.isArray(push.teachers) ? push.teachers : []);
    merged.rev = cur.rev; merged.dept = { ...merged.dept, id: ctx.deptId };
    if (!merged.assign) merged.assign = [];
    return merged;
  }
  // enseignant : seulement son propre nom et son téléphone
  const mine = (Array.isArray(push.teachers) ? push.teachers : []).find(t => t && t.id === ctx.teacherId);
  const out = { ...cur, teachers: (cur.teachers || []).map(t => ({ ...t })) };
  const i = out.teachers.findIndex(t => t.id === ctx.teacherId);
  if (mine && i >= 0 && cu(mine.u) > (+out.teachers[i].u || 0)) out.teachers[i] = { ...out.teachers[i], name: str(mine.name, 80) || out.teachers[i].name, phone: str(mine.phone, 30), u: now() };
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
  for (const [tid, doc] of Object.entries(push.e && typeof push.e === 'object' ? push.e : {})) {
    if (!(role === 'ap' ? knownTeacher.has(tid) : tid === me) || !doc || !Array.isArray(doc.entries)) continue;
    const incoming = doc.entries.slice(0, MAX.entries).map(e => cleanEntry(e, tid)).filter(Boolean);
    const cur = (await data().get(`${deptId}/e/${tid}`)) || { rev: 0, entries: [] };
    const merged = prune(mergeById(cur.entries, incoming));
    if (merged.length > MAX.entries) return fail(413, 'too_many_entries', 'Trop de saisies pour un seul enseignant.');
    if (!sameJSON(merged, cur.entries)) {
      const rev = (cur.rev || 0) + 1;
      await data().set(`${deptId}/e/${tid}`, { rev, entries: merged });
      await data().set(`${deptId}/r/${tid}`, { rev });
    }
  }
  const wanted = [...knownTeacher];   // tout le monde peut LIRE les saisies du département ; seul le propriétaire (ou l'animateur) peut les modifier
  for (const tid of wanted) {
    const rev = await entryRev(deptId, tid);
    const known = (have.e || {})[tid];
    const pushed = !!(push.e || {})[tid];
    if (rev > 0 && (known == null || rev > known || pushed)) { const d = await data().get(`${deptId}/e/${tid}`); if (d) out[tid] = d; }
  }
  const res = { ok: true, now: now(), e: out };
  // « vu pour la dernière fois » : au plus une écriture par heure et par collègue ; l'animateur reçoit la liste
  const dinfo = (await depts().get('d:' + deptId)) || { id: deptId }, seen = dinfo.seen || {};
  if (!seen[me] || now() - seen[me] > 3600e3) { seen[me] = now(); await depts().set('d:' + deptId, { ...dinfo, seen }); }
  if (role === 'ap') res.seen = seen;
  if (metaChanged || have.meta == null || meta.rev > have.meta) res.meta = role === 'ap' ? meta : { ...meta, teachers: (meta.teachers || []).map(({ username, phone, ...rest }) => (rest.id === me ? { ...rest, phone } : rest)) };   // identifiants de connexion cachés aux enseignants
  res.session = session(ctx.user);   // le rôle peut changer (transfert de l'animation pédagogique)
  if (ctx.exp - now() < 30 * 864e5) res.token = await tokenFor(ctx.user);
  return json(200, res);
}

function needAP(ctx) { return ctx.user.role === 'ap' ? null : fail(403, 'forbidden', "Réservé à l'animateur pédagogique."); }

async function teamAdd(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const deptId = ctx.d, meta = await loadMeta(deptId); if (!meta) return fail(404, 'no_department', 'Département introuvable.');
  if ((meta.teachers || []).filter(t => !t.deleted).length >= MAX.teachers) return fail(400, 'too_many', 'Nombre maximal de collègues atteint.');
  const name = str(b.name, 80).trim(); if (!name) return fail(400, 'bad_name', 'Indiquez le nom du collègue.');
  const ascii = (x) => String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18);
  const base = normUser(b.username) || ascii(str(b.short, 20) || shortName(name)) || 'prof';
  let username = base.length >= 3 ? base : base + '.prof';
  if (!validUser(username)) return fail(400, 'bad_username', 'Identifiant invalide.');
  if (b.username && (await users().get('u:' + username))) return fail(409, 'username_taken', 'Cet identifiant est déjà utilisé.');
  for (let i = 2; await users().get('u:' + username); i++) username = base.slice(0, 20) + i;
  const password = b.password ? String(b.password) : randomCode(6);
  if (!validPassword(password) || weakPassword(password, username)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères, pas trop évident (ni 123456, ni l’identifiant).');
  const tid = 't' + rand(4), t = now();
  await users().set('u:' + username, { username, uid: rand(6), deptId, role: 'teacher', teacherId: tid, ...(await hashPassword(password)), created: t });
  const teacher = { id: tid, name, short: str(b.short, 20).toUpperCase() || shortName(name), username, role: 'teacher', phone: str(b.phone, 30), slots: [], u: t };
  meta.teachers = [...(meta.teachers || []), teacher]; meta.rev = (meta.rev || 0) + 1;
  await saveMeta(deptId, meta);
  for (let k = 0; k < 3; k++) {   // une synchronisation simultanée a pu écraser l'écriture : on vérifie et on recommence si besoin
    const chk = await loadMeta(deptId); if (chk && (chk.teachers || []).some(x => x.id === tid)) { meta.rev = chk.rev; break; }
    const cur = (await loadMeta(deptId)) || meta; cur.teachers = [...(cur.teachers || []), teacher]; cur.rev = (cur.rev || 0) + 1; await saveMeta(deptId, cur);
  }
  return json(200, { ok: true, teacher, username, password, meta: (await loadMeta(deptId)) || meta });
}
async function teamReset(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const meta = (await loadMeta(ctx.d)) || { teachers: [] }, t = (meta.teachers || []).find(x => x.id === b.teacherId && !x.deleted);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  const u = await users().get('u:' + t.username); if (!u) return fail(404, 'not_found', 'Compte introuvable.');
  let password = randomCode(6);
  if (b.password != null && b.password !== '') { password = String(b.password); if (!validPassword(password) || weakPassword(password, t.username)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères, pas trop évident (ni 123456, ni l’identifiant).'); }
  Object.assign(u, await hashPassword(password)); delete u.disabled; u.ver = (u.ver || 0) + 1;
  await users().set('u:' + t.username, u); await clearLogin(t.username);
  return json(200, { ok: true, username: t.username, password });
}
/** L'animateur change l'identifiant d'un collègue (le mot de passe est conservé). */
async function teamRename(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const meta = (await loadMeta(ctx.d)) || { teachers: [] }, t = (meta.teachers || []).find(x => x.id === b.teacherId && !x.deleted);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  const username = normUser(b.username); if (!validUser(username)) return fail(400, 'bad_username', 'Identifiant invalide : 3 à 24 caractères (lettres, chiffres, point, tiret).');
  if (username === t.username) return json(200, { ok: true, username, meta });
  if (await users().get('u:' + username)) return fail(409, 'username_taken', 'Cet identifiant est déjà utilisé.');
  const u = await users().get('u:' + t.username); if (!u) return fail(404, 'not_found', 'Compte introuvable.');
  const nu = { ...u, username, ver: (u.ver || 0) + 1 };
  await users().set('u:' + username, nu); await users().delete('u:' + t.username);
  meta.teachers = meta.teachers.map(x => x.id === t.id ? { ...x, username, u: now() } : x); meta.rev = (meta.rev || 0) + 1;
  await saveMeta(ctx.d, meta);
  if (t.id === ctx.user.teacherId) return json(200, { ok: true, username, meta, token: await tokenFor(nu), session: session(nu) });
  return json(200, { ok: true, username, meta });
}
async function teamRemove(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  const meta = (await loadMeta(ctx.d)) || { teachers: [] }, t = (meta.teachers || []).find(x => x.id === b.teacherId);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  if (t.id === ctx.user.teacherId) return fail(400, 'self', 'Vous ne pouvez pas retirer votre propre compte.');
  const u = await users().get('u:' + t.username); if (!u) return fail(404, 'not_found', 'Compte introuvable.');
  u.disabled = true; u.ver = (u.ver || 0) + 1; await users().set('u:' + t.username, u);
  meta.teachers = meta.teachers.map(x => x.id === t.id ? { ...x, deleted: true, u: now() } : x); meta.rev = (meta.rev || 0) + 1;
  await saveMeta(ctx.d, meta);
  return json(200, { ok: true, meta });
}
/** L'animateur passe la main à un collègue : l'autre devient animateur, lui devient enseignant. Le code de récupération est invalidé (le nouvel animateur en crée un). */
async function teamTransfer(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  { const e = await checkOwnPassword(ctx.user, b.password); if (e) return e; }
  const meta = await loadMeta(ctx.d); if (!meta) return fail(404, 'no_department', 'Département introuvable.');
  const t = (meta.teachers || []).find(x => x.id === b.teacherId && !x.deleted);
  if (!t) return fail(404, 'not_found', 'Collègue introuvable.');
  if (t.id === ctx.user.teacherId) return fail(400, 'self', 'Choisissez un autre collègue.');
  const target = await users().get('u:' + t.username); if (!target || target.disabled) return fail(404, 'not_found', 'Compte introuvable.');
  target.role = 'ap'; ctx.user.role = 'teacher';
  await users().set('u:' + target.username, target); await users().set('u:' + ctx.user.username, ctx.user);
  const d = (await depts().get('d:' + ctx.d)) || { id: ctx.d };
  d.ap = target.username; d.recovery = await hashPassword(randomCode(24)); await depts().set('d:' + ctx.d, d);
  meta.teachers = meta.teachers.map(x => (x.id === t.id ? { ...x, role: 'ap', u: now() } : x.id === ctx.user.teacherId ? { ...x, role: 'teacher', u: now() } : x)); meta.rev = (meta.rev || 0) + 1;
  await saveMeta(ctx.d, meta);
  return json(200, { ok: true, meta: { ...meta, teachers: meta.teachers.map(({ username, ...rest }) => rest) }, session: session(ctx.user) });
}
/** Nouveau code de récupération (animateur, avec son mot de passe). */
async function newRecovery(ctx, b) {
  const bad = needAP(ctx); if (bad) return bad;
  { const e = await checkOwnPassword(ctx.user, b.password); if (e) return e; }
  const d = (await depts().get('d:' + ctx.d)) || { id: ctx.d }, code = recoveryCode();
  d.recovery = await hashPassword(code.replace(/-/g, '')); await depts().set('d:' + ctx.d, d);
  return json(200, { ok: true, recovery: code });
}
async function changePassword(ctx, b) {
  if (!validPassword(b.password) || weakPassword(b.password, ctx.user.username)) return fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères, pas trop évident (ni 123456, ni l’identifiant).');
  if (await tooMany('pw', ctx.user.username)) return LOCKED();
  if (!(await verifyPassword(String(b.old || ''), ctx.user))) return fail(403, 'bad_credentials', 'Ancien mot de passe incorrect.');
  await clearTries('pw', ctx.user.username);
  Object.assign(ctx.user, await hashPassword(b.password)); ctx.user.ver = (ctx.user.ver || 0) + 1;   // les anciens jetons (téléphone volé…) cessent de marcher
  await users().set('u:' + ctx.user.username, ctx.user);
  return json(200, { ok: true, token: await tokenFor(ctx.user) });
}
async function recover(b, ip = 'local') {
  const username = normUser(b.username), u = username ? await users().get('u:' + username) : null;
  const bad = () => fail(403, 'bad_code', 'Identifiant ou code de récupération incorrect.');   // même réponse dans tous les cas : on ne révèle pas quels identifiants existent
  if (!u || u.role !== 'ap' || !validPassword(b.password) || weakPassword(b.password, username)) { await hashPassword('x'); return validPassword(b.password) && !weakPassword(b.password, username) ? bad() : fail(400, 'bad_password', 'Mot de passe : au moins 6 caractères.'); }
  if (await tooMany('recover', username + '|' + ip) || await tooMany('recoveru', username, 40)) return LOCKED();
  const d = await depts().get('d:' + u.deptId);
  if (!d || !(await verifyPassword(String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), d.recovery))) return bad();
  await clearTries('recover', username); await clearLogin(username);
  Object.assign(u, await hashPassword(b.password)); delete u.disabled; u.ver = (u.ver || 0) + 1; await users().set('u:' + username, u);
  const code = recoveryCode(); d.recovery = await hashPassword(code.replace(/-/g, '')); await depts().set('d:' + u.deptId, d);
  return json(200, { ok: true, recovery: code });
}

export async function handle(req) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)/, '').replace(/\/+$/, '') || '/';
    if (path === '/ping') return json(200, { ok: true, time: now() });
    if (req.method !== 'POST') return fail(405, 'method', 'Méthode non autorisée.');
    const origin = req.headers.get('origin');   // un autre site web ne peut pas appeler l'API avec le navigateur de nos utilisateurs
    let oh = ''; try { oh = origin && origin !== 'null' ? new URL(origin).host : ''; } catch { return fail(403, 'origin', 'Origine non autorisée.'); }
    if (origin && origin !== 'null' && ![url.host, req.headers.get('host')].includes(oh)) return fail(403, 'origin', 'Origine non autorisée.');
    if (origin === 'null') return fail(403, 'origin', 'Origine non autorisée.');
    if (!/^application\/json/i.test(req.headers.get('content-type') || '')) return fail(415, 'content_type', 'Type de contenu non pris en charge.');
    if (+(req.headers.get('content-length') || 0) > MAX.body) return fail(413, 'too_large', 'Requête invalide.');
    const body = await readBody(req), ip = clientIp(req);
    if (path === '/signup') return await signup(body, ip);
    if (path === '/login') return await login(body, ip);
    if (path === '/recover') return await recover(body, ip);
    const ctx = await auth(req);
    if (!ctx) return fail(401, 'unauthorized', 'Session expirée : reconnectez-vous.');
    switch (path) {
      case '/sync': return await sync(req, ctx, body);
      case '/team/add': return await teamAdd(ctx, body);
      case '/team/reset': return await teamReset(ctx, body);
      case '/team/remove': return await teamRemove(ctx, body);
      case '/team/rename': return await teamRename(ctx, body);
      case '/team/transfer': return await teamTransfer(ctx, body);
      case '/me/recovery': return await newRecovery(ctx, body);
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
