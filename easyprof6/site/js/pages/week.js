// Contrôle de la semaine : l'animateur coche ce qu'un collègue a réellement fait (d'après ce que disent les élèves).
// Tout est enregistré au nom du collègue, comme s'il l'avait saisi lui-même.
import { html } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Chip, Empty, Field, Modal, openModal, closeModal, num1 } from '../ui.js';
import { EntryForm } from './entry.js';
import { makeCtx, stats, todaySlots, nextNumber } from '../calc.js';
import { state, setUI, isAP, myId, setToast } from '../store.js';
import { saveEntry, deleteEntry } from '../actions.js';
import { openAbsence } from '../widgets.js';
import { reasonOf } from '../consts.js';
import { addDays, mondayOf, fmt, timeToMin, minToTime } from '../dates.js';

const NOTE = 'Saisi par l’animateur pédagogique';
const LATE = [10, 15, 20, 30, 45, 60, 90];

/** Enregistre un cours donné comme fait (avec un éventuel retard et un nombre de leçons) au nom du collègue. */
function mark(ctx, tid, iso, row, { late = 0, lessons = 1 } = {}) {
  const start0 = timeToMin(row.st || '07:30'), from = start0 + late, to = start0 + Math.round(row.h * 60), total = to - from;
  if (total <= 0) return setToast(t('Le retard dépasse la durée du cours.'), 'bad');
  const per = Math.floor(total / lessons), first = nextNumber(ctx, tid, row.c, 'lesson'), ids = [];
  for (let k = 0; k < lessons; k++) {
    const a = from + k * per, b = k === lessons - 1 ? to : a + per;
    ids.push(saveEntry({ teacherId: tid, classId: row.c, type: 'lesson', date: iso, start: minToTime(a), end: minToTime(b), n: first + k, note: NOTE }).id);
  }
  const cname = (ctx.cls(row.c) || {}).name || row.c;
  setToast(lessons > 1 ? t('{c} · {k} leçons enregistrées', { c: cname, k: lessons }) : t('{c} · leçon {n} enregistrée', { c: cname, n: first }), '', { label: t('Annuler'), run: () => ids.forEach(deleteEntry) });
}

function LateSheet({ ctx, tid, iso, row }) {
  const pick = (m) => { closeModal(); mark(ctx, tid, iso, row, { late: m }); };
  return html`<${Modal} title=${t('Arrivé en retard')} onClose=${closeModal}>
    <p class="sub">${t('De combien de minutes ? Le cours est compté pour le temps réellement fait.')}</p>
    <div class="row" style="flex-wrap:wrap;gap:8px">${LATE.filter(m => m < row.h * 60).map(m => html`<button class="btn soft" onClick=${() => pick(m)}>${m} min</button>`)}</div><//>`;
}

function openOther(ctx, tid, iso, row) {
  const start = (row && row.st) || '07:30', end = minToTime(timeToMin(start) + Math.round(((row && row.h) || 1) * 60));
  openModal(() => html`<${Modal} title=${t('Une autre séance')} onClose=${closeModal}>
    <${EntryForm} ctx=${ctx} tid=${tid} initial=${{ classId: row ? row.c : '', date: iso, start, end, note: NOTE }} onSaved=${(rec) => { closeModal(); setToast(t('{c} · séance enregistrée', { c: (ctx.cls(rec.classId) || {}).name || '' })); }} /><//>`);
}

function Day({ ctx, tid, iso, future }) {
  const lang = getLang(), td = todaySlots(ctx, tid, iso), cname = (id) => (ctx.cls(id) || {}).name || id;
  const entriesOf = (c) => td.entries.filter(e => e.classId === c);
  const head = html`<div class="card-h"><h3 class="cap">${fmt(iso, lang, { weekday: true, noYear: true })}</h3>
    ${td.reason ? html`<${Chip} tone="warn">${reasonOf(td.reason).icon} ${t(reasonOf(td.reason).fr)}<//>` : future ? html`<${Chip}>${t('à venir')}<//>` : td.off ? html`<${Chip}>${t('jour sans cours')}<//>` : null}</div>`;
  if (!td.rows.length && !td.entries.length) return null;
  return html`<div class="card">${head}
    <div class="list">${td.rows.map(r => {
      const es = entriesOf(r.c), hrs = es.reduce((s, e) => s + (+e.minutes || 0), 0) / 60;
      return html`<div class="wk"><div class="wk-main"><div class=${'dot ' + (r.done ? 'ok' : '')}>${r.done ? '✓' : '📖'}</div><div class="grow"><b>${cname(r.c)}</b>
        <span>${r.st ? r.st + ' → ' + minToTime(timeToMin(r.st) + Math.round(r.h * 60)) + ' · ' : ''}${r.h} h${r.done ? ' · ' + t('fait : {h} h', { h: num1(hrs) }) + (es.some(e => e.n != null) ? ' · ' + t('leçon') + ' ' + es.map(e => e.n).filter(n => n != null).join(', ') : '') : ''}</span></div></div>
        ${future || td.reason ? null : r.done ? html`<div class="wk-act"><button class="btn ghost sm" onClick=${() => { const old = es.map(e => e); es.forEach(e => deleteEntry(e.id)); setToast(t('Saisie retirée.'), '', { label: t('Annuler'), run: () => old.forEach(e => saveEntry({ ...e, teacherId: tid })) }); }}>${t('Retirer')}</button></div>`
          : html`<div class="wk-act"><button class="btn sm" onClick=${() => mark(ctx, tid, iso, r)}><${Icon} n="check" />${t('Présent')}</button>
            ${r.h >= 2 ? html`<button class="btn soft sm" onClick=${() => mark(ctx, tid, iso, r, { lessons: 2 })}>${t('2 leçons')}</button>` : null}
            <button class="btn soft sm" onClick=${() => openModal(() => html`<${LateSheet} ctx=${ctx} tid=${tid} iso=${iso} row=${r} />`)}>${t('En retard')}</button>
            <button class="btn ghost sm" onClick=${() => openOther(ctx, tid, iso, r)}>${t('Autre…')}</button></div>`}</div>`;
    })}
    ${td.entries.filter(e => !td.rows.some(r => r.c === e.classId)).map(e => html`<div class="wk"><div class="wk-main"><div class="dot ok">✓</div><div class="grow"><b>${cname(e.classId)}</b><span>${t('hors emploi du temps')} · ${num1((+e.minutes || 0) / 60)} h${e.n != null ? ' · ' + t('leçon') + ' ' + e.n : ''}</span></div></div>
      ${future ? null : html`<div class="wk-act"><button class="btn ghost sm" onClick=${() => deleteEntry(e.id)}>${t('Retirer')}</button></div>`}</div>`)}</div>
    ${future || td.reason || !td.rows.length ? null : html`<div class="row" style="margin-top:10px"><button class="btn ghost sm" onClick=${() => openAbsence(ctx, tid, { from: iso, to: iso, reason: 'other' })}>${t('Absent toute la journée')}</button></div>`}</div>`;
}

