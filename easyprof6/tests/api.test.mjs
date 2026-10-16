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
  assert.equal(a.status, 200); assert.equal(a.username, 'astha', 'identifiant = nom de famille'); assert.equal(a.password.length, 6);
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
  // entrées : chacun écrit chez soi ; l'AP voit tout ; un enseignant lit les autres sans pouvoir les modifier
  const e1 = entry('e1', { u: 1000 }), e2 = entry('e2', { u: 1000, teacherId: 'AUTRE' });
  s = await call('/sync', { have: {}, push: { e: { [t1.teacher.id]: { entries: [e1, e2] }, [t2.teacher.id]: { entries: [entry('evol')] } } } }, T1.token);
  assert.deepEqual(Object.keys(s.e), [t1.teacher.id]);
  assert.ok(s.e[t1.teacher.id].entries.every(e => e.teacherId === t1.teacher.id), 'teacherId forcé');
  s = await call('/sync', { have: {}, push: { e: { [t2.teacher.id]: { entries: [entry('f1')] } } } }, T2.token);
  assert.deepEqual(Object.keys(s.e).sort(), [t1.teacher.id, t2.teacher.id].sort(), 'un enseignant LIT les saisies des autres (lecture seule)');
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

test('équipe : identifiant = nom de famille, changement d’identifiant et mot de passe choisi par l’animateur', async () => {
  fresh(); const ap = await newDept();
  const a = await call('/team/add', { name: 'Mme TSOGO Sylviane' }, ap.token);
  assert.equal(a.username, 'tsogo');
  const bad = await call('/team/reset', { teacherId: a.teacher.id, password: '123' }, ap.token); assert.equal(bad.status, 400);
  const r = await call('/team/reset', { teacherId: a.teacher.id, password: 'tsogo26' }, ap.token); assert.equal(r.password, 'tsogo26');
  assert.equal((await call('/login', { username: 'tsogo', password: 'tsogo26' })).status, 200);
  const n = await call('/team/rename', { teacherId: a.teacher.id, username: 'sylviane' }, ap.token); assert.equal(n.status, 200); assert.equal(n.username, 'sylviane');
  assert.equal((await call('/login', { username: 'sylviane', password: 'tsogo26' })).status, 200, 'même mot de passe sous le nouvel identifiant');
  assert.equal((await call('/login', { username: 'tsogo', password: 'tsogo26' })).status, 401, 'ancien identifiant supprimé');
  const other = await call('/team/add', { name: 'Mr. AUTRE Paul' }, ap.token);
  assert.equal((await call('/team/rename', { teacherId: other.teacher.id, username: 'sylviane' }, ap.token)).status, 409, 'identifiant déjà pris');
  assert.equal((await call('/team/rename', { teacherId: other.teacher.id, username: 'x' }, ap.token)).status, 400);
  const t = await call('/login', { username: 'sylviane', password: 'tsogo26' });
  assert.equal((await call('/team/rename', { teacherId: other.teacher.id, username: 'zzz' }, t.token)).status, 403, 'réservé à l’animateur');
});

test('lecture pour tous, écriture pour le propriétaire : un collègue voit les saisies des autres sans pouvoir les modifier ; identifiants cachés', async () => {
  fresh(); const ap = await newDept();
  const a = await call('/team/add', { name: 'Mme ASTHA Noura', password: 'astha1' }, ap.token), b = await call('/team/add', { name: 'Mr. TSOGO Paul', password: 'tsogo1' }, ap.token);
  const la = await call('/login', { username: 'astha', password: 'astha1' }), lb = await call('/login', { username: 'tsogo', password: 'tsogo1' });
  const e1 = entry('e-astha', { classId: 'c1', n: 1 });
  assert.equal((await call('/sync', { push: { e: { [a.teacher.id]: { entries: [e1] } } } }, la.token)).status, 200);
  const r = await call('/sync', { have: {}, push: {} }, lb.token);
  assert.ok(r.e[a.teacher.id] && r.e[a.teacher.id].entries.some(x => x.id === 'e-astha'), 'TSOGO lit la saisie d’ASTHA');
  assert.ok(r.meta.teachers.every(t => t.username === undefined), 'identifiants de connexion cachés aux enseignants');
  const hijack = await call('/sync', { push: { e: { [a.teacher.id]: { entries: [{ ...e1, title: 'piraté', u: Date.now() + 10 }] } } } }, lb.token);
  assert.equal(hijack.status, 200);
  const again = await call('/sync', { have: {}, push: {} }, la.token);
  assert.equal(again.e[a.teacher.id].entries.find(x => x.id === 'e-astha').title, 'x', 'TSOGO ne peut pas modifier la saisie d’ASTHA');
  const apView = await call('/sync', { have: {}, push: {} }, ap.token); assert.ok(apView.meta.teachers.some(t => t.username === 'astha'), 'l’animateur voit les identifiants');
});

