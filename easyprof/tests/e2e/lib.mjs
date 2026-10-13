// Utilitaires communs aux tests e2e (Playwright). PW = chemin de playwright-core.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
export const pw = require(process.env.PW || 'playwright-core');
export const BACKUP = process.env.BACKUP; // JSON de sauvegarde réel (non versionné)
export function stateFromBackup(userId = 'KAMDEM', space = 'AP', mutate) {
  const d = JSON.parse(fs.readFileSync(BACKUP, 'utf-8'));
  const st = { discipline: d.discipline, disciplineAbbr: d.disciplineAbbr, establishment: d.establishment, teachers: d.teachers, classes: d.classes,
    entries: d.entries, terms: d.terms, syllabus: d.syllabus || {}, allowedEmails: d.allowedEmails || [], reportObservations: d.reportObservations || {},
    meetingMinutes: d.meetingMinutes || [], logs: [], activeLanguage: 'fr', activeSpace: space, isDarkMode: false };
  st.currentUser = st.teachers.find(t => t.id === userId);
  if (mutate) mutate(st);
  return st;
}
export async function open(browser, html, state, { w = 1300, h = 900, time } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/firebase|net::|Failed to load resource|fonts/i.test(m.text())) errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  await page.route(/^https?:\/\//, r => r.abort());   // aucun réseau
  await page.addInitScript(([s, uid]) => { try { localStorage.setItem('easyprof_state_v1', JSON.stringify(s)); localStorage.setItem('easyprof_profile_chosen', uid); } catch (e) {} }, [state, state.currentUser.id]);
  if (time) await page.clock.setFixedTime(new Date(time));
  await page.goto('file://' + html);
  await page.waitForTimeout(1500);
  return { page, ctx, errs };
}
export async function launch() { return pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); }
