// Liste les textes français passés à t('…') dans le code (pour tenir le dictionnaire anglais à jour).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site/js');
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (f !== 'vendor') walk(p); } else if (p.endsWith('.js') && !p.endsWith('lang-en.js')) files.push(p); } })(root);
const found = new Set();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) { try { found.add(m[1] === '`' ? m[2] : JSON.parse('"' + m[2].replace(/"/g, '\\"').replace(/\\'/g, "'") + '"')); } catch { found.add(m[2]); } }
}
const known = fs.readFileSync(path.join(root, 'lang-en.js'), 'utf8');
const missing = [...found].filter(s => !known.includes(JSON.stringify(s)));
if (process.argv.includes('--all')) console.log(JSON.stringify([...found], null, 1)); else { console.log(found.size, 'textes, manquants en anglais :', missing.length); if (process.argv.includes('--list')) console.log(JSON.stringify(missing, null, 1)); }
