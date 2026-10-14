// Tests de bout en bout : vrai serveur, vrais navigateurs, deux utilisateurs qui se synchronisent.
// Usage : PW=<chemin de playwright-core> node tests/e2e/run.mjs [dossier_captures]
import fs from 'node:fs';
import { boot, newPage, signup } from './lib.mjs';
const shots = process.argv[2] || '/tmp'; let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const step = async (name, fn) => { try { await fn(); } catch (e) { fails++; console.log('FAIL ' + name + ' → exception : ' + String(e.message).split('\n')[0] + ' @' + (String(e.stack).match(/run.mjs:(\d+)/)||[])[1]); } };
const MON = '2026-10-12T09:00:00+01:00';
const tx = (page, sel) => page.locator(sel).first().innerText();
const go = async (page, url, hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(450); };
const nav = (page, id) => page.locator(`nav a[href="#/${id}"]`).first().click();

const env = await boot();
const { browser, url } = env;
let teacher = null, apPage, apErrs;

await step('A. Inscription et configuration par l’animateur', async () => {
  const p = await newPage(browser, url, { clock: MON }); apPage = p.page; apErrs = p.errs;
  const code = await signup(apPage);
  ok(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code), 'A1 code de récupération au bon format : ' + code);
  ok(/Bonjour, Emmanuel/.test(await tx(apPage, '.hero')) && /Pour bien démarrer/.test(await apPage.innerText('body')), 'A2 accueil : salut par le prénom + liste « Pour bien démarrer »');
  await go(apPage, url, '#/settings/classes');
  for (const [name, cycle] of [['Form 3 A', '1er'], ['Lower Sixth Arts', '2nd']]) {
    await apPage.getByRole('button', { name: /nouvelle classe/i }).click();
    await apPage.getByLabel(/nom de la classe/i).fill(name); await apPage.getByLabel(/^effectif/i).fill('50');
    if (cycle === '2nd') await apPage.getByRole('button', { name: '2nd cycle' }).click();
    await apPage.getByRole('button', { name: 'Enregistrer' }).click(); await apPage.waitForTimeout(300);
  }
  ok((await apPage.innerText('body')).includes('Form 3 A') && (await apPage.innerText('body')).includes('Lower Sixth Arts'), 'A3 deux classes créées');
  await go(apPage, url, '#/settings/team');
  await apPage.getByRole('button', { name: /ajouter un collègue/i }).click();
  await apPage.getByLabel(/nom complet/i).fill('Mme ASTHA Noura'); await apPage.getByRole('button', { name: /créer le compte/i }).click();
  await apPage.waitForSelector('.sheet .code');
  const password = await tx(apPage, '.sheet .code'), username = await apPage.locator('.sheet .card.flat .row').nth(1).locator('b').innerText();
  ok(password.length === 6 && username === 'astha', 'A4 compte du collègue créé : ' + username + ' / ' + password);
  teacher = { username, password };
  await apPage.getByRole('button', { name: /fermer/i }).click();
  await apPage.locator('a.item', { hasText: 'ASTHA' }).click(); await apPage.waitForTimeout(400);
  await apPage.getByRole('button', { name: /ajouter un cours/i }).click();
  await apPage.locator('.card.flat select').nth(1).selectOption({ label: 'Form 3 A' });
  await apPage.locator('select:has(option[value=""])').filter({ hasText: 'Ajouter une classe' }).last().selectOption({ label: 'Form 3 A' }); await apPage.getByRole('button', { name: /^Ajouter$/ }).click(); await apPage.waitForTimeout(300);
  await apPage.locator('table.tbl input[type=number]').first().fill('10'); await apPage.locator('table.tbl input[type=number]').first().blur(); await apPage.waitForTimeout(250);
  await go(apPage, url, '#/settings/team'); await apPage.locator('a.item', { hasText: 'KAMDEM' }).click(); await apPage.waitForTimeout(400);
  await apPage.getByRole('button', { name: /ajouter un cours/i }).click();
  await apPage.locator('.card.flat select').nth(1).selectOption({ label: 'Lower Sixth Arts' });
  await apPage.locator('select:has(option[value=""])').filter({ hasText: 'Ajouter une classe' }).last().selectOption({ label: 'Lower Sixth Arts' }); await apPage.getByRole('button', { name: /^Ajouter$/ }).click(); await apPage.waitForTimeout(300);
  await apPage.locator('table.tbl input[type=number]').first().fill('20'); await apPage.locator('table.tbl input[type=number]').first().blur(); await apPage.waitForTimeout(250);
  const st = await apPage.evaluate(() => { const k = Object.keys(localStorage).find(x => x.startsWith('ep6:data:')); return JSON.parse(localStorage.getItem(k)).data; });
  ok(st.teachers.every(t => t.slots.length === 1) && st.assign.filter(a => !a.deleted).length === 2 && st.assign.some(a => a.th === 10) && st.assign.some(a => a.th === 20), 'A5 emplois du temps et leçons prévues enregistrés par l’interface');
  await apPage.waitForTimeout(3200);
});

