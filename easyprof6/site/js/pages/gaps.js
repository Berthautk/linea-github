// Historique › « À compléter » : les cours prévus mais jamais saisis depuis la rentrée, et les saisies à vérifier (doublon, hors emploi du temps).
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Chip, Empty, num1 } from '../ui.js';
import { gapReport } from '../calc.js';
import { state, myId } from '../store.js';
import { record, absent, openRound } from './week.js';
import { openEdit, askDelete } from './lessons.js';
import { mondayOf, addDays, fmt } from '../dates.js';

const WHY = { noslot: 'cette classe n’est pas dans l’emploi du temps ce jour-là', noday: 'jour sans cours (dimanche, férié ou vacances)', dup: 'possible doublon (même classe, même moment)' };

export function Gaps({ ctx, tid }) {
  const lang = getLang(), [weeks, setWeeks] = useState(4), me = myId();
  const R = gapReport(ctx, tid), cname = (id) => (ctx.cls(id) || {}).name || id;
  const byWeek = [];
  for (const m of R.missing) { const w = mondayOf(m.iso); let g = byWeek[byWeek.length - 1]; if (!g || g.w !== w) { g = { w, list: [] }; byWeek.push(g); } g.list.push(m); }
  return html`<div class="stack">
    <p class="sub">${tid && tid === me ? t('Voici, depuis la rentrée, les cours de votre emploi du temps que vous n’avez pas saisis, et les saisies qui semblent erronées.') : t('Voici, depuis la rentrée, les cours prévus à l’emploi du temps qui n’ont pas été saisis, et les saisies qui semblent erronées. Pour chaque cours : « Présent » (il a eu lieu), « Absent », ou « Détails » (retard, nombre de leçons).')}</p>
    ${R.noTT.length ? html`<a class="notice" href=${tid ? '#/settings/team/' + tid : '#/settings/team'}><${Icon} n="alert" size="18" /><span>${t('Sans emploi du temps (donc rien à comparer) : {n}.', { n: R.noTT.map(x => x.short || x.name).join(', ') })}</span></a>` : null}
    <div class="row" style="flex-wrap:wrap"><${Chip} tone=${R.missing.length ? 'bad' : 'ok'}>${R.missing.length} ${t('cours non saisis')} · ${num1(R.hours)} h<//><${Chip} tone=${R.flagged.length ? 'warn' : 'ok'}>${R.flagged.length} ${t('saisie(s) à vérifier')}<//></div>
    ${R.flagged.length ? html`<div class="card"><div class="card-h"><h3>${t('À vérifier')}</h3></div><div class="list">${R.flagged.map(({ e, kinds }) => html`<div class="item"><div class="dot warn">⚠</div><div class="grow"><b>${cname(e.classId)}${e.n != null ? ' · ' + t('leçon') + ' ' + e.n : ''}</b>
      <span>${fmt(e.date, lang, { weekday: true, short: true, noYear: true })}${e.start ? ' · ' + e.start + '–' + e.end : ''}${!tid && ctx.teacher(e.teacherId) ? ' · ' + ctx.teacher(e.teacherId).short : ''} — ${kinds.map(k => t(WHY[k])).join(' ; ')}</span></div>
      <button class="icon-btn" aria-label=${t('Modifier')} onClick=${() => openEdit(ctx, e)}><${Icon} n="edit" /></button><button class="icon-btn" aria-label=${t('Supprimer')} onClick=${() => askDelete(e)}><${Icon} n="trash" /></button></div>`)}</div></div>` : null}
    ${!R.missing.length && !R.noTT.length ? html`<div class="card"><${Empty} icon="🎉" title=${t('Rien ne manque')} text=${t('Tous les cours prévus depuis la rentrée sont saisis ou excusés.')} /></div>` : null}
    ${byWeek.slice(0, weeks).map(g => html`<div class="card"><div class="card-h"><h3>${t('Semaine du {a} au {b}', { a: fmt(g.w, lang, { noYear: true }), b: fmt(addDays(g.w, 5), lang) })}</h3><${Chip} tone="bad">${g.list.length}<//></div>
      <div class="list">${g.list.map(m => html`<div class="wk"><div class="wk-main"><div class="dot">📖</div><div class="grow"><b>${cname(m.row.c)}</b>
        <span class="cap">${fmt(m.iso, lang, { weekday: true, short: true, noYear: true })}${m.row.st ? ' · ' + m.row.st + ' → ' + m.row.en : ''} · ${m.row.h} h${!tid ? ' · ' + (ctx.teacher(m.tid) || {}).short : ''}</span></div></div>
        ${m.tid === me || state.session.role === 'ap' ? html`<div class="wk-act"><button class="btn sm" onClick=${() => record(ctx, m.tid, m.iso, m.row)}><${Icon} n="check" />${t('Présent')}</button><button class="btn soft sm" onClick=${() => absent(ctx, m.tid, m.iso, m.row)}>${t('Absent')}</button><button class="btn ghost sm" onClick=${() => openRound(ctx, m.tid, m.iso, m.row)}>${t('Détails…')}</button></div>` : null}</div>`)}</div></div>`)}
    ${byWeek.length > weeks ? html`<button class="btn soft" onClick=${() => setWeeks(weeks + 6)}>${t('Afficher les semaines plus anciennes')} (${byWeek.length - weeks})</button>` : null}</div>`;
}
