// Outils e2e : démarre le vrai serveur (mêmes fonctions que Netlify, stockage en mémoire) et pilote un navigateur.
import { createRequire } from 'node:module';
import { start } from '../../tools/dev-server.mjs';
const require = createRequire(import.meta.url);
export const pw = require(process.env.PW || 'playwright-core');
export async function boot() {
  const server = await start(0, { memory: true });
  const port = server.address().port;
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  return { server, browser, url: `http://localhost:${port}`, close: async () => { await browser.close(); server.close(); } };
}
export async function newPage(browser, url, { w = 390, h = 844, lang = 'fr-FR', clock } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang, serviceWorkers: 'block' });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text().slice(0, 300)); });
  if (clock) await page.clock.setFixedTime(new Date(clock));
  await page.goto(url); await page.waitForSelector('.auth, .shell', { timeout: 8000 });
  return { page, ctx, errs };
}
export async function signup(page, { name = 'Mr. KAMDEM Emmanuel', username = 'kamdem', password = 'secret1', school = 'GBHS GAROUA', discipline = 'Géographie' } = {}) {
  await page.getByRole('button', { name: /créer mon département/i }).click();
  await page.getByLabel(/nom complet/i).fill(name); await page.locator('input[autocomplete="new-password"]').fill(password);
  await page.getByLabel(/identifiant/i).fill(username);
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel(/établissement/i).fill(school); await page.getByLabel(/discipline/i).fill(discipline);
  await page.getByRole('button', { name: /créer mon département/i }).click();
  await page.waitForSelector('.code', { timeout: 8000 });
  const code = await page.locator('.code').innerText();
  await page.getByRole('button', { name: /j’ai noté mon code/i }).click();
  await page.waitForSelector('.hero');
  return code;
}