test('transfert du rôle d’animateur : l’autre devient animateur, l’ancien devient enseignant, le code de récupération est invalidé', async () => {
  fresh(); const ap = await newDept(); const a = await call('/team/add', { name: 'Mme ASTHA Noura', password: 'astha1' }, ap.token);
  assert.equal((await call('/team/transfer', { teacherId: a.teacher.id, password: 'faux' }, ap.token)).status, 403, 'mot de passe exigé');
  const la = await call('/login', { username: 'astha', password: 'astha1' });
  assert.equal((await call('/team/transfer', { teacherId: a.teacher.id, password: 'astha1' }, la.token)).status, 403, 'un enseignant ne peut pas transférer');
  const tr = await call('/team/transfer', { teacherId: a.teacher.id, password: 'secret1' }, ap.token);
  assert.equal(tr.status, 200); assert.equal(tr.session.role, 'teacher');
  assert.equal((await call('/team/add', { name: 'Intrus' }, ap.token)).status, 403, 'l’ancien animateur n’a plus la main');
  const ok = await call('/team/add', { name: 'Mr NOUVEAU Paul' }, la.token); assert.equal(ok.status, 200, 'le nouvel animateur crée un compte');
  const s = await call('/sync', { have: {}, push: {} }, la.token); assert.equal(s.session.role, 'ap');
  assert.equal((await call('/recover', { username: 'astha', code: ap.recovery, password: 'pirate1' })).status, 403, 'l’ancien code est invalidé');
  const rc = await call('/me/recovery', { password: 'astha1' }, la.token); assert.equal(rc.status, 200); assert.equal(rc.recovery.length, 14);
  assert.equal((await call('/recover', { username: 'astha', code: rc.recovery, password: 'neuf123' })).status, 200, 'le nouveau code fonctionne');
});

test('sécurité : verrouillage fiable même avec des requêtes simultanées, aussi sur les routes à mot de passe', async () => {
  fresh(); const ap = await newDept();
  const rs = await Promise.all(Array.from({ length: 30 }, () => call('/login', { username: 'kamdem', password: 'faux-faux' })));
  assert.ok(rs.filter(r => r.status === 429).length >= 15, 'la majorité des tentatives simultanées est bloquée (' + rs.filter(r => r.status === 429).length + ')');
  assert.equal((await call('/login', { username: 'kamdem', password: 'secret1' })).status, 429, 'même le bon mot de passe est refusé pendant le verrouillage');
  fresh(); const ap2 = await newDept(); let last;
  for (let i = 0; i < 12; i++) last = await call('/me/recovery', { password: 'mauvais' }, ap2.token);
  assert.equal(last.status, 429, 'deviner le mot de passe via /me/recovery est limité aussi');
  for (let i = 0; i < 12; i++) last = await call('/recover', { username: 'kamdem', code: 'AAAA-BBBB-CCCC', password: 'neuf123' });
  assert.equal(last.status, 429, 'et via /recover');
});

