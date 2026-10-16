// Programme de l'année : leçons et heures prévues (théorie / TP) par classe et par enseignant.
import { html } from '../vendor/preact-htm.js';
import { t } from '../i18n.js';
import { DraftInput, Field } from '../ui.js';
import { saveAssign } from '../actions.js';

/** Programme officiel par niveau (anglophone), repris de l'ancienne sauvegarde du GBHS : à vérifier avant de s'en servir. */
export const OFFICIAL = {
  'form 1': { th: 13, pr: 9, hth: 39, hpr: 27 }, 'form 2': { th: 8, pr: 11, hth: 28, hpr: 38 }, 'form 3': { th: 42, pr: 4, hth: 60, hpr: 6 },
  'form 4': { th: 46, pr: 12, hth: 79, hpr: 21 }, 'form 5': { th: 53, pr: 10, hth: 82, hpr: 15 },
  'lower sixth': { th: 77, pr: 14, hth: 270, hpr: 49 }, 'upper sixth': { th: 70, pr: 20, hth: 271, hpr: 78 },
};
/** Niveau d'une classe d'après son nom (« Form 3 G », « Geo 2B », « Lower Sixth Arts »…). */
export function levelOf(cls) {
  const n = String((cls && (cls.level || cls.name)) || '').toLowerCase();
  if (/lower\s*sixth|\bl6|lsa/.test(n)) return 'lower sixth'; if (/upper\s*sixth|\bu6|usa/.test(n)) return 'upper sixth';
  const m = /form\s*([1-5])/.exec(n) || /\b(?:geo\s*)?([1-5])\s*[a-z]?\b/.exec(n); return m ? 'form ' + m[1] : '';
}
export const officialFor = (cls) => OFFICIAL[levelOf(cls) || (cls && levelOf({ name: cls.name })) || ''] || null;
export const isEmptyProgram = (a) => !a || !((+a.th || 0) + (+a.pr || 0) + (+a.hth || 0) + (+a.hpr || 0) + (+a.hours || 0));
export const totalHours = (a) => (+a.hth || 0) + (+a.hpr || 0) || +a.hours || 0;

/** Les quatre champs du programme d'une affectation : chacun s'enregistre en quittant le champ. */
export function ProgramFields({ a, teacherId, classId, onSaved }) {
  const cur = a || { th: 0, pr: 0, hth: 0, hpr: 0, hours: 0 };
  const upd = (k, v) => { saveAssign({ teacherId, classId, th: cur.th, pr: cur.pr, hth: cur.hth, hpr: cur.hpr, hours: cur.hours, n0: cur.n0, [k]: +v || 0, ...(k === 'hth' || k === 'hpr' ? { hours: 0 } : {}) }); onSaved && onSaved(); };
  const f = (k, label) => html`<${Field} label=${label}><${DraftInput} class="input" type="number" min="0" inputmode="numeric" value=${cur[k] || ''} onChange=${(e) => upd(k, e.target.value)} /><//>`;
  return html`<div class="g2x2">${f('th', t('Leçons de théorie'))}${f('pr', t('Leçons de TP'))}${f('hth', t('Heures de théorie'))}${f('hpr', t('Heures de TP'))}</div>
    <p class="hint">${t('{l} leçons · {p} TP · {h} h (les further study ne comptent pas dans les leçons)', { l: +cur.th || 0, p: +cur.pr || 0, h: totalHours(cur) })}</p>
    <details><summary class="sub">${t('Le programme reprend en cours de route ? (numéro de la première leçon)')}</summary><div style="margin-top:6px">${f('n0', t('Première leçon de l’année (n°)'))}</div></details>`;
}
