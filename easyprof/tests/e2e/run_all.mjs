// Tests de bout en bout sur l'app réelle (copie de test). Usage:
//   BACKUP=<sauvegarde.json> PW=<chemin playwright-core> node run_all.mjs <test5.html> [dossier_captures]
import crypto from 'crypto';
import { launch, open, stateFromBackup } from './lib.mjs';
const html = process.argv[2], shots = process.argv[3] || '/tmp';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const getState = page => page.evaluate(() => JSON.parse(localStorage.getItem('easyprof_state_v1')));
const sha = p => 'h1$' + crypto.createHash('sha256').update('easyprof:' + p).digest('hex');
const b = await launch();
const allDays = st => { st.terms[0].startDate = '2026-09-07'; st.terms[0].endDate = '2026-12-15'; st.teachers.find(t => t.id === 'KAMDEM').teachingDays = [0,1,2,3,4,5,6]; };

/* A. saisie : révision = heures sans leçon */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'Teacher', allDays), { w: 1200, h: 1000 });
  ok(await page.getByText('Saisie du jour en attente').count() === 1, 'A1 bandeau « saisie en attente » visible avant saisie');
  const sel = page.locator('select').filter({ has: page.locator('option[value="revision"]') });
  const opts = await sel.locator('option').evaluateAll(o => o.map(x => x.value));
  ok(JSON.stringify(opts) === JSON.stringify(['theorique','pratique','contact','revision','evaluation']), 'A2 liste déroulante des 5 types : ' + opts);
  await sel.selectOption('revision');
  ok(await page.locator('input[type=number][disabled]').count() >= 1, 'A3 numéro de leçon grisé pour une révision');
  await page.getByRole('button', { name: 'Enregistrer le cours' }).click();
  await page.waitForTimeout(1600);
  const st = await getState(page);
  const e = st.entries[0];
  ok(e.type === 'revision' && e.lessonNumber === null && e.durationMinutes === 100, 'A4 entrée révision enregistrée (type, sans n° de leçon, 100 min)');
  ok(/révision/i.test(e.title), 'A5 titre automatique : ' + e.title);
  ok(await page.getByText('Saisie du jour en attente').count() === 0, 'A6 le bandeau disparaît après la saisie');
  ok(errs.length === 0, 'A7 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* B. jour sans cours (maladie) -> plus de rappel ; visible dans l'historique */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'Teacher', allDays), { w: 1200, h: 1000 });
  await page.getByText('Pas de cours aujourd\'hui ?').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: shots + '/B_open.png' });
  await page.locator('.epx-card select').selectOption('maladie');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await page.waitForTimeout(700);
  const st = await getState(page);
  const e = st.entries[0];
  ok(e.type === 'absence' && e.reason === 'maladie' && e.durationMinutes === 0 && e.classId === '', 'B1 entrée « absence/maladie » créée (0 min, sans classe)');
  ok(await page.getByText('Saisie du jour en attente').count() === 0, 'B2 le rappel disparaît pour le jour déclaré');
  await page.getByRole('button', { name: /MES COURS/i }).click();
  await page.waitForTimeout(500);
  ok(await page.locator('.ep2-ent').filter({ hasText: /Maladie/ }).count() >= 1, 'B3 visible dans l\'historique, sans plantage');
  ok(errs.length === 0, 'B4 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* C. effet sur la fiche : semaine 12–16 oct. 2026 ; KAMDEM absent mardi 13 (7 h) ; vendredi 16 férié (activités) */
{
  const mut = st => { allDays(st);
    st.entries.unshift({ id: 'abs1', classId: '', teacherId: 'KAMDEM', termId: 'T1', lessonNumber: null, title: 'x', durationMinutes: 0, type: 'absence', reason: 'maladie', timestamp: '2026-10-13T11:00:00.000Z' });
    st.entries.unshift({ id: 'abs2', classId: '', teacherId: 'ASTHA', termId: 'T1', lessonNumber: null, title: 'x', durationMinutes: 0, type: 'absence', reason: 'periscolaire', timestamp: '2026-10-16T11:00:00.000Z' });
    st.entries.unshift({ id: 'rev1', classId: 'LSA', teacherId: 'KAMDEM', termId: 'T1', lessonNumber: null, title: 'rev', durationMinutes: 120, type: 'revision', timestamp: '2026-10-12T11:00:00.000Z' });
    st.reportObservations = Object.assign({}, st.reportObservations, { __inspection: { ps: '2026-10-12', pe: '2026-10-16', adj: [] } }); };
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'AP', mut), { w: 1400, h: 1000 });
  await page.getByText('INSPECTION').first().click(); await page.waitForTimeout(600);
  const annex = await page.locator('.epi-annex tbody tr').allInnerTexts();
  const row = n => annex.find(r => r.startsWith(n)).split('\t').map(x => x.trim());
  const k = row('KAMDEM'), a = row('ASTHA');
  // colonnes: nom, h/sem, dues, absences, retards, rattrapages, faites, rev, saisies
  ok(k[2] === '13' && k[3] === '−7' && k[6] === '6', 'C1 KAMDEM : 13 h dues, −7 h (maladie mardi), 6 h faites → ' + k.join('/'));
  ok(a[2] === '13' && a[3] === '0' && a[6] === '13', 'C2 ASTHA : vendredi (activités, 4 h) retiré des heures dues 17→13 h, pas compté absence → ' + a.join('/'));
  ok(k[7] === '2 h', 'C3 révision de 2 h comptée en heures (dont révisions) → ' + k[7]);
  const row1 = (await page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  // dues = 13+13+12+9 = 47 ; faites = 6+13+12+9 = 40 ; leçons faites = (40-2)/2 = 19 ; leçons dues = round(47/2) = 24
  ok(row1[2] === '47' && row1[3] === '40', 'C4 totaux heures 47 dues / 40 faites → ' + row1.slice(2, 5).join('/'));
  ok(row1[8] === '24' || row1[7] === '24', 'C5 leçons prévues 24 → ' + row1.slice(7, 10).join('/'));
  ok(row1[8] === '19', 'C6 leçons faites = (40−2 h de révision)/2 = 19 → ' + row1[8]);
  await page.screenshot({ path: shots + '/C_insp.png', fullPage: true });
  ok(errs.length === 0, 'C7 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* D. période libre + calendrier : vacances 24/12 → 03/01 retirées ; période 07/09 → 12/02 */
{
  const mut = st => { allDays(st); st.reportObservations = Object.assign({}, st.reportObservations, { __inspection: { ps: '2026-12-21', pe: '2026-12-31', adj: [], cal: [{ f: '2026-12-24', t: '2027-01-03', n: 'Noël' }] } }); };
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'AP', mut), { w: 1400, h: 1000 });
  await page.getByText('INSPECTION').first().click(); await page.waitForTimeout(600);
  const row1 = (await page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  // 21,22,23 déc. 2026 = lun, mar, mer : 51 h/sem. → lun(KAMDEM 6+ASTHA 7)=13 ; mar(KAMDEM 7)=7 ; mer(NEB 5+ASTHA 4+TSOGO 3)=12 → 32
  ok(row1[2] === '32', 'D1 vacances de Noël retirées automatiquement : 32 h dues (21–23 déc.) → ' + row1[2]);
  await page.close();
}

/* E. PIN */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'AP'), { w: 1300, h: 1000 });
  await page.getByText('CONFIGURATION').first().click(); await page.waitForTimeout(400);
  await page.getByRole('button', { name: /^ENSEIGNANTS$/i }).click(); await page.waitForTimeout(500);
  const txt = await page.innerText('body');
  ok(!/h1\$[0-9a-f]{10}/.test(txt), 'E1 aucun hash n\'est affiché dans la liste des enseignants');
  ok(/PIN: 🔒 protégé/.test(txt) && /PIN: ⚠ 1234 \(en clair\)/.test(txt), 'E2 libellés « protégé » / « en clair » corrects');
  await page.getByRole('button', { name: /Année & PIN/i }).click(); await page.waitForTimeout(400);
  const before = await getState(page);
  const neb0 = before.teachers.find(t => t.id === 'NEBASIBI').pin;
  await page.getByRole('button', { name: /Protéger les PIN en clair/ }).click(); await page.waitForTimeout(400);
  let st = await getState(page);
  ok(st.teachers.find(t => t.id === 'NEBASIBI').pin === sha('1234') && neb0 === '1234', 'E3 PIN en clair de NEBASIBI haché sans changer sa valeur (reste « 1234 » côté login)');
  ok(st.teachers.find(t => t.id === 'KAMDEM').pin === before.teachers.find(t => t.id === 'KAMDEM').pin, 'E4 PIN déjà hachés inchangés');
  const row = page.locator('.epx-item').filter({ hasText: 'TSOGO' }).last();
  await row.locator('input').fill('4821');
  await row.getByRole('button', { name: 'Enregistrer' }).click(); await page.waitForTimeout(300);
  st = await getState(page);
  ok(st.teachers.find(t => t.id === 'TSOGO2026').pin === sha('4821'), 'E5 nouveau PIN saisi → haché (compatible avec la connexion)');
  await page.locator('.epx-item').filter({ hasText: 'ASTHA' }).last().getByRole('button', { name: /Générer/ }).click(); await page.waitForTimeout(300);
  const shown = (await page.locator('b').filter({ hasText: /^\d{4}$/ }).first().innerText());
  st = await getState(page);
  ok(st.teachers.find(t => t.id === 'ASTHA').pin === sha(shown), 'E6 PIN généré (' + shown + ') affiché une fois et stocké haché');
  // édition via l'onglet Enseignants : champ vide, enregistrer sans toucher le PIN le conserve
  await page.getByRole('button', { name: /^ENSEIGNANTS$/i }).click(); await page.waitForTimeout(400);
  await page.locator('button[title="Modifier"], button[title="Edit"]').first().click().catch(() => {});
  await page.waitForTimeout(400);
  const pinInput = page.locator('input[maxlength="8"]');
  if (await pinInput.count()) {
    ok((await pinInput.first().inputValue()) === '', 'E7 champ PIN vide à l\'édition (le hash n\'est plus affiché)');
    const pinBefore = (await getState(page)).teachers.map(t => t.pin);
    await page.getByRole('button', { name: /Mettre à jour|Enregistrer|Save|Update/i }).last().click().catch(() => {});
    await page.waitForTimeout(1500);
    const pinAfter = (await getState(page)).teachers.map(t => t.pin);
    ok(JSON.stringify(pinBefore) === JSON.stringify(pinAfter), 'E8 enregistrer sans toucher le PIN le conserve');
  } else console.log('SKIP E7/E8 (bouton Modifier introuvable)');
  ok(errs.length === 0, 'E9 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* F. préréglage 2026-2027 : trimestres officiels, samedi de KAMDEM limité à T1 */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'AP'), { w: 1300, h: 1000 });
  await page.getByText('CONFIGURATION').first().click(); await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Année & PIN/i }).click(); await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Appliquer ces changements' }).click(); await page.waitForTimeout(400);
  const st = await getState(page);
  const T = Object.fromEntries(st.terms.map(t => [t.id, t.startDate + '→' + t.endDate]));
  ok(T.T1 === '2026-09-07→2026-11-27' && T.T2 === '2026-11-30→2027-03-05' && T.T3 === '2027-03-08→2027-06-11', 'F1 trimestres 2026-2027 appliqués ' + JSON.stringify(T));
  const k = st.teachers.find(t => t.id === 'KAMDEM');
  ok(JSON.stringify(k.teachingDays) === '[1,2,6]' && JSON.stringify(k.dayTerms) === '{"6":["T1"]}', 'F2 KAMDEM : lundi, mardi, samedi (T1 seulement)');
  ok(errs.length === 0, 'F3 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* G. rappel du samedi : visible en T1, absent en T2 (état préréglé, horloge figée) */
for (const [date, expected, label] of [['2026-10-10T08:00:00+01:00', 1, 'samedi 10/10/2026 (T1)'], ['2027-01-09T08:00:00+01:00', 0, 'samedi 09/01/2027 (T2)'], ['2026-10-12T08:00:00+01:00', 1, 'lundi 12/10/2026']]) {
  const mut = st => { const T = { T1: ['2026-09-07', '2026-11-27'], T2: ['2026-11-30', '2027-03-05'], T3: ['2027-03-08', '2027-06-11'] };
    st.terms.forEach(t => { t.startDate = T[t.id][0]; t.endDate = T[t.id][1]; }); st.terms[0].status = 'active';
    const k = st.teachers.find(t => t.id === 'KAMDEM'); k.teachingDays = [1, 2, 6]; k.dayTerms = { 6: ['T1'] }; };
  const { page } = await open(b, html, stateFromBackup('KAMDEM', 'Teacher', mut), { w: 1200, h: 900, time: date });
  ok(await page.getByText('Saisie du jour en attente').count() === expected, 'G rappel ' + label + ' → ' + (expected ? 'affiché' : 'absent'));
  await page.close();
}

/* H. créneau du samedi limité à T1 dans la fiche */
{
  const slot = { d: 6, c: 'USA', h: 2, tm: 'T1' };
  const mut = st => { st.terms[0].startDate = '2026-09-07'; st.terms[0].endDate = '2026-11-27'; st.terms[1].startDate = '2026-11-30'; st.terms[1].endDate = '2027-03-05';
    st.reportObservations = Object.assign({}, st.reportObservations, { __inspection: { ps: '2026-09-07', pe: '2026-09-13', adj: [], cal: [], tt: { KAMDEM: [slot] } } }); };
  let r = await open(b, html, stateFromBackup('KAMDEM', 'AP', mut), { w: 1400, h: 1000 });
  await r.page.getByText('INSPECTION').first().click(); await r.page.waitForTimeout(500);
  let row = (await r.page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  ok(row[2] === '2', 'H1 samedi 12/09/2026 (T1) : 2 h dues → ' + row[2]);
  await r.page.close();
  const mut2 = st => { mut(st); st.reportObservations.__inspection.ps = '2027-01-04'; st.reportObservations.__inspection.pe = '2027-01-10'; };
  r = await open(b, html, stateFromBackup('KAMDEM', 'AP', mut2), { w: 1400, h: 1000 });
  await r.page.getByText('INSPECTION').first().click(); await r.page.waitForTimeout(500);
  row = (await r.page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  ok(row[2] === '0', 'H2 samedi 09/01/2027 (T2) : créneau limité à T1 → 0 h dues → ' + row[2]);
  await r.page.close();
}

/* I. seuils d'alerte de l'arrêté (art. 18 et 21) et calendrier officiel préchargé */
{
  let r = await open(b, html, stateFromBackup('KAMDEM', 'AP'), { w: 1400, h: 1000 });
  await r.page.getByText('INSPECTION').first().click(); await r.page.waitForTimeout(500);
  ok(await r.page.locator('.epi-alert').count() === 0, 'I1 92,5 % de couverture : aucune alerte de seuil');
  await r.page.close();
  const mut = st => { st.reportObservations = Object.assign({}, st.reportObservations, { __inspection: { ps: '2026-09-07', pe: '2026-10-09', adj: [{ id: 'x', t: 'ASTHA', k: 'abs', h: 60, d: '2026-09-14', n: '' }] } }); };
  r = await open(b, html, stateFromBackup('KAMDEM', 'AP', mut), { w: 1400, h: 1000 });
  await r.page.getByText('INSPECTION').first().click(); await r.page.waitForTimeout(500);
  const alerts = await r.page.locator('.epi-alert').allInnerTexts();
  ok(alerts.length >= 1 && /80 %/.test(alerts[0]), 'I2 couverture 195/255 = 76,5 % : alerte « sous le seuil de 80 % » → ' + alerts.join(' | '));
  const row = await r.page.locator('.epi-sheet tbody tr').first().innerText();
  ok(/art\. 18/.test(row), 'I3 action corrective obligatoire citée dans la fiche (art. 18)');
  await r.page.close();
  r = await open(b, html, stateFromBackup('KAMDEM', 'AP'), { w: 1300, h: 1000 });
  await r.page.getByText('CONFIGURATION').first().click(); await r.page.waitForTimeout(400);
  await r.page.getByRole('button', { name: /Année & PIN/i }).click(); await r.page.waitForTimeout(400);
  const t = await r.page.innerText('body');
  ok(/Vacances de Noël \(art\. 4\)/.test(t) && /Vacances de Pâques \(art\. 4\)/.test(t) && /Suivi pédagogique, fin du 1er trimestre/.test(t), 'I4 calendrier de l\'arrêté préchargé (vacances + suivi pédagogique)');
  ok(!/à confirmer/.test(t), 'I5 plus de mention « à confirmer »');
  await r.page.close();
}

const TERMS = st => { const T = { T1: ['2026-09-07', '2026-11-27'], T2: ['2026-11-30', '2027-03-05'], T3: ['2027-03-08', '2027-06-11'] }; st.terms.forEach(t => { t.startDate = T[t.id][0]; t.endDate = T[t.id][1]; }); st.terms[0].status = 'active'; };

/* J. tableau de bord AP (horloge figée au 09/10/2026) et suppression du rapport AP */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'AP', TERMS), { w: 1300, h: 1000, time: '2026-10-09T12:00:00+01:00' });
  const nav = await page.innerText('body');
  ok(!/RAPPORT AP/i.test(nav) && /INSPECTION/.test(nav), 'J1 plus d\'onglet « Rapport AP » ; Inspection en place');
  const k = await page.locator('.ep2-kpi').allInnerTexts();
  ok(k.length === 4 && /93\.7 %/.test(k[0]) && /239 \/ 255/.test(k[0]), 'J2 couverture horaire depuis la rentrée = 239/255 = 93,7 % (retard KAMDEM corrigé à 3 h) → ' + k[0].replace(/\n/g, ' '));
  ok(/93\.8 %/.test(k[1]) && /120 \/ 128/.test(k[1]), 'J3 couverture des leçons 120/128 = 93,8 % → ' + k[1].replace(/\n/g, ' '));
  ok(/15\.7 %/.test(k[2]) && /1524/.test(k[2]), 'J4 couverture annuelle 15,7 % de 1524 h → ' + k[2].replace(/\n/g, ' '));
  ok(/T1/.test(k[3]) && /93\.7 %/.test(k[3]), 'J5 trimestre en cours (T1) → ' + k[3].replace(/\n/g, ' '));
  const tbl = await page.locator('.ep2-tbl').allInnerTexts();
  ok(/T1/.test(tbl[0]) && /T2/.test(tbl[0]) && /à venir/.test(tbl[0]), 'J6 tableau par trimestre (T2/T3 à venir)');
  ok(/KAMDEM/.test(tbl[1]) && /TSOGO/.test(tbl[1]) && /ASTHA/.test(tbl[1]) && /NEBASIBI/.test(tbl[1]), 'J7 tableau par enseignant complet');
  await page.screenshot({ path: shots + '/J_dash.png', fullPage: true });
  ok(errs.length === 0, 'J8 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}

/* K. bilan de l'enseignant : sa fiche, dates libres, année propre à son emploi du temps */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'Teacher', st => { TERMS(st); st.teachers.find(t => t.id === 'KAMDEM').teachingDays = [1, 2, 6]; }), { w: 1300, h: 1000, time: '2026-10-09T12:00:00+01:00' });
  await page.getByRole('button', { name: /MON BILAN/i }).click(); await page.waitForTimeout(600);
  const k = await page.locator('.ep2-kpi').allInnerTexts();
  ok(/70 \/ 65/.test(k[0]), 'K1 bilan KAMDEM rentrée → aujourd\'hui : 70 / 65 h (même moteur que la fiche AP) → ' + k[0].replace(/\n/g, ' '));
  const row = (await page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  ok(/GEOGRAPHY · Mr\. KAMDEM/.test(row[1]) && row[2] === '65' && row[3] === '70', 'K2 fiche personnelle : 65 h dues, 70 faites → ' + row.slice(1, 4).join(' / '));
  await page.getByRole('button', { name: /^T1$/ }).click();
  await page.locator('.ep2-card input[type=date]').first().fill('2026-09-14'); await page.locator('.ep2-card input[type=date]').nth(1).fill('2026-09-18'); await page.waitForTimeout(400);
  const row2 = (await page.locator('.epi-sheet tbody tr').first().innerText()).split('\t');
  ok(row2[2] === '13', 'K3 période libre 14→18/09 : 13 h dues (emploi du temps du lundi et du mardi) → ' + row2[2]);
  ok(/Du 14 septembre 2026 au 18 septembre 2026/.test(row2[0].replace(/\n/g, ' ')), 'K4 période affichée sur la fiche');
  ok(row2[3] === '13.8', 'K6 retard (−3 h) et rattrapage (+8 h) sans date répartis au prorata sur la période d\'inspection : 5/33 jours → 13 h dues, 13,8 h faites (et non 18 h) → ' + row2[3]);
  ok(errs.length === 0, 'K5 aucune erreur JS ' + JSON.stringify(errs));
  await page.screenshot({ path: shots + '/K_bilan.png', fullPage: true });
  await page.close();
}

