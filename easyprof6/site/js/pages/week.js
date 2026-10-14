// Ronde en classe : l'animateur choisit un collègue, voit son emploi du temps de la semaine (jours, classes, heures de début et de fin)
// et coche ce que les élèves racontent : présent, en retard (de combien), absent, nombre de leçons et numéro.
// Tout est enregistré au nom du collègue, comme s'il l'avait saisi lui-même.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Chip, Empty, Field, Modal, Seg, openModal, closeModal, num1 } from '../ui.js';
import { EntryForm } from './entry.js';
import { makeCtx, stats, todaySlots, nextNumber } from '../calc.js';
import { state, setUI, isAP, myId, setToast } from '../store.js';
import { saveEntry, deleteEntry } from '../actions.js';
import { openAbsence } from '../widgets.js';
import { REASONS, TYPES, reasonOf, isLessonType } from '../consts.js';
import { addDays, mondayOf, fmt, timeToMin, minToTime, endFor } from '../dates.js';

const NOTE = 'Saisi par l’animateur pédagogique';
const LATE = [10, 15, 20, 30, 45, 60];
const ABSENT_WHY = REASONS.filter(r => !r.out);

/** Enregistre un cours comme fait : retard éventuel, nombre de leçons, numéro de la première leçon. */
function record(ctx, tid, iso, row, { late = 0, lessons = 1, n, type = 'lesson', title = '' } = {}) {
  const brk = ctx.dept.breaks, st = row.st || '07:30', total = Math.round(row.h * 60) - late;
  if (total <= 0) { setToast(t('Le retard dépasse la durée du cours.'), 'bad'); return []; }
  const k = isLessonType(type) ? Math.max(1, lessons) : 1, per = Math.floor(total / k), ids = [];
  const first = isLessonType(type) ? (n != null && n !== '' ? +n : nextNumber(ctx, tid, row.c, type)) : null;
  const from = late ? endFor(st, late / 60, brk) : st;                                  // heure d'arrivée
  for (let i = 0; i < k; i++) {
    const a = i === 0 ? from : endFor(from, (per * i) / 60, brk), b = i === k - 1 ? (row.en || endFor(st, row.h, brk)) : endFor(from, (per * (i + 1)) / 60, brk);
    ids.push(saveEntry({ teacherId: tid, classId: row.c, type, date: iso, start: a, end: b, minutes: i === k - 1 ? total - per * (k - 1) : per, n: first != null ? first + i : null, title, note: NOTE }).id);
  }
  const cname = (ctx.cls(row.c) || {}).name || row.c;
  setToast(k > 1 ? t('{c} · {k} leçons enregistrées', { c: cname, k }) : first != null ? t('{c} · leçon {n} enregistrée', { c: cname, n: first }) : t('{c} · séance enregistrée', { c: cname }), '', { label: t('Annuler'), run: () => ids.forEach(deleteEntry) });
  return ids;
}

/** Absent à ce cours (heure de début et de fin comprises). */
function absent(ctx, tid, iso, row, reason = 'unknown') {
  const rec = saveEntry({ teacherId: tid, classId: row.c, type: 'absence', date: iso, start: row.st || '', end: row.en || '', minutes: 0, reason, note: NOTE });
  setToast(t('{c} · absence enregistrée', { c: (ctx.cls(row.c) || {}).name || row.c }), '', { label: t('Annuler'), run: () => deleteEntry(rec.id) });
}

