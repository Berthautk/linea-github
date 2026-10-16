// Génère site/js/syllabus.js à partir des dossiers lecons/{LSA,USA} (sous-branches du Sixth Form).
// Usage : node tools/gen-syllabus.mjs   (à relancer seulement si les fichiers de leçons changent)
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL('../../lecons/', import.meta.url).pathname;
const B = [
  ['LSA/Meteorology', 'met', 'Meteorology', 'Météorologie', 'ls'], ['LSA/Climatology', 'clim', 'Climatology', 'Climatologie', 'ls'], ['LSA/Hydrology', 'hydro', 'Hydrology', 'Hydrologie', 'ls'],
  ['LSA/Geomorphology', 'geomo', 'Geomorphology', 'Géomorphologie', 'ls'], ['LSA/Biogeography', 'bio', 'Biogeography', 'Biogéographie (sols, végétation, écosystèmes)', 'ls'],
  ['USA/Population Geography', 'pop', 'Population Geography', 'Géographie de la population', 'us'], ['USA/Settlement Geography', 'set', 'Settlement Geography', 'Géographie de l’habitat', 'us'],
  ['USA/Economic Geography', 'eco', 'Economic Geography', 'Géographie économique', 'us'], ['USA/Environment and Development', 'env', 'Environment and Development', 'Environnement et développement (enjeux contemporains)', 'extra'],
  ['LSA/Geography of Cameroon', 'cam', 'Geography of Cameroon', 'Géographie du Cameroun (further study)', 'fs'], ['USA/Practical Geography', 'prac', 'Practical Geography', 'Géographie pratique : cartes, statistiques, terrain (non compté)', 'fs'],
];
const clean = (s) => s.replace(/_/g, ' ').replace(/K ppen/, 'Köppen').replace(/Th nen/, 'Thünen').replace(/L sch/, 'Lösch').replace(/ s /g, '’s ').replace(/\s+/g, ' ').trim();
const out = [];
for (const [dir, id, en, fr, kind] of B) {
  const files = readdirSync(join(root, dir)).filter(f => f.endsWith('.pptx')).sort();
  const items = { l: [], p: [], f: [] };
  for (const f of files) {
    const m = /_(L|PW|FS|MA|QT|FW)(\d+)([a-z]?)_(.*)\.pptx$/.exec(f); if (!m) throw new Error(f);
    const k = kind === 'fs' ? 'f' : m[1] === 'L' ? 'l' : m[1] === 'PW' ? 'p' : 'f';
    items[k].push([m[1] === 'L' ? +m[2] : +m[2], clean(m[4])]);
  }
  out.push({ id, en, fr, kind, th: items.l.length, pr: items.p.length, fs: items.f.length, items });
}
writeFileSync(new URL('../site/js/syllabus.js', import.meta.url), `// Sous-branches du Sixth Form (syllabus A-Level) : leçons, TP et further study, avec leurs titres. GÉNÉRÉ par tools/gen-syllabus.mjs d'après lecons/.
// kind : ls = Lower Sixth (fiche nationale) · us = Upper Sixth · extra = enjeux contemporains (hors total officiel de 70) · fs = Further study / pratique, jamais compté dans les leçons.
// items.l / .p / .f = [numéro d'origine, titre] pour les leçons / TP / further study.
export const BRANCHES = ${JSON.stringify(out, null, 1)};
`);
console.log(out.map(b => `${b.id}: L${b.th} PW${b.pr} FS${b.fs}`).join('\n'));