export function Week() {
  const ctx = makeCtx(state.data);
  if (!isAP()) return html`<div class="page"><${Empty} title=${t('Réservé à l’animateur pédagogique')}><a class="btn sm" href="#/home">${t('Retour')}</a><//></div>`;
  const others = ctx.teachers.filter(x => x.id !== myId()), list = others.length ? others : ctx.teachers;
  const tid = state.ui.wtid && ctx.teacher(state.ui.wtid) ? state.ui.wtid : (list[0] || {}).id;
  const mon = state.ui.wweek || mondayOf(ctx.today), sat = addDays(mon, 5), lang = getLang();
  if (!tid) return html`<div class="page"><${Empty} icon="👥" title=${t('Aucun collègue')} text=${t('Ajoutez d’abord vos collègues dans Réglages › Équipe.')}><a class="btn sm" href="#/settings/team">${t('Ouvrir Équipe')}</a><//></div>`;
  const tc = ctx.teacher(tid), S = stats(ctx, tid, mon, sat < ctx.today ? sat : ctx.today > mon ? ctx.today : mon);
  const days = [0, 1, 2, 3, 4, 5].map(k => addDays(mon, k));
  const noTT = !(tc.slots || []).length;
  return html`<div class="page"><div class="page-h"><h1>${t('Contrôle de la semaine')}</h1><a class="btn soft sm" href="#/log">${t('Ma saisie')}</a></div>
    <p class="sub">${t('Vous remplissez à la place d’un collègue, d’après ce que les élèves vous disent. Tout est enregistré à son nom, et ses statistiques se mettent à jour tout de suite.')}</p>
    <div class="card stack"><${Field} label=${t('Collègue')}><select class="input" value=${tid} onChange=${(e) => setUI({ wtid: e.target.value })}>${list.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select><//>
      <div class="row" style="flex-wrap:nowrap"><button class="icon-btn" onClick=${() => setUI({ wweek: addDays(mon, -7) })} aria-label=${t('Précédent')}><${Icon} n="left" /></button>
        <b class="grow" style="text-align:center">${t('Semaine du {a} au {b}', { a: fmt(mon, lang, { noYear: true }), b: fmt(sat, lang) })}</b>
        <button class="icon-btn" onClick=${() => setUI({ wweek: addDays(mon, 7) })} aria-label=${t('Suivant')}><${Icon} n="right" /></button></div>
      ${noTT ? html`<a class="notice" href=${'#/settings/team/' + tid}><${Icon} n="alert" size="18" /><span>${t('Ce collègue n’a pas d’emploi du temps : ouvrez sa fiche pour l’ajouter, sinon rien ne s’affiche ici.')}</span></a>`
        : html`<div class="row"><${Chip} tone="info">${t('{h} h faites sur {d} h dues cette semaine', { h: num1(S.hours), d: num1(S.due) })}<//><button class="btn soft sm" onClick=${() => openOther(ctx, tid, ctx.today > sat ? sat : ctx.today < mon ? mon : ctx.today, null)}>${t('+ Autre séance')}</button></div>`}</div>
    ${days.map(iso => html`<${Day} ctx=${ctx} tid=${tid} iso=${iso} future=${iso > ctx.today} />`)}
    <p class="hint">${t('Un cours que vous ne cochez pas compte comme heures non faites. « En retard » enlève les minutes manquées. « 2 leçons » enregistre deux leçons dans la même séance.')}</p></div>`;
}
