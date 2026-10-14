// Éléments partagés par plusieurs pages : sélecteur de période, choix de la vue (département / enseignant), carte « aujourd'hui ».
import { html } from './vendor/preact-htm.js';
import { t, getLang } from './i18n.js';
import { Icon } from './icons.js';
import { Seg, Field, Chip, openModal, closeModal, Modal } from './ui.js';
import { periodOf, shiftPeriod, todaySlots, nextNumber } from './calc.js';
import { fmt, dayName, dow, addDays, monthName, minToTime, timeToMin } from './dates.js';
import { state, setUI, isAP, myId, setToast, getScope, setScope } from './store.js';
import { saveEntry, deleteEntry, restoreEntry } from './actions.js';
import { reasonOf } from './consts.js';

export function periodLabel(p, ctx) {
  const lang = getLang(), same = p.ps.slice(0, 4) === p.pe.slice(0, 4);
  if (p.kind === 'week') return t('Semaine du {a} au {b}', { a: fmt(p.ps, lang, { noYear: true }), b: fmt(addDays(p.ps, 5), lang) });
  if (p.kind === 'month') { const m = +p.ps.slice(5, 7) - 1; const n = monthName(m, lang); return n[0].toUpperCase() + n.slice(1) + ' ' + p.ps.slice(0, 4); }
  if (p.kind === 'term') { const tm = ctx.terms.find(x => x.id === p.term); return (tm ? tm.name : t('Trimestre')) + ' · ' + fmt(p.ps, lang, { noYear: same }) + ' → ' + fmt(p.pe, lang); }
  if (p.kind === 'year') return t('Année {y}', { y: ctx.dept.year || '' });
  return fmt(p.ps, lang) + ' → ' + fmt(p.pe, lang);
}
export function unitFor(p) { const days = (new Date(p.pe) - new Date(p.ps)) / 864e5; return p.kind === 'week' || days <= 8 ? 'day' : days > 150 ? 'month' : 'week'; }

