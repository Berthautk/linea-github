// Programme de l'année : leçons et heures prévues (théorie / TP) par classe et par enseignant.
import { html } from '../vendor/preact-htm.js';
import { t } from '../i18n.js';
import { DraftInput, Field } from '../ui.js';
import { saveAssign } from '../actions.js';
import { BRANCHES } from '../syllabus.js';

/** Programme officiel par niveau (syllabus national 2023, Forms 1-5) : leçons numérotées du syllabus, travaux pratiques (Practical Work) et further study / travail guidé (Guided Work), comptés SÉPARÉMENT. Les heures viennent de votre ancienne sauvegarde : à vérifier.
 *  Lower/Upper Sixth : le syllabus 2019 regroupe les deux années ; leçons d'après votre ancienne sauvegarde, sans les activités de projet (Project Based Learning), qui ne sont pas comptées. */
export const OFFICIAL = {
  'form 1': { th: 13, pr: 6, fs: 3, hth: 39, hpr: 27 }, 'form 2': { th: 8, pr: 4, fs: 7, hth: 28, hpr: 38 }, 'form 3': { th: 42, pr: 2, fs: 2, hth: 60, hpr: 6 },
  'form 4': { th: 46, pr: 10, fs: 2, hth: 79, hpr: 21 }, 'form 5': { th: 53, pr: 5, fs: 6, hth: 82, hpr: 15 },
  'lower sixth': { th: 78, pr: 4, fs: 5, hth: 270, hpr: 49 }, 'upper sixth': { th: 70, pr: 11, fs: 0, hth: 271, hpr: 78 },   // d'après les sous-branches (la fiche nationale annonce 77 leçons en Lower Sixth : le dossier de leçons en compte 78)
};
/** Niveau d'une classe d'après son nom (« Form 3 G », « Geo 2B », « Lower Sixth Arts »…). */
export function levelOf(cls) {
  const n = String((cls && (cls.level || cls.name)) || '').toLowerCase();
  if (/lower\s*sixth|\bl6|lsa/.test(n)) return 'lower sixth'; if (/upper\s*sixth|\bu6|usa/.test(n)) return 'upper sixth';
  const m = /form\s*([1-5])/.exec(n) || /\b(?:geo\s*)?([1-5])\s*[a-z]?\b/.exec(n); return m ? 'form ' + m[1] : '';
}
export const officialFor = (cls) => OFFICIAL[levelOf(cls) || (cls && levelOf({ name: cls.name })) || ''] || null;
/* ---------- Sixth Form : enseignement par sous-branches ---------- */
export const isSixth = (level) => level === 'lower sixth' || level === 'upper sixth';
export const branchOf = (id) => BRANCHES.find(b => b.id === id);
/** Sous-branches choisies pour une affectation, dans l'ordre où l'enseignant les fait. */
export const sbsOf = (a) => String((a && a.sbs) || '').split(',').filter(branchOf);
/** Totaux d'un choix de sous-branches (leçons numérotées / TP / further study) ; n0 = première leçon si on reprend en cours de route. */
export function sumBranches(ids, n0 = 0) {
  const r = ids.reduce((s, id) => { const b = branchOf(id); return { th: s.th + b.th, pr: s.pr + b.pr, fs: s.fs + b.fs }; }, { th: 0, pr: 0, fs: 0 });
  return { ...r, th: Math.max(0, r.th - Math.max(0, (+n0 || 0) - 1)) };
}
/** Que représente le n° N d'une affectation ? Les numéros se suivent d'une sous-branche à l'autre dans l'ordre choisi : { branche, n° d'origine, titre }. */
export function lessonInfo(a, type, n) {
  const ids = sbsOf(a), key = type === 'lesson' ? 'l' : type === 'practical' ? 'p' : type === 'further' ? 'f' : ''; if (!key || !ids.length || !(+n >= 1)) return null;
  let i = Math.round(+n) - 1; for (const id of ids) { const b = branchOf(id), list = b.items[key]; if (i < list.length) return { branch: b, num: list[i][0], title: list[i][1] }; i -= list.length; }
  return null;
}
export const infoText = (inf) => inf ? inf.branch.en + ' · ' + inf.title : '';
/** Ce que représente le n° d'une leçon pour cet enseignant dans cette classe (Sixth : sous-branche + titre), en texte. */
export const infoOf = (ctx, tid, c, type, n) => infoText(lessonInfo(ctx.assign.find(x => x.teacherId === tid && x.classId === c), type, n));
export const isEmptyProgram = (a) => !a || !((+a.th || 0) + (+a.pr || 0) + (+a.fs || 0) + (+a.hth || 0) + (+a.hpr || 0) + (+a.hours || 0));
export const totalHours = (a) => (+a.hth || 0) + (+a.hpr || 0) || +a.hours || 0;