test('sécurité : changement de mot de passe, réinitialisation, récupération et renommage annulent les anciens jetons', async () => {
  fresh(); const ap = await newDept();
  const a = await call('/team/add', { name: 'Mme ASTHA Noura', password: 'astha1' }, ap.token), la = await call('/login', { username: 'astha', password: 'astha1' });
  assert.equal((await call('/me', {}, la.token)).status, 200);
  const rs = await call('/team/reset', { teacherId: a.teacher.id, password: 'astha2' }, ap.token); assert.equal(rs.status, 200);
  assert.equal((await call('/me', {}, la.token)).status, 401, 'après réinitialisation, l’ancien jeton ne marche plus');
  const lb = await call('/login', { username: 'astha', password: 'astha2' }); assert.equal((await call('/me', {}, lb.token)).status, 200);
  const cp = await call('/me/password', { old: 'astha2', password: 'astha3' }, lb.token); assert.equal(cp.status, 200); assert.ok(cp.token);
  assert.equal((await call('/me', {}, lb.token)).status, 401, 'l’ancien jeton est annulé après changement de mot de passe');
  assert.equal((await call('/me', {}, cp.token)).status, 200, 'le nouveau jeton, renvoyé par le serveur, fonctionne');
  const rn = await call('/team/rename', { teacherId: a.teacher.id, username: 'noura' }, ap.token); assert.equal(rn.status, 200);
  assert.equal((await call('/me', {}, cp.token)).status, 401, 'l’ancien identifiant ne donne plus accès');
  const again = await call('/team/add', { name: 'Autre ASTHA', username: 'astha', password: 'autre1' }, ap.token); assert.equal(again.status, 200, 'l’identifiant libéré peut être réutilisé');
  assert.equal((await call('/me', {}, cp.token)).status, 401, 'un ancien jeton ne prend pas le compte du nouvel « astha »');
});

test('sécurité : un enseignant ne peut pas bloquer les modifications de l’animateur avec une date démesurée ; corps mal formés sans erreur 500 ; /recover ne révèle rien', async () => {
  fresh(); const ap = await newDept();
  const a = await call('/team/add', { name: 'Mme ASTHA Noura', password: 'astha1' }, ap.token), la = await call('/login', { username: 'astha', password: 'astha1' });
  const far = Date.now() + 9e12;
  await call('/sync', { push: { meta: { teachers: [{ id: a.teacher.id, name: 'Alice', phone: '1', u: far }] } } }, la.token);
  const s = await call('/sync', { have: {}, push: { meta: { ...ap.meta, teachers: [...ap.meta.teachers, { ...a.teacher, name: 'Alice AP', slots: [{ d: 1, c: 'c1', h: 2 }], u: Date.now() + 100 }] } } }, ap.token);
  const t = s.meta.teachers.find(x => x.id === a.teacher.id); assert.equal(t.slots.length, 1, 'l’animateur peut toujours modifier l’emploi du temps'); assert.ok(t.u < Date.now() + 4e5, 'date plafonnée');
  for (const body of [{ push: { e: { [a.teacher.id]: null } } }, { push: { meta: { teachers: 5, classes: 'x' } } }, { push: { e: 'x' } }, { push: { meta: { teachers: [{ id: a.teacher.id, slots: [null, 3] }] } } }]) {
    const r = await call('/sync', body, la.token); assert.ok(r.status < 500, 'pas d’erreur 500 pour ' + JSON.stringify(body).slice(0, 50));
    const r2 = await call('/sync', body, ap.token); assert.ok(r2.status < 500);
  }
  const r1 = await call('/recover', { username: 'inconnu', code: 'AAAA-BBBB-CCCC', password: 'neuf123' }), r2 = await call('/recover', { username: 'astha', code: 'AAAA-BBBB-CCCC', password: 'neuf123' }), r3 = await call('/recover', { username: 'kamdem', code: 'AAAA-BBBB-CCCC', password: 'neuf123' });
  assert.deepEqual([r1.status, r2.status], [r3.status, r3.status], 'même réponse pour un inconnu, un enseignant et un animateur');
});