export function PeriodBar({ ctx, period, onChange, compact }) {
  const opts = [{ id: 'week', label: t('Semaine') }, { id: 'month', label: t('Mois') }, { id: 'term', label: t('Trimestre') }, { id: 'year', label: t('Année') }, { id: 'custom', label: t('Dates') }];
  const pick = (k) => onChange(k === 'custom' ? { kind: 'custom', ps: period.ps, pe: period.pe } : periodOf(ctx, k, k === 'term' || k === 'week' || k === 'month' ? (period.kind === 'custom' || period.kind === 'year' ? ctx.today : period.ps) : ctx.today));
  const move = (d) => onChange(shiftPeriod(ctx, period, d));
  return html`<div class="stack" style="gap:10px">
    <${Seg} options=${opts} value=${period.kind} onChange=${pick} />
    ${period.kind === 'custom'
      ? html`<div class="row"><${Field} label=${t('Du')} class="grow"><input class="input" type="date" value=${period.ps} onInput=${(e) => e.target.value && onChange({ ...period, ps: e.target.value })} /><//><${Field} label=${t('Au')} class="grow"><input class="input" type="date" value=${period.pe} min=${period.ps} onInput=${(e) => e.target.value && onChange({ ...period, pe: e.target.value })} /><//></div>`
      : html`<div class="row" style="flex-wrap:nowrap"><button class="icon-btn" onClick=${() => move(-1)} disabled=${period.kind === 'year'} aria-label=${t('Précédent')}><${Icon} n="left" /></button><b class="grow" style="text-align:center;font-size:${compact ? 14 : 15}px">${periodLabel(period, ctx)}</b><button class="icon-btn" onClick=${() => move(1)} disabled=${period.kind === 'year'} aria-label=${t('Suivant')}><${Icon} n="right" /></button></div>`}
  </div>`;
}

/* qui regarde-t-on ? (animateur : département, moi, ou un collègue) */
export function currentTid() { const s = getScope(); return s === 'dept' ? null : s === 'me' ? myId() : s; }
export function ScopeBar({ ctx }) {
  const s = getScope(), other = s !== 'dept' && s !== 'me';
  const opts = [{ id: 'dept', label: t('Département') }, { id: 'me', label: t('Moi') }];
  const t2 = other ? ctx.teacher(s) : null;
  return html`<div class="row noprint"><${Seg} options=${opts} value=${other ? '' : s} onChange=${(v) => setScope(v)} />
    ${t2 ? html`<${Chip} tone="info">${t2.name}<//><button class="btn soft sm" onClick=${() => setScope('dept')}>${t('Retour au département')}</button>` : null}
    ${ctx.teachers.length > 2 && !other ? html`<select class="input" style="width:auto;min-height:40px" value="" onChange=${(e) => e.target.value && setScope(e.target.value)}><option value="">${t('Voir un collègue…')}</option>${ctx.teachers.filter(x => x.id !== myId()).map(x => html`<option value=${x.id}>${x.name}</option>`)}</select>` : null}</div>`;
}

/* aujourd'hui : un cours du jour se saisit en un geste */
export function TodayCard({ ctx, tid }) {
  const lang = getLang(), td = todaySlots(ctx, tid), iso = ctx.today;
  const cname = (id) => (ctx.cls(id) || {}).name || id;
  const quick = (row) => {
    const start = row.st || '07:30', end = minToTime(timeToMin(start) + Math.round(row.h * 60)), n = nextNumber(ctx, tid, row.c, 'lesson');
    const rec = saveEntry({ teacherId: tid, classId: row.c, type: 'lesson', date: iso, start, end, n });
    setToast(t('{c} · leçon {n} enregistrée', { c: cname(row.c), n }), '', { label: t('Annuler'), run: () => deleteEntry(rec.id) });
  };
  const head = html`<div class="card-h"><h3>${t('Aujourd’hui')} · ${fmt(iso, lang, { weekday: true, noYear: true })}</h3>${td.reason ? html`<${Chip} tone="warn">${reasonOf(td.reason).icon} ${t(reasonOf(td.reason).fr)}<//>` : null}</div>`;
  if (td.reason) return html`<div class="card">${head}<p class="sub">${t('Pas de cours déclaré pour aujourd’hui : aucun rappel ne vous sera fait.')}</p></div>`;
  if (!td.teaching) return html`<div class="card">${head}<p class="sub">${td.off ? t('Jour sans cours dans le calendrier de l’établissement.') : t('Pas de cours prévu aujourd’hui d’après l’emploi du temps.')}</p>
    <div class="row" style="margin-top:10px"><a class="btn soft sm" href="#/log">${t('J’ai quand même cours')}</a></div></div>`;
  if (!td.rows.length) return html`<div class="card">${head}<p class="sub">${t('Aucun cours dans votre emploi du temps pour aujourd’hui.')}</p><div class="row" style="margin-top:10px"><a class="btn sm" href="#/log">${t('Saisir un cours')}</a></div></div>`;
  return html`<div class="card">${head}<div class="list">${td.rows.map(r => html`<div class="item"><div class=${'dot ' + (r.done ? 'ok' : '')}>${r.done ? '✓' : '📖'}</div>
    <div class="grow"><b>${cname(r.c)}</b><span>${r.h} h${r.st ? ' · ' + r.st : ''}${r.done ? ' · ' + t('saisi') : ''}</span></div>
    ${r.done ? null : html`<button class="btn sm" onClick=${() => quick(r)}><${Icon} n="check" />${t('Fait')}</button>`}</div>`)}</div>
    <div class="row" style="margin-top:10px"><a class="btn soft sm" href="#/log">${t('Saisir autrement')}</a><button class="btn ghost sm" onClick=${() => openAbsence(ctx, tid)}>${t('Pas de cours')}</button></div></div>`;
}

/* déclarer un ou plusieurs jours sans cours */
export function openAbsence(ctx, tid, preset = {}) {
  openModal(() => html`<${AbsenceSheet} ctx=${ctx} tid=${tid} preset=${preset} />`);
}
import { useState } from './vendor/preact-htm.js';
import { declareAbsence } from './actions.js';
import { REASONS } from './consts.js';
function AbsenceSheet({ ctx, tid, preset }) {
  const [f, setF] = useState({ reason: preset.reason || 'sick', from: preset.from || ctx.today, to: preset.to || preset.from || ctx.today, note: '' });
  const set = (k, v) => setF(o => { const n = { ...o, [k]: v }; if (k === 'from' && n.to < v) n.to = v; return n; });
  const go = () => { const n = declareAbsence({ teacherId: tid, from: f.from, to: f.to, reason: f.reason, note: f.note }); closeModal(); setToast(n ? t('{n} jour(s) sans cours enregistré(s).', { n }) : t('Déjà déclaré pour ces dates.')); };
  return html`<${Modal} title=${t('Pas de cours')} onClose=${closeModal}>
    <p class="sub">${t('Un jour déclaré n’est plus compté comme « saisie manquante » et aucun rappel n’est envoyé. Jour férié et activités scolaires ne comptent pas comme absence ; maladie, empêchement et mission comptent comme heures non faites.')}</p>
    <${Field} label=${t('Motif')}><select class="input" value=${f.reason} onChange=${(e) => set('reason', e.target.value)}>${REASONS.map(r => html`<option value=${r.id}>${r.icon} ${t(r.fr)}</option>`)}</select><//>
    <div class="grid2"><${Field} label=${t('Du')}><input class="input" type="date" value=${f.from} onInput=${(e) => set('from', e.target.value)} /><//><${Field} label=${t('Au')}><input class="input" type="date" min=${f.from} value=${f.to} onInput=${(e) => set('to', e.target.value)} /><//></div>
    <${Field} label=${t('Précision (facultatif)')}><input class="input" value=${f.note} onInput=${(e) => set('note', e.target.value)} /><//>
    <button class="btn block" onClick=${go}>${t('Enregistrer')}</button><//>`;
}