/** Les quatre champs du programme d'une affectation : chacun s'enregistre en quittant le champ. */
export function ProgramFields({ a, teacherId, classId, level, onSaved }) {
  const cur = a || { th: 0, pr: 0, hth: 0, hpr: 0, hours: 0 };
  const upd = (k, v) => { saveAssign({ teacherId, classId, th: cur.th, pr: cur.pr, fs: cur.fs, hth: cur.hth, hpr: cur.hpr, hours: cur.hours, n0: cur.n0, sbs: cur.sbs, [k]: +v || 0, ...(k === 'hth' || k === 'hpr' ? { hours: 0 } : {}) }); onSaved && onSaved(); };
  const ids = sbsOf(cur), six = isSixth(level), prev = OFFICIAL['form ' + ((+/\d/.exec(level || '') || 0) - 1)];
  const pickBranches = (next, n0 = cur.n0) => { const tot = sumBranches(next, n0); saveAssign({ teacherId, classId, ...cur, ...tot, n0, sbs: next.join(',') }); onSaved && onSaved(); };
  const toggle = (id) => pickBranches(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const move = (id, d) => { const i = ids.indexOf(id), j = i + d; if (j < 0 || j >= ids.length) return; const nx = ids.slice(); nx[i] = ids[j]; nx[j] = id; pickBranches(nx); };
  const reprise = (n) => { n = Math.max(0, Math.round(+n) || 0); saveAssign({ teacherId, classId, ...cur, n0: n, th: n > 1 ? Math.max(0, prev.th - (n - 1)) : cur.th, pr: n > 1 ? prev.pr : cur.pr, fs: n > 1 ? prev.fs : cur.fs, sbs: cur.sbs }); onSaved && onSaved(); };
  const f = (k, label) => html`<${Field} label=${label}><${DraftInput} class="input" type="number" min="0" inputmode="numeric" value=${cur[k] || ''} onChange=${(e) => upd(k, e.target.value)} /><//>`;
  const branches = six ? html`<div class="stack" style="gap:6px"><b>${t('Sous-branches enseignées dans cette classe')}</b>
      <p class="hint">${t('Cochez, dans l’ordre où l’enseignant les fait, uniquement ce qui lui reste à enseigner à cette classe (une sous-branche déjà terminée se compte dans « Heures hors application »). Les leçons, TP et further study se calculent tout seuls.')}</p>
      ${BRANCHES.map(b => html`<label class="row" style="flex-wrap:nowrap;gap:8px;align-items:flex-start"><input type="checkbox" checked=${ids.includes(b.id)} onChange=${() => toggle(b.id)} style="margin-top:4px" />
        <span class="grow"><b>${b.en}</b>${ids.includes(b.id) ? html` <span class="hint">#${ids.indexOf(b.id) + 1}</span>` : null}<br /><span class="hint">${b.th ? b.th + ' ' + t('leçons') : ''}${b.pr ? ' · ' + b.pr + ' TP' : ''}${b.fs ? ' · ' + b.fs + ' further study' : ''}${b.kind === 'extra' ? ' · ' + t('hors total officiel') : ''}${b.kind === 'fs' ? ' · ' + t('non compté dans le programme') : ''}</span></span>
        ${ids.includes(b.id) && ids.length > 1 ? html`<span class="row" style="gap:2px;flex-wrap:nowrap"><button type="button" class="icon-btn" onClick=${(e) => { e.preventDefault(); move(b.id, -1); }} aria-label=${t('Monter')}>▲</button><button type="button" class="icon-btn" onClick=${(e) => { e.preventDefault(); move(b.id, 1); }} aria-label=${t('Descendre')}>▼</button></span>` : null}</label>`)}
      ${ids.length ? html`<p class="hint">${t('Ordre d’enseignement : {l}. La leçon n° 1 de cet enseignant est la première leçon de la première sous-branche, et ainsi de suite.', { l: ids.map(id => branchOf(id).en).join(' → ') })}</p>` : null}</div>` : null;
  return html`${branches}<div class="g2x2">${f('th', t('Leçons (numérotées du syllabus)'))}${f('pr', t('Travaux pratiques (Practical work)'))}${f('fs', t('Further study / travail guidé'))}${f('hth', t('Heures de théorie'))}${f('hpr', t('Heures de TP'))}</div>
    <p class="hint">${t('{l} leçons · {p} TP · {h} h (les further study ne comptent pas dans les leçons)', { l: +cur.th || 0, p: (+cur.pr || 0) + ' TP + ' + (+cur.fs || 0) + ' further study', h: totalHours(cur) })}</p>
    <details><summary class="sub">${t('Le programme reprend en cours de route ? (numéro de la première leçon)')}</summary><div style="margin-top:6px">${six && ids.length ? html`<${Field} label=${t('Première leçon de l’année (n°)')}><${DraftInput} class="input" type="number" min="0" inputmode="numeric" value=${cur.n0 || ''} onChange=${(e) => pickBranches(ids, +e.target.value || 0)} /><//>` : f('n0', t('Première leçon de l’année (n°)'))}
      ${prev && !six ? html`<${Field} label=${t('Cet enseignant continue le programme de {l} à partir de la leçon n°', { l: 'Form ' + ((+/\d/.exec(level) || 1) - 1) })} hint=${t('Exemple : la physical geography de Form 3 reprise en Form 4 à partir de la leçon 24 → il reste 19 leçons, numérotées 24 à 42.')}><${DraftInput} class="input" type="number" min="0" inputmode="numeric" value=${cur.n0 || ''} onChange=${(e) => reprise(e.target.value)} /><//>` : null}</div></details>`;
}