test('l’animateur change son propre identifiant : nouveau jeton valable, ancien identifiant libéré', async () => {
  fresh(); const ap = await newDept('0903');
  const n = await call('/team/rename', { teacherId: ap.session.teacherId, username: 'kamdem' }, ap.token);
  assert.equal(n.status, 200); assert.equal(n.session.username, 'kamdem'); assert.ok(n.token);
  assert.equal((await call('/me', null, n.token)).status, 200, 'le nouveau jeton fonctionne');
  assert.equal((await call('/login', { username: '0903', password: 'secret1' })).status, 401);
  assert.equal((await call('/login', { username: 'kamdem', password: 'secret1' })).status, 200);
});

test('la durée de l’heure de cours (50 min) est conservée par le serveur', async () => {
  fresh(); const r = await call('/signup', { username: 'dgcast1', password: 'secret1', name: 'Mr KAMDEM', dept: { ...dept(), period: 50 } });
  assert.equal(r.status, 200); assert.equal(r.meta.dept.period, 50);
  const r2 = await call('/signup', { username: 'dgcast2', password: 'secret1', name: 'Mr X', dept: { ...dept(), period: 12 } }); assert.equal(r2.meta.dept.period, 60, 'valeur absurde → 60');
});

test('le serveur garde les leçons et heures de théorie / TP du programme', async () => {
  fresh(); const ap = await newDept('prog1'); const tid = ap.session.teacherId;
  const meta = { dept: ap.meta.dept, classes: [{ id: 'c9', name: 'Geo 3G', cycle: '1er', effectif: { total: 40, girls: 20, boys: 20 }, u: Date.now() }], assign: [{ id: tid + ':c9', teacherId: tid, classId: 'c9', th: 42, pr: 4, hth: 60, hpr: 6, hours: 66, u: Date.now() }], teachers: ap.meta.teachers, regul: [] };
  const r = await call('/sync', { have: {}, push: { meta } }, ap.token); assert.equal(r.status, 200, JSON.stringify(r).slice(0, 200));
  const a = ((r.meta || {}).assign || []).find(x => x.classId === 'c9'); assert.ok(a, 'affectation présente'); assert.deepEqual([a.th, a.pr, a.hth, a.hpr, a.hours], [42, 4, 60, 6, 66]);
});

/* ---------- sécurité : ce qu'un attaquant essaierait ---------- */
async function callH(path, body, token, extra = {}, raw) {
  const headers = { 'content-type': 'application/json', ...extra }; if (token) headers.authorization = 'Bearer ' + token;
  const res = await handle(new Request('http://x/api' + path, { method: 'POST', headers, body: raw != null ? raw : JSON.stringify(body || {}) }));
  return { status: res.status, ...(await res.json()) };
}

