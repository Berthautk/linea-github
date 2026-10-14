// Historique complet des séances : filtrer, modifier, supprimer (avec annulation).
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Empty, Chip, Field, Modal, openModal, closeModal, confirmDialog, num1 } from '../ui.js';
import { Icon } from '../icons.js';
import { EntryForm } from './entry.js';
import { makeCtx } from '../calc.js';
import { state, myId, isAP, setToast } from '../store.js';
import { deleteEntry, restoreEntry, saveEntry } from '../actions.js';
import { currentTid, ScopeBar } from '../widgets.js';
import { TYPES, REASONS, typeOf, reasonOf } from '../consts.js';
import { fmt, mondayOf, addDays } from '../dates.js';
import { Field as F2, Seg } from '../ui.js';
import { Gaps } from './gaps.js';

function AbsenceEdit({ e, onDone }) {
  const [f, setF] = useState({ reason: e.reason || 'other', date: e.date, note: e.note || '' });
  return html`<${Modal} title=${t('Modifier le jour sans cours')} onClose=${closeModal}>
    <${Field} label=${t('Motif')}><select class="input" value=${f.reason} onChange=${(x) => setF({ ...f, reason: x.target.value })}>${REASONS.map(r => html`<option value=${r.id}>${r.icon} ${t(r.fr)}</option>`)}</select><//>
    <${Field} label=${t('Date')}><input class="input" type="date" value=${f.date} onInput=${(x) => setF({ ...f, date: x.target.value })} /><//>
    <${Field} label=${t('Précision')}><input class="input" value=${f.note} onInput=${(x) => setF({ ...f, note: x.target.value })} /><//>
    <button class="btn block" onClick=${() => { saveEntry({ ...e, ...f }); closeModal(); setToast(t('Enregistré.')); }}>${t('Enregistrer')}</button><//>`;
}
export function openEdit(ctx, e) {
  if (e.type === 'absence') return openModal(() => html`<${AbsenceEdit} e=${e} />`);
  openModal(() => html`<${Modal} title=${t('Modifier la séance')} onClose=${closeModal}><${EntryForm} ctx=${makeCtx(state.data)} tid=${e.teacherId} initial=${e} onSaved=${() => { closeModal(); setToast(t('Séance modifiée.')); }} /><//>`);
}
export function askDelete(e) {
  confirmDialog({ title: t('Supprimer cette séance ?'), message: t('Elle disparaîtra de votre historique et de vos statistiques.'), confirm: t('Supprimer'), danger: true,
    onConfirm: () => { const old = deleteEntry(e.id); setToast(t('Séance supprimée.'), '', { label: t('Annuler'), run: () => restoreEntry(old) }); } });
}