let tp, tpErrs;
await step('B. Le collègue se connecte et saisit', async () => {
  const p = await newPage(browser, url, { clock: MON }); tp = p.page; tpErrs = p.errs;
  await tp.getByLabel(/^identifiant/i).fill(teacher.username); await tp.locator('input[type=password]').fill(teacher.password);
  await tp.getByRole('button', { name: 'Se connecter' }).first().click(); await tp.waitForSelector('.hero');
  await tp.waitForSelector('text=Aujourd’hui'); await tp.waitForTimeout(600);
  const body = await tp.innerText('body');
  ok(/Bonjour, Noura/.test(body) && /Form 3 A/.test(body), 'B1 connexion : le collègue retrouve son prénom et sa classe du jour (reçus par synchronisation)');
  ok(!/Mon équipe/.test(body) && !(await tp.locator('text=Département').count()), 'B2 le collègue ne voit pas la vue « département »');
  await tp.getByRole('button', { name: 'Fait' }).click(); await tp.waitForTimeout(500);
  ok(/leçon 1 enregistrée/.test(await tx(tp, '.toast')), 'B3 saisie en un geste : « Fait » → leçon 1 enregistrée');
  const k = await tp.locator('.kpis').innerText();
  ok(/2 \/ 12 h/.test(k.replace(/\n/g, ' ')), 'B4 heures : 2 h faites sur 12 h dues depuis la rentrée (6 lundis × 2 h)');
  await go(tp, url, '#/settings/team'); ok(!(await tp.locator('text=Ajouter un collègue').count()), 'B5 l’équipe est interdite au collègue (retour au menu)');
  await go(tp, url, '#/lessons');
  await tp.locator('.item').first().getByRole('button', { name: 'Modifier' }).click();
  await tp.getByLabel(/titre ou chapitre/i).fill('Les climats'); await tp.getByRole('button', { name: /enregistrer les modifications/i }).click(); await tp.waitForTimeout(400);
  ok((await tx(tp, '.item')).includes('Les climats'), 'B6 modification d’une saisie sur place');
  await tp.locator('.item').first().getByRole('button', { name: 'Supprimer' }).click(); await tp.getByRole('button', { name: 'Supprimer', exact: true }).last().click(); await tp.waitForTimeout(300);
  ok(/Aucune séance/.test(await tp.innerText('body')), 'B7 suppression avec confirmation');
  await tp.getByRole('button', { name: 'Annuler' }).click(); await tp.waitForTimeout(300);
  ok((await tp.innerText('body')).includes('Les climats'), 'B8 suppression annulée par « Annuler »');
});

await step('C. Synchronisation vers l’animateur', async () => {
  await apPage.locator('.sync').first().click(); await apPage.waitForTimeout(1200);
  await go(apPage, url, '#/home');
  const team = await apPage.locator('.tbl').first().innerText();
  ok(/ASTHA/.test(team), 'C1 l’animateur voit son collègue dans l’équipe');
  await tp.locator('.sync').first().click(); await tp.waitForTimeout(800);
  await apPage.locator('.sync').first().click(); await apPage.waitForTimeout(1200);
  const row = (await apPage.locator('.tbl').first().innerText()).split('\n').filter(l => /ASTHA/.test(l)).join(' ');
  ok(/2/.test(row), 'C2 les 2 h saisies par le collègue sont arrivées chez l’animateur : ' + row.replace(/\s+/g, ' '));
});

