import test from 'node:test';
import assert from 'node:assert/strict';
import { setStoreFactory, memoryFactory } from '../netlify/functions/lib/store.mjs';
import { resetSecretCache } from '../netlify/functions/lib/auth.mjs';
import { handle, shortName } from '../netlify/functions/lib/handler.mjs';

function fresh() { setStoreFactory(memoryFactory()); resetSecretCache(); }
async function call(path, body, token) {
  const headers = { 'content-type': 'application/json' }; if (token) headers.authorization = 'Bearer ' + token;
  const res = await handle(new Request('http://x/api' + path, { method: 'POST', headers, body: JSON.stringify(body || {}) }));
  return { status: res.status, ...(await res.json()) };
}
const dept = (name = 'GBHS GAROUA') => ({ name, discipline: 'GEOGRAPHY', abbr: 'GEO', system: 'anglophone', year: '2026/2027' });
async function newDept(username = 'kamdem', name = 'Mr KAMDEM') {
  const r = await call('/signup', { username, password: 'secret1', name, dept: dept() });
  assert.equal(r.status, 200, JSON.stringify(r)); return r;
}
const entry = (id, over = {}) => ({ id, type: 'lesson', classId: 'c1', date: '2026-10-05', start: '07:30', end: '09:30', minutes: 120, n: 1, title: 'x', u: Date.now(), ...over });

test('inscription : crée le département, un compte AP, un code de récupération', async () => {
  fresh(); const r = await newDept();
  assert.ok(r.token && r.session.role === 'ap' && r.session.deptId && r.recovery.length === 14);
  assert.equal(r.meta.teachers.length, 1); assert.equal(r.meta.teachers[0].role, 'ap');
  assert.equal((await call('/signup', { username: 'KAMDEM', password: 'secret1', name: 'x' })).status, 409);
  assert.equal((await call('/signup', { username: 'ab', password: 'secret1', name: 'x' })).status, 400);
  assert.equal((await call('/signup', { username: 'okay.user', password: '123', name: 'x' })).status, 400);
});

test('connexion : bon mot de passe, mauvais mot de passe, verrouillage après 8 échecs', async () => {
  fresh(); await newDept();
  assert.equal((await call('/login', { username: 'Kamdem', password: 'secret1' })).status, 200);
  for (let i = 0; i < 8; i++) assert.equal((await call('/login', { username: 'kamdem', password: 'nope' + i })).status, 401);
  assert.equal((await call('/login', { username: 'kamdem', password: 'secret1' })).status, 429);
  assert.equal((await call('/login', { username: 'inconnu', password: 'secret1' })).status, 401);
});

test('équipe : ajout (mot de passe généré), connexion du collègue, doublons, retrait', async () => {
  fresh(); const ap = await newDept();
  const a = await call('/team/add', { name: 'Noura Astha' }, ap.token);
  assert.equal(a.status, 200); assert.equal(a.username, 'noura.astha'); assert.equal(a.password.length, 6);
  const b = await call('/team/add', { name: 'Noura Astha' }, ap.token);
  assert.notEqual(b.username, a.username);
  const l = await call('/login', { username: a.username, password: a.password });
  assert.equal(l.status, 200); assert.equal(l.session.role, 'teacher'); assert.equal(l.session.deptId, ap.session.deptId);
  assert.equal((await call('/team/add', { name: 'Intrus' }, l.token)).status, 403);
  assert.equal((await call('/team/remove', { teacherId: a.teacher.id }, ap.token)).status, 200);
  assert.equal((await call('/login', { username: a.username, password: a.password })).status, 403);
  assert.equal((await call('/team/remove', { teacherId: ap.session.teacherId }, ap.token)).status, 400);
  assert.equal((await call('/team/reset', { teacherId: a.teacher.id }, ap.token)).status, 404, 'un collègue retiré ne peut plus être réinitialisé');
  const reset = await call('/team/reset', { teacherId: b.teacher.id }, ap.token);
  assert.equal(reset.status, 200);
  assert.equal((await call('/login', { username: b.username, password: b.password })).status, 401, 'ancien mot de passe invalide');
  assert.equal((await call('/login', { username: b.username, password: reset.password })).status, 200);
});

