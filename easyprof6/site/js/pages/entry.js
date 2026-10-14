// Formulaire de saisie d'une séance (création et modification).
import { html, useState } from '../vendor/preact-htm.js';
import { t } from '../i18n.js';
import { Field, Chip, num1 } from '../ui.js';
import { Icon } from '../icons.js';
import { TYPES, isLessonType } from '../consts.js';
import { nextNumber, todaySlots, checkEntry } from '../calc.js';
import { dayName, fmt } from '../dates.js';
import { getLang } from '../i18n.js';
import { timeToMin, minToTime, creditMinutes, normTime } from '../dates.js';
import { saveEntry } from '../actions.js';

const DURATIONS = [[60, '1 h'], [90, '1 h 30'], [120, '2 h'], [150, '2 h 30'], [180, '3 h']];

export function EntryForm({ ctx, tid, initial, onSaved, submitLabel }) {
  const editing = !!(initial && initial.id);
  const mine = ctx.assign.filter(a => a.teacherId === tid).map(a => a.classId);
  const slot = (!editing && todaySlots(ctx, tid).rows.find(r => !r.done)) || null;
  const [f, setF] = useState(() => {
    const base = initial || {};
    const classId = base.classId || (slot && slot.c) || mine[0] || (ctx.classes[0] || {}).id || '';
    const start = base.start || (slot && slot.st) || '07:30';
    const end = base.end || minToTime(timeToMin(start) + Math.round(((slot && slot.h) || 2) * 60));
    return { id: base.id, type: base.type || 'lesson', classId, date: base.date || ctx.today, start, end, n: base.n != null ? String(base.n) : '', nAuto: base.n == null, title: base.title || '', digital: !!base.digital, evalOn: !!base.eval, evaluated: base.eval ? String(base.eval.evaluated) : '', passed: base.eval ? String(base.eval.passed) : '' };
  });
  const [err, setErr] = useState('');
  const set = (k, v) => setF(o => ({ ...o, [k]: v }));
  const lesson = isLessonType(f.type);
  const auto = lesson ? nextNumber(ctx, tid, f.classId, f.type) : null;
  const n = f.nAuto ? auto : f.n;
  const mins = creditMinutes(f.start, f.end, ctx.dept.breaks, ctx.dept.period);
  const setDur = (m) => set('end', minToTime(timeToMin(f.start) + m));
  const classOpts = [...mine, ...ctx.classes.map(c => c.id).filter(id => !mine.includes(id))];
  const cname = (id) => (ctx.cls(id) || {}).name || id;
  const warns = checkEntry(ctx, tid, { id: f.id, classId: f.classId, date: f.date, start: f.start, end: f.end }).map(w => {
    const lang = getLang(), day = f.date ? dayName(new Date(f.date + 'T00:00:00Z').getUTCDay(), lang) : '';
    if (w.kind === 'noday') return t('Le {d} n’est pas un jour de cours (dimanche, jour férié ou vacances). Vérifiez la date.', { d: fmt(f.date, lang) });
    if (w.kind === 'noslot') return t('{c} n’est pas dans l’emploi du temps du {j}', { c: cname(f.classId), j: day }) + (w.rows.length ? ' (' + w.rows.map(r => cname(r.c) + (r.st ? ' ' + r.st : '')).join(', ') + '). ' : '. ') + t('Vérifiez la classe et la date, ou continuez s’il s’agit d’un cours exceptionnel.');
    return t('Déjà saisi : {c} le {d} de {a} à {b}. Est-ce un doublon ?', { c: cname(f.classId), d: fmt(f.date, lang), a: w.entry.start, b: w.entry.end });
  });
  const submit = (e) => {
    e.preventDefault(); setErr('');
    if (!f.classId) return setErr(t('Choisissez la classe. Si la liste est vide, l’animateur doit d’abord créer les classes.'));
    if (mins <= 0) return setErr(t('L’heure de fin doit être après l’heure de début.'));
    if (lesson && !(+n > 0)) return setErr(t('Indiquez le numéro de la leçon.'));
    if (f.evalOn && +f.passed > +f.evaluated) return setErr(t('Le nombre d’élèves ayant la moyenne dépasse le nombre d’élèves évalués.'));
    const rec = saveEntry({ id: f.id, teacherId: tid, type: f.type, classId: f.classId, date: f.date, start: f.start, end: f.end, minutes: mins, n: lesson ? +n : null, title: f.title, digital: lesson && f.digital, eval: f.evalOn ? { evaluated: +f.evaluated || 0, passed: +f.passed || 0 } : null });
    onSaved && onSaved(rec, { editing, wasN: lesson ? +n : null });
    if (!editing) setF(o => ({ ...o, title: '', nAuto: true, n: '', start: o.end, end: minToTime(timeToMin(o.end) + mins), digital: false, evalOn: false, evaluated: '', passed: '' }));
  };
  return html`<form class="stack" onSubmit=${submit}>
    <div class="field"><label>${t('Type de séance')}</label><div class="seg" style="flex-wrap:wrap">${TYPES.map(x => html`<button type="button" class=${f.type === x.id ? 'on' : ''} onClick=${() => set('type', x.id)}>${x.icon} ${t(x.fr)}</button>`)}</div></div>
    <${Field} label=${t('Classe')}><select class="input" value=${f.classId} onChange=${(e) => set('classId', e.target.value)} required>${classOpts.length ? null : html`<option value="">${t('— aucune classe —')}</option>`}${classOpts.map(id => html`<option value=${id}>${(ctx.cls(id) || {}).name || id}</option>`)}</select><//>
    <div class="times"><${Field} class="wide" label=${t('Date')}><input class="input" type="date" value=${f.date} max=${editing ? '' : ctx.today} onInput=${(e) => set('date', e.target.value)} required /><//>
      <${Field} label=${t('Début')}><input class="input" type="time" value=${f.start} onInput=${(e) => set('start', normTime(e.target.value))} required /><//><${Field} label=${t('Fin')}><input class="input" type="time" value=${f.end} onInput=${(e) => set('end', normTime(e.target.value))} required /><//></div>
    <div class="row" style="gap:6px"><span class="lab">${t('Durée')} :</span>${DURATIONS.map(d => html`<button type="button" class=${'btn sm ' + (mins === d[0] ? '' : 'soft')} onClick=${() => setDur(d[0])}>${d[1]}</button>`)}<${Chip} tone=${mins > 0 ? 'info' : 'bad'}>${mins > 0 ? Math.floor(mins / 60) + ' h' + (mins % 60 ? ' ' + (mins % 60) : '') : t('invalide')}<//></div>
    ${lesson ? html`<${Field} label=${f.type === 'practical' ? t('N° du TP') : t('N° de la leçon')} hint=${f.nAuto ? t('Numéro suivant proposé automatiquement. Une même leçon faite en deux séances garde le même numéro.') : ''}>
      <div class="row" style="flex-wrap:nowrap"><input class="input" type="number" min="1" inputmode="numeric" value=${n} onInput=${(e) => setF(o => ({ ...o, n: e.target.value, nAuto: false }))} style="max-width:120px" />${f.nAuto ? html`<${Chip} tone="ok">${t('automatique')}<//>` : html`<button type="button" class="btn soft sm" onClick=${() => set('nAuto', true)}>${t('Remettre auto')}</button>`}</div><//>` : null}
    <${Field} label=${t('Titre ou chapitre (facultatif)')}><input class="input" value=${f.title} onInput=${(e) => set('title', e.target.value)} placeholder=${f.type === 'orientation' ? t('Présentation, règles de classe…') : t('Ex. Les plaques tectoniques')} /><//>
    ${lesson ? html`<label class="opt"><input type="checkbox" checked=${f.digital} onChange=${(e) => set('digital', e.target.checked)} /><span>${t('Leçon digitalisée (projecteur, diaporama…)')}</span></label>` : null}
    ${f.type === 'assessment' || lesson ? html`<label class="opt"><input type="checkbox" checked=${f.evalOn} onChange=${(e) => set('evalOn', e.target.checked)} /><span>${t('Il y a eu une évaluation (ajouter les résultats)')}</span></label>` : null}
    ${f.evalOn ? html`<div class="grid2"><${Field} label=${t('Élèves évalués')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.evaluated} onInput=${(e) => set('evaluated', e.target.value)} /><//><${Field} label=${t('Ayant la moyenne')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.passed} onInput=${(e) => set('passed', e.target.value)} /><//></div>` : null}
    ${warns.map(w => html`<div class="notice" role="status"><${Icon} n="alert" size="18" /><span>${w}</span></div>`)}
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}
    <button class="btn block" style="min-height:50px;font-size:16px"><${Icon} n="check" />${warns.length && !submitLabel ? t('Enregistrer quand même') : submitLabel || (editing ? t('Enregistrer les modifications') : t('Enregistrer la séance'))}</button>
  </form>`;
}