await step('D. Hors ligne puis synchronisation', async () => {
  await tp.context().setOffline(true);
  await go(tp, url, '#/log'); await tp.getByRole('button', { name: /enregistrer la séance/i }).click(); await tp.waitForTimeout(500);
  ok(/leçon 2 enregistrée/.test(await tx(tp, '.toast')), 'D1 saisie possible sans Internet (leçon 2)');
  await tp.locator('.sync').first().click(); await tp.waitForTimeout(900);
  ok(/Hors ligne/.test(await tp.locator('.sync').first().getAttribute('title') + (await tp.locator('.sync .t').first().innerText())), 'D2 l’état « Hors ligne » est signalé');
  await tp.context().setOffline(false); await tp.locator('.sync').first().click(); await tp.waitForTimeout(1500);
  await apPage.locator('.sync').first().click(); await apPage.waitForTimeout(1200);
  const lessons = await apPage.evaluate(() => { const k = Object.keys(localStorage).find(x => x.startsWith('ep6:data:')); return JSON.parse(localStorage.getItem(k)).data.entries.filter(e => !e.deleted && e.type === 'lesson').length; });
  ok(lessons === 2, 'D3 la saisie faite hors ligne est arrivée chez l’animateur après reconnexion (2 leçons)');
});

await step('E. Jour sans cours et fiche d’inspection', async () => {
  await go(tp, url, '#/home'); await tp.getByRole('button', { name: 'Pas de cours' }).first().click();
  await tp.locator('.sheet input[type=date]').first().fill('2026-10-13'); await tp.locator('.sheet input[type=date]').nth(1).fill('2026-10-13');
  await tp.getByRole('button', { name: 'Enregistrer', exact: true }).click(); await tp.waitForTimeout(500);
  await go(tp, url, '#/lessons'); ok((await tp.innerText('body')).includes('Maladie'), 'E1 jour sans cours (maladie) enregistré et visible dans l’historique');
  await go(apPage, url, '#/report'); await apPage.waitForTimeout(600);
  const paper = await apPage.locator('.paper').first().innerText();
  ok(/FICHE DE L’INSPECTION NATIONALE/i.test(paper) && /GEOGRAPHY|GÉOGRAPHIE|Géographie/i.test(paper) && /GBHS GAROUA/.test(paper), 'E2 fiche officielle : en-tête, établissement, discipline');
  ok((await apPage.locator('.paper table').first().locator('tbody tr').first().locator('td').count()) === 14, 'E3 fiche : 14 colonnes comme la fiche de l’inspection');
  await apPage.getByRole('button', { name: /censorat/i }).click(); await apPage.waitForTimeout(300);
  const fp = await apPage.innerText('body'); ok(/FICHE PÉDAGOGIQUE DE SUIVI/i.test(fp) && /TOTAL GÉNÉRAL/.test(fp) && (await apPage.locator('.paper img').count()) === 1, 'E4 fiche pédagogique de suivi (censorat) : armoiries et total général');
  await apPage.screenshot({ path: shots + '/e_recap.png', fullPage: true });
  // l'animateur contrôle la semaine d'un collègue : retirer, puis cocher « Présent » à sa place
  await go(apPage, url, '#/week'); await apPage.waitForSelector('.wk');
  await apPage.locator('select').first().selectOption({ label: 'Mme ASTHA Noura' }); await apPage.waitForTimeout(300);
  const wk = await apPage.innerText('.page');
  ok(/Contrôle de la semaine/.test(wk) && /Form 3 A/.test(wk), 'E5 contrôle de la semaine : le cours du collègue est affiché');
  const hrs = async () => (await apPage.locator('.chip.info').innerText());
  const h0 = await hrs();
  if (await apPage.getByRole('button', { name: 'Retirer' }).count()) { await apPage.getByRole('button', { name: 'Retirer' }).first().click(); await apPage.waitForTimeout(300); }
  await apPage.getByRole('button', { name: 'Présent' }).first().click(); await apPage.waitForTimeout(400);
  ok(/2 h faites sur/.test(await hrs()), 'E6 « Présent » enregistre le cours au nom du collègue (' + h0 + ' → ' + (await hrs()) + ')');
  await apPage.getByRole('button', { name: 'Retirer' }).first().click(); await apPage.waitForTimeout(300);
  await apPage.getByRole('button', { name: 'En retard' }).first().click(); await apPage.getByRole('button', { name: '30 min' }).click(); await apPage.waitForTimeout(400);
  ok(/1,5 h faites sur/.test(await hrs()), 'E7 « En retard » de 30 min : 1,5 h comptées');
  // en-tête libre et mode d'emploi
  await go(apPage, url, '#/settings/dept'); await apPage.locator('textarea').first().fill('REPUBLIQUE DU CAMEROUN\nPaix-Travail-Patrie\n**********\nTEXTE DE TEST'); await apPage.locator('textarea').first().blur(); await apPage.waitForTimeout(300);
  await go(apPage, url, '#/report'); ok(/TEXTE DE TEST/.test(await apPage.locator('.paper').first().innerText()), 'E8 le texte d’en-tête écrit par l’animateur est imprimé sur la fiche');
  await go(apPage, url, '#/settings/guide'); ok(/Une fois, au départ/.test(await apPage.innerText('.page')), 'E9 le mode d’emploi est accessible');
});