function Round({ ctx, tid, iso, row }) {
  const lang = getLang(), cname = (ctx.cls(row.c) || {}).name || row.c;
  const [st, setSt] = useState('present'), [late, setLate] = useState(0), [k, setK] = useState(1), [type, setType] = useState('lesson'), [title, setTitle] = useState('');
  const [n, setN] = useState(String(nextNumber(ctx, tid, row.c, 'lesson'))), [why, setWhy] = useState('unknown');
  const lesson = isLessonType(type), left = Math.max(0, Math.round(row.h * 60) - (st === 'late' ? late : 0));
  const save = () => {
    closeModal();
    if (st === 'absent') return absent(ctx, tid, iso, row, why);
    record(ctx, tid, iso, row, { late: st === 'late' ? late : 0, lessons: k, n: lesson ? n : null, type, title: title.trim() });
  };
  return html`<${Modal} title=${cname} onClose=${closeModal}>
    <p class="sub" style="text-transform:capitalize">${fmt(iso, lang, { weekday: true, noYear: true })} · ${row.st ? row.st + ' → ' + (row.en || endFor(row.st, row.h, ctx.dept.breaks)) + ' · ' : ''}${row.h} h</p>
    <${Seg} full options=${[{ id: 'present', label: t('Présent') }, { id: 'late', label: t('En retard') }, { id: 'absent', label: t('Absent') }]} value=${st} onChange=${setSt} />
    ${st === 'absent' ? html`<${Field} label=${t('Motif')}><select class="input" value=${why} onChange=${(e) => setWhy(e.target.value)}>${ABSENT_WHY.map(r => html`<option value=${r.id}>${r.icon} ${t(r.fr)}</option>`)}</select><//>`
      : html`${st === 'late' ? html`<${Field} label=${t('Minutes de retard')}><div class="row" style="flex-wrap:wrap;gap:8px">${LATE.filter(m => m < row.h * 60).map(m => html`<button class=${'btn sm ' + (late === m ? '' : 'soft')} onClick=${() => setLate(m)}>${m}</button>`)}<input class="input" type="number" min="0" inputmode="numeric" style="width:90px" value=${late || ''} onInput=${(e) => setLate(+e.target.value || 0)} /></div><//>` : null}
        <${Field} label=${t('Type de séance')}><select class="input" value=${type} onChange=${(e) => setType(e.target.value)}>${TYPES.map(x => html`<option value=${x.id}>${x.icon} ${t(x.fr)}</option>`)}</select><//>
        ${lesson ? html`<div class="grid2"><${Field} label=${t('Leçons faites')}><div class="row" style="gap:8px">${[1, 2, 3].map(x => html`<button class=${'btn sm ' + (k === x ? '' : 'soft')} onClick=${() => setK(x)}>${x}</button>`)}</div><//>
          <${Field} label=${k > 1 ? t('N° de la première leçon') : t('N° de la leçon')}><input class="input" type="number" min="1" inputmode="numeric" value=${n} onInput=${(e) => setN(e.target.value)} /><//></div>` : null}
        <${Field} label=${t('Titre de la leçon (facultatif)')}><input class="input" value=${title} onInput=${(e) => setTitle(e.target.value)} /><//>
        <div class="sub">${t('Sera compté : {h} h', { h: num1(left / 60) })}</div>`}
    <button class="btn block" onClick=${save}>${t('Enregistrer')}</button><//>`;
}

function openOther(ctx, tid, iso) {
  openModal(() => html`<${Modal} title=${t('Une autre séance')} onClose=${closeModal}>
    <${EntryForm} ctx=${ctx} tid=${tid} initial=${{ date: iso, note: NOTE }} onSaved=${(rec) => { closeModal(); setToast(t('{c} · séance enregistrée', { c: (ctx.cls(rec.classId) || {}).name || '' })); }} /><//>`);
}

function Day({ ctx, tid, iso, future }) {
  const lang = getLang(), td = todaySlots(ctx, tid, iso), cname = (id) => (ctx.cls(id) || {}).name || id;
  const entriesOf = (c) => td.entries.filter(e => e.classId === c);
  const absEntry = (c) => (ctx.byTeacher[tid] || []).find(e => e.type === 'absence' && e.date === iso && e.classId === c);
  if (!td.rows.length && !td.entries.length) return null;
  const head = html`<div class="card-h"><h3 class="cap">${fmt(iso, lang, { weekday: true, noYear: true })}</h3>
    ${td.reason ? html`<${Chip} tone="warn">${reasonOf(td.reason).icon} ${t(reasonOf(td.reason).fr)}<//>` : future ? html`<${Chip}>${t('à venir')}<//>` : td.off ? html`<${Chip}>${t('jour sans cours')}<//>` : null}</div>`;
  const locked = future || !!td.reason;
  return html`<div class="card">${head}
    <div class="list">${td.rows.map(r => {
      const es = entriesOf(r.c), hrs = es.reduce((s, e) => s + (+e.minutes || 0), 0) / 60, time = r.st ? r.st + ' → ' + r.en : '', open = () => openModal(() => html`<${Round} ctx=${ctx} tid=${tid} iso=${iso} row=${r} />`);
      return html`<div class="wk"><button class="wk-main" onClick=${locked || r.done || r.absent ? null : open} disabled=${locked || r.done || !!r.absent}><div class=${'dot ' + (r.done ? 'ok' : r.absent ? 'bad' : '')}>${r.done ? '✓' : r.absent ? '✗' : '📖'}</div><div class="grow"><b>${cname(r.c)}</b>
        <span>${time ? time + ' · ' : ''}${r.h} h${r.done ? ' · ' + t('fait : {h} h', { h: num1(hrs) }) + (es.some(e => e.n != null) ? ' · ' + t('leçon') + ' ' + es.map(e => e.n).filter(n => n != null).join(', ') : '') : r.absent ? ' · ' + t('absent') + ' (' + t(reasonOf(r.absent).fr).toLowerCase() + ')' : ''}</span></div></button>
        ${locked ? null : r.done ? html`<div class="wk-act"><button class="btn ghost sm" onClick=${() => { const old = es.slice(); es.forEach(e => deleteEntry(e.id)); setToast(t('Saisie retirée.'), '', { label: t('Annuler'), run: () => old.forEach(e => saveEntry({ ...e, teacherId: tid })) }); }}>${t('Retirer')}</button></div>`
          : r.absent ? html`<div class="wk-act"><button class="btn ghost sm" onClick=${() => { const a = absEntry(r.c); if (a) deleteEntry(a.id); }}>${t('Retirer')}</button></div>`
            : html`<div class="wk-act"><button class="btn sm" onClick=${() => record(ctx, tid, iso, r)}><${Icon} n="check" />${t('Présent')}</button><button class="btn soft sm" onClick=${() => absent(ctx, tid, iso, r)}>${t('Absent')}</button><button class="btn ghost sm" onClick=${open}>${t('Détails…')}</button></div>`}</div>`;
    })}
    ${td.entries.filter(e => !td.rows.some(r => r.c === e.classId)).map(e => html`<div class="wk"><div class="wk-main"><div class="dot ok">✓</div><div class="grow"><b>${cname(e.classId)}</b><span>${t('hors emploi du temps')} · ${num1((+e.minutes || 0) / 60)} h${e.n != null ? ' · ' + t('leçon') + ' ' + e.n : ''}</span></div></div>
      ${future ? null : html`<div class="wk-act"><button class="btn ghost sm" onClick=${() => deleteEntry(e.id)}>${t('Retirer')}</button></div>`}</div>`)}</div>
    ${locked || !td.rows.length ? null : html`<div class="row" style="margin-top:10px"><button class="btn ghost sm" onClick=${() => openAbsence(ctx, tid, { from: iso, to: iso, reason: 'unknown' })}>${t('Absent toute la journée')}</button></div>`}</div>`;
}

