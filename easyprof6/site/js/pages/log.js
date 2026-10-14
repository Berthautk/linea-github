import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Empty, Chip, num1 } from '../ui.js';
import { Icon } from '../icons.js';
import { EntryForm } from './entry.js';
import { makeCtx } from '../calc.js';
import { state, myId, setToast, isAP } from '../store.js';
import { deleteEntry } from '../actions.js';
import { openAbsence } from '../widgets.js';
import { typeOf, reasonOf } from '../consts.js';
import { fmt, endFor } from '../dates.js';
import { MyWeek } from './myweek.js';

export function RecentList({ ctx, tid, limit = 6 }) {
  const lang = getLang(), rows = ctx.entries.filter(e => e.teacherId === tid).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.u || 0) - (a.u || 0))).slice(0, limit);
  if (!rows.length) return html`<p class="sub">${t('Vos dernières saisies apparaîtront ici.')}</p>`;
  return html`<div class="list">${rows.map(e => { const ty = e.type === 'absence' ? { icon: reasonOf(e.reason).icon, fr: reasonOf(e.reason).fr } : typeOf(e.type);
    return html`<div class="item"><div class="dot">${ty.icon}</div><div class="grow"><b>${e.type === 'absence' ? t(ty.fr) : ((ctx.cls(e.classId) || {}).name || e.classId) + (e.n != null ? ' · ' + t('leçon') + ' ' + e.n : ' · ' + t(ty.fr))}</b><span>${fmt(e.date, lang, { noYear: true })}${e.type === 'absence' ? '' : ' · ' + num1(e.minutes / 60) + ' h'}${e.title ? ' · ' + e.title : ''}</span></div></div>`; })}</div>`;
}

export function Log() {
  const ctx = makeCtx(state.data), tid = myId(), [pre, setPre] = useState(null);
  const fill = (row, iso) => { setPre({ classId: row.c, date: iso, start: row.st || '07:30', end: row.en || endFor(row.st || '07:30', row.h, ctx.dept.breaks, ctx.dept.period) }); setTimeout(() => { const el = document.getElementById('entry-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); };
  const done = (rec, info) => {
    setPre(null);
    const c = (ctx.cls(rec.classId) || {}).name || '';
    setToast(info.editing ? t('Séance modifiée.') : (info.wasN != null ? t('{c} · leçon {n} enregistrée', { c, n: info.wasN }) : t('{c} · séance enregistrée', { c })), '', info.editing ? null : { label: t('Annuler'), run: () => deleteEntry(rec.id) });
  };
  return html`<div class="page"><div class="page-h"><h1>${t('Saisir un cours')}</h1><div class="row">${isAP() ? html`<a class="btn soft sm" href="#/week">${t('Contrôler un collègue')}</a>` : null}<button class="btn ghost sm" onClick=${() => openAbsence(ctx, tid)}>${t('Pas de cours')}</button></div></div>
    ${!ctx.classes.length ? html`<div class="card"><${Empty} icon="🏫" title=${t('Aucune classe pour le moment')} text=${t('L’animateur pédagogique doit d’abord créer les classes du département.')}><a class="btn sm" href="#/settings/classes">${t('Ouvrir les classes')}</a><//></div>` : null}
    <${MyWeek} ctx=${ctx} tid=${tid} onFill=${fill} />
    <div class="card" id="entry-form"><${EntryForm} key=${pre ? pre.classId + pre.date : 'new'} ctx=${ctx} tid=${tid} initial=${pre || undefined} onSaved=${done} /></div>
    <div class="card"><div class="card-h"><h3>${t('Dernières saisies')}</h3><a class="btn soft sm" href="#/lessons">${t('Tout voir et modifier')}</a></div><${RecentList} ctx=${ctx} tid=${tid} /></div></div>`;
}