test('sécurité : un autre site web ne peut pas appeler l’API (origine), ni envoyer autre chose que du JSON', async () => {
  fresh(); await newDept('securite1');
  assert.equal((await callH('/login', { username: 'securite1', password: 'secret1' }, null, { origin: 'http://x' })).status, 200, 'même origine : accepté');
  assert.equal((await callH('/login', { username: 'securite1', password: 'secret1' }, null, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await callH('/login', { username: 'securite1', password: 'secret1' }, null, { origin: 'null' })).status, 403);
  assert.equal((await callH('/login', null, null, { 'content-type': 'text/plain' }, '{"username":"securite1","password":"secret1"}')).status, 415);
});

test('sécurité : mots de passe évidents refusés partout', async () => {
  fresh();
  for (const pw of ['123456', 'password', 'aaaaaa', 'pirate']) assert.equal((await call('/signup', { username: pw === 'pirate' ? 'pirate' : 'faible1', password: pw, name: 'X', dept: dept() })).status, 400, pw);
  const ap = await newDept('kamdem2');
  assert.equal((await call('/me/password', { old: 'secret1', password: 'kamdem2' }, ap.token)).status, 400, 'identique à l’identifiant');
  const a = await call('/team/add', { name: 'Mme TSOGO Sylviane' }, ap.token);
  assert.equal((await call('/team/reset', { teacherId: a.teacher.id, password: '123456' }, ap.token)).status, 400);
});

test('sécurité : inscription limitée par adresse et par jour, code d’inscription facultatif', async () => {
  fresh(); const ip = { 'x-nf-client-connection-ip': '10.0.0.1' };
  for (let i = 0; i < 5; i++) assert.equal((await callH('/signup', { username: 'spam' + i + 'abc', password: 'secret1', name: 'Spam', dept: dept() }, null, ip)).status, 200, 'inscription ' + i);
  assert.equal((await callH('/signup', { username: 'spam9abc', password: 'secret1', name: 'Spam', dept: dept() }, null, ip)).status, 429, 'la 6e depuis la même adresse est refusée');
  assert.equal((await callH('/signup', { username: 'autre1', password: 'secret1', name: 'Autre', dept: dept() }, null, { 'x-nf-client-connection-ip': '10.0.0.2' })).status, 200, 'une autre adresse passe');
  process.env.REKORT_SIGNUP_CODE = 'ecole2026';
  try {
    const ip3 = { 'x-nf-client-connection-ip': '10.0.0.3' };
    assert.equal((await callH('/signup', { username: 'code1abc', password: 'secret1', name: 'C', dept: dept() }, null, ip3)).status, 403);
    assert.equal((await callH('/signup', { username: 'code1abc', password: 'secret1', name: 'C', dept: dept(), signupCode: 'ecole2026' }, null, ip3)).status, 200);
  } finally { delete process.env.REKORT_SIGNUP_CODE; }
});

test('sécurité : un inconnu ne peut pas bloquer la connexion d’un collègue ; les essais sont comptés par adresse', async () => {
  fresh(); await newDept('victime1');
  const evil = { 'x-nf-client-connection-ip': '6.6.6.6' }, ok = { 'x-nf-client-connection-ip': '7.7.7.7' };
  let last; for (let i = 0; i < 12; i++) last = await callH('/login', { username: 'victime1', password: 'faux' + i + 'xx' }, null, evil);
  assert.equal(last.status, 429, 'l’attaquant est bloqué');
  assert.equal((await callH('/login', { username: 'victime1', password: 'secret1' }, null, ok)).status, 200, 'le vrai propriétaire, depuis une autre adresse, se connecte');
});

test('sécurité : le compte désactivé n’est révélé qu’avec le bon mot de passe ; les numéros de téléphone ne sont pas diffusés aux collègues', async () => {
  fresh(); const ap = await newDept('chef1');
  const a = await call('/team/add', { name: 'Mme ASTHA Noura', phone: '655000111' }, ap.token), b = await call('/team/add', { name: 'Mr NEBA Paul', phone: '677000222' }, ap.token);
  const loginA = await call('/login', { username: a.username, password: a.password });
  const s = await call('/sync', { have: {} }, loginA.token);
  const tA = s.meta.teachers.find(t => t.id === a.teacher.id), tB = s.meta.teachers.find(t => t.id === b.teacher.id), tAP = s.meta.teachers.find(t => t.role === 'ap');
  assert.equal(tA.phone, '655000111', 'son propre numéro reste visible'); assert.equal(tB.phone, undefined); assert.equal(tAP.phone, undefined); assert.equal(tB.username, undefined);
  await call('/team/remove', { teacherId: b.teacher.id }, ap.token);
  assert.equal((await call('/login', { username: b.username, password: 'mauvais1' })).status, 401, 'mauvais mot de passe : réponse banale');
  assert.equal((await call('/login', { username: b.username, password: b.password })).status, 403, 'bon mot de passe : on apprend que le compte est désactivé');
});

test('sécurité : un enseignant ne peut ni se donner le rôle d’animateur, ni écrire chez un autre, ni polluer les objets (proto)', async () => {
  fresh(); const ap = await newDept('chef2');
  const a = await call('/team/add', { name: 'Mme ASTHA Noura' }, ap.token), b = await call('/team/add', { name: 'Mr NEBA Paul' }, ap.token);
  const T = (await call('/login', { username: a.username, password: a.password })).token;
  const evil = '{"have":{},"push":{"__proto__":{"role":"ap","polluted":1},"meta":{"__proto__":{"role":"ap"},"teachers":[{"id":"' + a.teacher.id + '","role":"ap","name":"X","u":9999999999999,"__proto__":{"role":"ap"}}],"classes":[{"id":"cx","name":"hack","u":9999999999999}],"dept":{"name":"HACK","u":9999999999999}},"e":{"' + b.teacher.id + '":{"entries":[{"id":"e-evil","type":"lesson","date":"2026-10-05","u":1}]},"' + a.teacher.id + '":{"entries":[{"id":"e-mine","type":"lesson","date":"2026-10-05","teacherId":"' + b.teacher.id + '","u":1}]}}}}';
  const r = await callH('/sync', null, T, {}, evil);
  assert.equal(r.status, 200); assert.equal({}.polluted, undefined); assert.equal({}.role, undefined);
  const sApi = await call('/sync', { have: {} }, ap.token);
  const me = sApi.meta.teachers.find(t => t.id === a.teacher.id);
  assert.equal(me.role, 'teacher', 'le rôle n’a pas changé'); assert.ok(!sApi.meta.classes.some(c => c.id === 'cx'), 'un enseignant ne crée pas de classe'); assert.notEqual(sApi.meta.dept.name, 'HACK');
  assert.equal((sApi.e[b.teacher.id] || { entries: [] }).entries.length, 0, 'rien écrit chez le collègue');
  const mine = (sApi.e[a.teacher.id] || { entries: [] }).entries.find(e => e.id === 'e-mine'); assert.equal(mine.teacherId, a.teacher.id, 'la saisie est rattachée à son auteur, pas à la victime désignée');
  for (const p of ['/team/add', '/team/reset', '/team/remove', '/team/rename', '/team/transfer', '/me/recovery']) assert.equal((await call(p, { name: 'x', teacherId: b.teacher.id }, T)).status === 403 || (await call(p, { name: 'x', teacherId: b.teacher.id }, T)).status === 400, true, p + ' refusé à un enseignant');
});

test('sécurité : jetons falsifiés, expirés ou d’un autre département refusés', async () => {
  fresh(); const ap = await newDept('chef3'), other = await newDept('chef4');
  const [body, sig] = ap.token.split('.');
  const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, 'base64url').toString()), u: 'chef4' })).toString('base64url') + '.' + sig;
  assert.equal((await call('/me', {}, forged)).status, 401, 'signature invalide');
  assert.equal((await call('/me', {}, body + '.')).status, 401); assert.equal((await call('/me', {}, 'a.b.c')).status, 401); assert.equal((await call('/me', {}, '')).status, 401);
  const noneAlg = Buffer.from(JSON.stringify({ u: 'chef3', d: 'x', exp: Date.now() + 1e9 })).toString('base64url') + '.';
  assert.equal((await call('/me', {}, noneAlg)).status, 401);
  assert.equal((await call('/me', {}, other.token)).status, 200, 'son propre jeton passe');
});

test('les années archivées sont gardées par le serveur (nettoyées)', async () => {
  fresh(); const ap = await newDept('annees1'), tid = ap.session.teacherId;
  const years = [{ year: '2026/2027', closed: 1, period: 50, terms: [{ id: 'T1', name: 'T1', start: '2026-09-07', end: '2026-11-27' }], calendar: [], slots: { [tid]: [{ d: 1, c: 'c1', h: 2, st: '07:30', en: '09:10' }] }, assign: [{ id: tid + ':c1', teacherId: tid, classId: 'c1', th: 13, pr: 9, hth: 39, hpr: 27, hours: 66 }], evil: '<script>' }];
  const r = await call('/sync', { have: {}, push: { meta: { ...ap.meta, dept: { ...ap.meta.dept, year: '2027/2028', years, u: Date.now() + 1000 } } } }, ap.token);
  const y = r.meta.dept.years[0];
  assert.equal(r.meta.dept.year, '2027/2028'); assert.equal(y.year, '2026/2027'); assert.equal(y.period, 50); assert.equal(y.slots[tid][0].h, 2); assert.equal(y.assign[0].hours, 66); assert.equal(y.evil, undefined);
});