export function Week() {
  const ctx = makeCtx(state.data);
  if (!isAP()) return html`<div class="page"><${Empty} title=${t('Réservé à l’animateur pédagogique')}><a class="btn sm" href="#/home">${t('Retour')}</a><//></div>`;
  const others = ctx.teachers.filter(x => x.id !== myId()), list = others.length ? others : ctx.teachers;
  const tid = state.ui.wtid && ctx.teacher(state.ui.wtid) ? state.ui.wtid : (list[0] || {}).id;
  const mon = state.ui.wweek || mondayOf(ctx.today), sat = addDays(mon, 5), lang = getLang();
  if (!tid) return html`<div class="page"><${Empty} icon="👥" title=${t('Aucun collègue')} text=${t('Ajoutez d’abord vos collègues dans Réglages › Équipe.')}><a class="btn sm" href="#/settings/team">${t('Ouvrir Équipe')}</a><//></div>`;
  const tc = ctx.teacher(tid), pe = sat < ctx.today ? sat : ctx.today > mon ? ctx.today : mon, S = stats(ctx, tid, mon, pe);
  const days = [0, 1, 2, 3, 4, 5].map(k => addDays(mon, k)), noTT = !(tc.slots || []).length;
  return html`<div class="page"><div class="page-h"><h1>${t('Ronde en classe')}</h1><a class="btn soft sm" href="#/log">${t('Ma saisie')}</a></div>
    <p class="sub">${t('Choisissez le collègue dont les élèves vous parlent, puis cochez ce qu’ils vous disent. Tout est enregistré à son nom, et ses statistiques se mettent à jour tout de suite.')}</p>
    <div class="card stack"><div class="row" style="flex-wrap:wrap;gap:8px">${list.map(x => html`<button class=${'btn sm ' + (x.id === tid ? '' : 'soft')} onClick=${() => setUI({ wtid: x.id })}>${x.short || x.name}</button>`)}</div>
      <div class="row" style="flex-wrap:nowrap"><button class="icon-btn" onClick=${() => setUI({ wweek: addDays(mon, -7) })} aria-label=${t('Précédent')}><${Icon} n="left" /></button>
        <b class="grow" style="text-align:center">${t('Semaine du {a} au {b}', { a: fmt(mon, lang, { noYear: true }), b: fmt(sat, lang) })}</b>
        <button class="icon-btn" onClick=${() => setUI({ wweek: addDays(mon, 7) })} aria-label=${t('Suivant')}><${Icon} n="right" /></button></div>
      ${noTT ? html`<a class="notice" href=${'#/settings/team/' + tid}><${Icon} n="alert" size="18" /><span>${t('Ce collègue n’a pas d’emploi du temps : ouvrez sa fiche pour l’ajouter, sinon rien ne s’affiche ici.')}</span></a>`
        : html`<div class="row"><${Chip} tone="info">${t('{h} h faites sur {d} h dues cette semaine', { h: num1(S.hours), d: num1(S.due) })}<//><button class="btn soft sm" onClick=${() => openOther(ctx, tid, ctx.today > sat ? sat : ctx.today < mon ? mon : ctx.today)}>${t('+ Autre séance')}</button></div>`}</div>
    ${days.map(iso => html`<${Day} ctx=${ctx} tid=${tid} iso=${iso} future=${iso > ctx.today} />`)}
    <p class="hint">${t('Un cours que vous ne cochez pas compte comme heures non faites. « Détails » permet d’indiquer un retard, plusieurs leçons, le numéro de la leçon ou un motif d’absence.')}</p></div>`;
}