await step('F. Mot de passe oublié (animateur)', async () => {
  const p = await newPage(browser, url, {}); const code = await signup(p.page, { name: 'Mr. AUTRE Prof', username: 'autre.prof', school: 'LYCÉE DE TEST', discipline: 'Histoire' });
  await p.page.evaluate(() => { location.hash = '#/settings/profile'; }); await p.page.waitForTimeout(300);
  await p.page.getByRole('button', { name: /^Se déconnecter$/ }).click(); await p.page.waitForSelector('.auth');
  await p.page.getByRole('button', { name: /mot de passe oublié/i }).click();
  await p.page.getByLabel(/^identifiant/i).fill('autre.prof'); await p.page.getByLabel(/code de récupération/i).fill(code.toLowerCase()); await p.page.getByLabel(/nouveau mot de passe/i).fill('nouveau99');
  await p.page.getByRole('button', { name: /changer le mot de passe/i }).click(); await p.page.waitForSelector('text=Mot de passe modifié');
  await p.page.getByRole('button', { name: 'Se connecter' }).click();
  await p.page.getByLabel(/^identifiant/i).fill('autre.prof'); await p.page.locator('input[type=password]').fill('nouveau99'); await p.page.getByRole('button', { name: 'Se connecter' }).first().click();
  await p.page.waitForSelector('.shell'); await p.page.evaluate(() => { location.hash = '#/home'; }); await p.page.waitForSelector('.hero');
  const body = await p.page.innerText('body');
  ok(/LYCÉE DE TEST/.test(body) && !/GBHS/.test(body), 'F1 récupération du mot de passe par code ; ce département est isolé du premier (aucune donnée de GBHS)');
});

await step('G. Application installable hors ligne (service worker)', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await page.goto(url); await page.waitForSelector('.auth'); await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(1200);
  await ctx.setOffline(true); await page.reload(); await page.waitForSelector('.auth', { timeout: 8000 });
  ok(true, 'G1 l’application se rouvre sans Internet (service worker + cache)');
  const man = await page.evaluate(() => fetch('/manifest.webmanifest').then(r => r.json()).catch(() => null)); ok(man && man.display === 'standalone' && man.icons.length === 3, 'G2 manifeste d’installation complet');
  await ctx.setOffline(false);
});

await step('H. Anglais', async () => {
  const p = await newPage(browser, url, {}); await p.page.getByRole('button', { name: 'English' }).click(); await p.page.waitForTimeout(200);
  ok(/Sign in/.test(await p.page.innerText('body')), 'H1 l’interface passe en anglais');
});

ok(apErrs.length === 0 && tpErrs.length === 0, 'Z aucune erreur JavaScript pendant tout le parcours ' + JSON.stringify([...apErrs, ...tpErrs]));
await env.close();
console.log(fails ? `\n${fails} ÉCHEC(S)` : '\nTOUS LES TESTS E2E PASSENT');
process.exit(fails ? 1 : 0);