export function Lessons() {
  const ctx = makeCtx(state.data), lang = getLang(), ap = isAP(), scope = ap ? state.ui.scope : 'me', tid = currentTid();
  const [F, setF] = useState({ cls: '', type: '', who: '', from: '', to: '', limit: 60 }), [view, setView] = useState('done');
  let rows = ctx.entries.filter(e => (tid ? e.teacherId === tid : !F.who || e.teacherId === F.who));
  rows = rows.filter(e => (!F.cls || e.classId === F.cls) && (!F.type || e.type === F.type) && (!F.from || e.date >= F.from) && (!F.to || e.date <= F.to))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.u || 0) - (a.u || 0)));
  const hours = rows.reduce((s, e) => s + (e.type === 'absence' ? 0 : (e.minutes || 0) / 60), 0);
  const shown = rows.slice(0, F.limit), groups = [];
  for (const e of shown) { const w = mondayOf(e.date); let g = groups[groups.length - 1]; if (!g || g.w !== w) { g = { w, list: [] }; groups.push(g); } g.list.push(e); }
  const set = (k, v) => setF(o => ({ ...o, [k]: v, limit: 60 }));
  const canEdit = (e) => ap || e.teacherId === myId();
  return html`<div class="page"><div class="page-h"><h1>${tid && tid !== myId() ? t('Historique de {n}', { n: (ctx.teacher(tid) || {}).name }) : tid ? t('Mon historique') : t('Historique du département')}</h1><span class="sub">${rows.length} ${t('séance(s)')} · ${num1(hours)} h</span></div>
    <p class="sub">${t('Toutes les séances déjà enregistrées : retrouvez-les, modifiez-les ou supprimez-les. Pour en ajouter une nouvelle, utilisez « Saisir ».')}</p>
    <${ScopeBar} ctx=${ctx} />
    <${Seg} full options=${[{ id: 'done', label: t('Séances saisies') }, { id: 'gaps', label: t('À compléter') }]} value=${view} onChange=${setView} />
    ${view === 'gaps' ? html`<${Gaps} ctx=${ctx} tid=${tid} />` : html`<div class="card"><div class="grid3"><${Field} label=${t('Classe')}><select class="input" value=${F.cls} onChange=${(e) => set('cls', e.target.value)}><option value="">${t('Toutes')}</option>${ctx.classes.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select><//>
      <${Field} label=${t('Type')}><select class="input" value=${F.type} onChange=${(e) => set('type', e.target.value)}><option value="">${t('Tous')}</option>${TYPES.map(x => html`<option value=${x.id}>${x.icon} ${t(x.fr)}</option>`)}<option value="absence">${t('Pas de cours')}</option></select><//>
      ${!tid ? html`<${Field} label=${t('Enseignant')}><select class="input" value=${F.who} onChange=${(e) => set('who', e.target.value)}><option value="">${t('Tous')}</option>${ctx.teachers.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select><//>` : html`<div></div>`}</div>
      <div class="grid2" style="margin-top:12px"><${Field} label=${t('Du')}><input class="input" type="date" value=${F.from} onInput=${(e) => set('from', e.target.value)} /><//><${Field} label=${t('Au')}><input class="input" type="date" value=${F.to} onInput=${(e) => set('to', e.target.value)} /><//></div></div>
    ${!rows.length ? html`<div class="card"><${Empty} icon="📖" title=${t('Aucune séance')} text=${t('Les séances que vous saisissez apparaissent ici, de la rentrée à aujourd’hui. Vous pouvez les modifier ou les supprimer.')}><a class="btn sm" href="#/log">${t('Saisir un cours')}</a><//></div>` : groups.map(g => html`<div class="card"><div class="card-h"><h3>${t('Semaine du {d}', { d: fmt(g.w, lang, { noYear: true }) })}</h3><span class="sub">${num1(g.list.reduce((s, e) => s + (e.type === 'absence' ? 0 : (e.minutes || 0) / 60), 0))} h</span></div><div class="list">
      ${g.list.map(e => { const abs = e.type === 'absence', ty = abs ? reasonOf(e.reason) : typeOf(e.type), who = ctx.teacher(e.teacherId);
        return html`<div class="item"><div class=${'dot ' + (abs ? 'warn' : '')}>${ty.icon}</div><div class="grow"><b>${abs ? t(ty.fr) + (e.note ? ' · ' + e.note : '') : ((ctx.cls(e.classId) || {}).name || e.classId) + (e.n != null ? ' · ' + (e.type === 'practical' ? 'TP' : t('leçon')) + ' ' + e.n : ' · ' + t(ty.fr))}</b>
          <span>${fmt(e.date, lang, { weekday: true, short: true, noYear: true })}${abs ? '' : ' · ' + (e.start ? e.start + '–' + e.end + ' · ' : '') + num1(e.minutes / 60) + ' h'}${!tid && who ? ' · ' + who.short : ''}${!abs && e.title ? ' · ' + e.title : ''}</span></div>
          ${e.digital ? html`<${Chip} tone="info">digital<//>` : null}${canEdit(e) ? html`<button class="icon-btn" aria-label=${t('Modifier')} onClick=${() => openEdit(ctx, e)}><${Icon} n="edit" /></button><button class="icon-btn" aria-label=${t('Supprimer')} onClick=${() => askDelete(e)}><${Icon} n="trash" /></button>` : null}</div>`; })}</div></div>`)}
    ${rows.length > F.limit ? html`<button class="btn soft" onClick=${() => setF(o => ({ ...o, limit: o.limit + 60 }))}>${t('Afficher plus')}</button>` : null}`}</div>`;
}