test('synchronisation : droits par rôle, fusion, suppression propagée, isolation', async () => {
  fresh(); const ap = await newDept('kamdem');
  const t1 = await call('/team/add', { name: 'Prof Un' }, ap.token), t2 = await call('/team/add', { name: 'Prof Deux' }, ap.token);
  const T1 = (await call('/login', { username: t1.username, password: t1.password })), T2 = (await call('/login', { username: t2.username, password: t2.password }));
  // l'AP envoie une classe, un emploi du temps et la config
  let s = await call('/sync', { have: {}, push: { meta: { ...ap.meta, dept: { ...ap.meta.dept, name: 'LYCÉE X', u: Date.now() + 10 }, classes: [{ id: 'c1', u: Date.now(), name: 'Form 3 A', cycle: '1er' }], assign: [{ id: 'T:c1', teacherId: 'T', classId: 'c1', th: 40, pr: 5, hours: 66, u: Date.now() }],
    teachers: [...ap.meta.teachers, { id: t1.teacher.id, name: 'Prof Un', short: 'UN', phone: '650', slots: [{ d: 1, c: 'c1', h: 2 }], u: Date.now() + 5 }, { id: 'zzz', name: 'Pirate', u: Date.now() + 5 }] } } }, ap.token);
  assert.equal(s.status, 200); assert.equal(s.meta.dept.name, 'LYCÉE X'); assert.equal(s.meta.classes.length, 1); assert.equal(s.meta.assign[0].th, 40);
  assert.equal(s.meta.teachers.find(t => t.id === t1.teacher.id).slots.length, 1);
  assert.ok(!s.meta.teachers.some(t => t.id === 'zzz'), 'un enseignant ne peut pas être créé par synchronisation');
  assert.equal(s.meta.teachers.find(t => t.id === t1.teacher.id).username, t1.username, 'identifiant protégé');
  // un enseignant ne peut pas modifier la config ni les classes, mais peut changer son téléphone
  s = await call('/sync', { have: {}, push: { meta: { dept: { name: 'HACK', u: Date.now() + 99 }, classes: [{ id: 'c9', name: 'hack', u: Date.now() + 99 }], teachers: [{ id: t1.teacher.id, name: 'Prof Un', phone: '699', u: Date.now() + 99 }, { id: t2.teacher.id, name: 'Vol', phone: '1', u: Date.now() + 99 }] } } }, T1.token);
  assert.equal(s.meta.dept.name, 'LYCÉE X'); assert.equal(s.meta.classes.length, 1);
  assert.equal(s.meta.teachers.find(t => t.id === t1.teacher.id).phone, '699');
  assert.notEqual(s.meta.teachers.find(t => t.id === t2.teacher.id).name, 'Vol');
  // entrées : chacun écrit chez soi ; l'AP voit tout ; un enseignant ne voit pas les autres
  const e1 = entry('e1', { u: 1000 }), e2 = entry('e2', { u: 1000, teacherId: 'AUTRE' });
  s = await call('/sync', { have: {}, push: { e: { [t1.teacher.id]: { entries: [e1, e2] }, [t2.teacher.id]: { entries: [entry('evol')] } } } }, T1.token);
  assert.deepEqual(Object.keys(s.e), [t1.teacher.id]);
  assert.ok(s.e[t1.teacher.id].entries.every(e => e.teacherId === t1.teacher.id), 'teacherId forcé');
  s = await call('/sync', { have: {}, push: { e: { [t2.teacher.id]: { entries: [entry('f1')] } } } }, T2.token);
  assert.deepEqual(Object.keys(s.e), [t2.teacher.id]);
  s = await call('/sync', { have: {} }, ap.token);
  assert.equal(s.e[t1.teacher.id].entries.length, 2); assert.equal(s.e[t2.teacher.id].entries.length, 1);
  // à jour : rien à renvoyer ; puis modification plus récente + suppression
  const rev = s.e[t1.teacher.id].rev;
  s = await call('/sync', { have: { meta: s.meta.rev, e: { [t1.teacher.id]: rev, [t2.teacher.id]: 1 } } }, ap.token);
  assert.deepEqual(s.e, {}); assert.equal(s.meta, undefined);
  s = await call('/sync', { have: {}, push: { e: { [t1.teacher.id]: { entries: [{ ...e1, title: 'ancien', u: 500 }, { id: 'e2', deleted: true, u: Date.now() }, entry('e3', { u: 2000 })] } } } }, T1.token);
  const list = s.e[t1.teacher.id].entries;
  assert.equal(list.find(e => e.id === 'e1').title, 'x', 'le plus ancien ne gagne pas');
  assert.ok(list.find(e => e.id === 'e2').deleted, 'suppression propagée'); assert.ok(list.some(e => e.id === 'e3'));
  // un entrée mal formée est nettoyée
  s = await call('/sync', { have: {}, push: { e: { [t1.teacher.id]: { entries: [entry('e4', { type: 'hack', date: 'pas une date', minutes: 99999, title: 'a'.repeat(900) })] } } } }, T1.token);
  const e4 = s.e[t1.teacher.id].entries.find(e => e.id === 'e4'); assert.equal(e4.type, 'lesson'); assert.equal(e4.date, ''); assert.equal(e4.minutes, 1440); assert.equal(e4.title.length, 200);
  // isolation entre départements
  const other = await newDept('autre.prof', 'Autre Prof');
  const o = await call('/sync', { have: {} }, other.token);
  assert.equal(o.meta.dept.name !== 'LYCÉE X', true); assert.deepEqual(Object.keys(o.e), []);
  assert.equal((await call('/sync', { have: {}, push: { e: { [t1.teacher.id]: { entries: [entry('inj')] } } } }, other.token)).e[t1.teacher.id], undefined);
});

