// « Ma semaine » : pour chaque cours de l'emploi du temps, une case cochée (saisi) ou un manque (à saisir), et les doublons probables.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Chip, num1 } from '../ui.js';
import { todaySlots, duplicates } from '../calc.js';
import { addDays, mondayOf, fmt } from '../dates.js';
import { reasonOf } from '../consts.js';

export function MyWeek({ ctx, tid, onFill }) {
  const lang = getLang(), tc = ctx.teacher(tid);
  const [mon, setMon] = useState(mondayOf(ctx.today)), days = [0, 1, 2, 3, 4, 5].map(k => addDays(mon, k));
  const cname = (id) => (ctx.cls(id) || {}).name || id;
  if (!tc || !(tc.slots || []).length) return html`<div class="card"><div class="card-h"><h3>${t('Ma semaine')}</h3></div><p class="sub">${t('Votre emploi du temps n’est pas encore renseigné : demandez à votre animateur pédagogique de l’ajouter. En attendant, saisissez vos cours ci-dessous.')}</p></div>`;
  let due = 0, done = 0, dups = 0;
  const blocks = days.map(iso => {
    const td = todaySlots(ctx, tid, iso), past = iso <= ctx.today;
    if (!td.rows.length && !td.reason) return null;
    const rows = td.rows.map(r => {
      const es = td.entries.filter(e => e.classId === r.c), dup = es.length > 1 && es.some((e, i) => es.some((o, j) => j > i && duplicates({ byTeacher: { [tid]: [e] } }, tid, o).length));
      if (past && !td.reason) { due++; if (r.done) done++; }
      if (dup) dups++;
      return { ...r, es, dup, hrs: es.reduce((s, e) => s + (+e.minutes || 0), 0) / 60 };
    });
    return html`<div class="myw-day"><div class="myw-h cap">${fmt(iso, lang, { weekday: true, noYear: true })}${td.reason ? html` <${Chip} tone="warn">${reasonOf(td.reason).icon} ${t(reasonOf(td.reason).fr)}<//>` : null}</div>
      ${rows.map(r => html`<div class=${'myw ' + (r.done ? 'ok' : r.absent ? 'abs' : past && !td.reason ? 'miss' : '')}><span class="tick">${r.done ? '✓' : r.absent ? '✗' : past && !td.reason ? '!' : '·'}</span>
        <div class="grow"><b>${cname(r.c)}</b><span>${r.st ? r.st + ' → ' + r.en + ' · ' : ''}${r.h} h${r.done ? ' · ' + t('saisi') + ' (' + num1(r.hrs) + ' h' + (r.es.some(e => e.n != null) ? ', ' + t('leçon') + ' ' + r.es.map(e => e.n).filter(n => n != null).join(', ') : '') + ')' : ''}</span>${r.dup ? html`<span class="warn-t">⚠ ${t('saisi deux fois : doublon probable ?')}</span>` : null}</div>
        ${!r.done && !r.absent && past && !td.reason && onFill ? html`<button class="btn sm" onClick=${() => onFill(r, iso)}>${t('Saisir')}</button>` : null}</div>`)}</div>`;
  });
  return html`<div class="card"><div class="card-h"><h3>${t('Ma semaine')}</h3><${Chip} tone=${due && done < due ? 'warn' : 'ok'}>${done} / ${due} ${t('cours saisis')}<//></div>
    <div class="row" style="flex-wrap:nowrap;margin-bottom:6px"><button class="icon-btn" onClick=${() => setMon(addDays(mon, -7))} aria-label=${t('Précédent')}><${Icon} n="left" /></button>
      <b class="grow" style="text-align:center;font-size:14px">${t('Semaine du {a} au {b}', { a: fmt(mon, lang, { noYear: true }), b: fmt(addDays(mon, 5), lang) })}</b>
      <button class="icon-btn" onClick=${() => setMon(addDays(mon, 7))} aria-label=${t('Suivant')}><${Icon} n="right" /></button></div>
    ${dups ? html`<div class="notice"><${Icon} n="alert" size="18" /><span>${t('Un même cours semble saisi deux fois. Vérifiez dans l’historique et supprimez le doublon.')}</span></div>` : null}
    ${blocks.filter(Boolean).length ? blocks : html`<p class="sub">${t('Aucun cours prévu cette semaine.')}</p>`}</div>`;
}