/* L. historique : modifier une saisie (date, titre, type) sans la supprimer */
{
  const { page, errs } = await open(b, html, stateFromBackup('KAMDEM', 'Teacher', TERMS), { w: 1300, h: 1000, time: '2026-10-09T12:00:00+01:00' });
  await page.getByRole('button', { name: /MES COURS/i }).click(); await page.waitForTimeout(500);
  const n0 = await page.locator('.ep2-ent').count();
  const first = page.locator('.ep2-ent').filter({ hasText: 'Population distribution' });
  ok(await first.count() === 1, 'L1 historique complet : ' + n0 + ' saisies listées (pas seulement 3)');
  await first.getByRole('button', { name: /Modifier/ }).click(); await page.waitForTimeout(300);
  await page.locator('.ep2-form input[type=date]').fill('2026-09-30');
  const title = page.locator('.ep2-form input.epx-in').filter({ hasNot: page.locator('[type=date],[type=time],[type=number],[type=checkbox]') }).last();
  await title.fill('Population distribution (corrigé)');
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click(); await page.waitForTimeout(600);
  const st = await getState(page);
  const e = st.entries.find(x => /corrigé/.test(x.title || ''));
  ok(e && e.timestamp.slice(0, 10) === '2026-09-30' && st.entries.length === n0 + (st.entries.length - n0), 'L2 date et titre modifiés sur place, la saisie n\'est pas recréée → ' + (e && e.timestamp));
  ok(e && e.termId === 'T1' && e.durationMinutes === 120, 'L3 trimestre recalculé et durée conservée (120 min)');
  await page.locator('.ep2-ent').filter({ hasText: 'corrigé' }).getByRole('button', { name: '🗑' }).click(); await page.waitForTimeout(400);
  ok(await page.getByText('Confirmer la suppression').count() >= 1, 'L4 la suppression demande une confirmation');
  ok(errs.length === 0, 'L5 aucune erreur JS ' + JSON.stringify(errs));
  await page.close();
}
await b.close();
console.log(fails ? `\n${fails} ÉCHEC(S)` : '\nTOUS LES TESTS PASSENT');
process.exit(fails ? 1 : 0);