test('jeton : falsifié ou compte désactivé = refusé', async () => {
  fresh(); const ap = await newDept(); const t = await call('/team/add', { name: 'Prof' }, ap.token);
  const tl = await call('/login', { username: t.username, password: t.password });
  assert.equal((await call('/sync', {}, ap.token + 'x')).status, 401);
  assert.equal((await call('/sync', {}, 'abc.def')).status, 401);
  assert.equal((await call('/sync', {})).status, 401);
  await call('/team/remove', { teacherId: t.teacher.id }, ap.token);
  assert.equal((await call('/sync', {}, tl.token)).status, 401);
});

test('mot de passe : changement, récupération par code', async () => {
  fresh(); const ap = await newDept();
  assert.equal((await call('/me/password', { old: 'faux', password: 'nouveau1' }, ap.token)).status, 403);
  assert.equal((await call('/me/password', { old: 'secret1', password: 'nouveau1' }, ap.token)).status, 200);
  assert.equal((await call('/login', { username: 'kamdem', password: 'nouveau1' })).status, 200);
  assert.equal((await call('/recover', { username: 'kamdem', code: 'AAAA-BBBB-CCCC', password: 'autre123' })).status, 403);
  const r = await call('/recover', { username: 'kamdem', code: ap.recovery.toLowerCase(), password: 'autre123' });
  assert.equal(r.status, 200); assert.notEqual(r.recovery, ap.recovery);
  assert.equal((await call('/login', { username: 'kamdem', password: 'autre123' })).status, 200);
  assert.equal((await call('/recover', { username: 'kamdem', code: ap.recovery, password: 'encore123' })).status, 403, 'ancien code invalide');
});

test('nom court : le nom de famille en majuscules', () => {
  assert.equal(shortName('Mr. KAMDEM Emmanuel'), 'KAMDEM'); assert.equal(shortName('Mme. ASTHA Noura'), 'ASTHA'); assert.equal(shortName('Mme TSOGO Sylviane'), 'TSOGO');
  assert.equal(shortName('Jean Dupont'), 'DUPONT'); assert.equal(shortName('M. NEBASIBI Ennese'), 'NEBASIBI'); assert.equal(shortName(''), '');
});
