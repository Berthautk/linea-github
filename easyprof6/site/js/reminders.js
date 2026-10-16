// Rappels dans le téléphone : un web ne peut pas régler le réveil, mais il peut ajouter au calendrier du téléphone
// un rendez-vous chaque jour de cours (le soir), avec alarme : « Rekort : cochez vos cours du jour ».
import { html, useState } from './vendor/preact-htm.js';
import { t } from './i18n.js';
import { Icon } from './icons.js';
import { confirmDialog } from './ui.js';
import { dayName } from './dates.js';

const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const pad = (n) => String(n).padStart(2, '0');
const compact = (iso) => iso.replace(/-/g, '');
/** Prochaine date (à partir d'aujourd'hui) qui tombe le jour de semaine d (1 = lundi … 6 = samedi). */
function nextDow(today, d) { const x = new Date(today + 'T12:00:00Z'); for (let k = 0; k < 7; k++) { if (x.getUTCDay() === d % 7) break; x.setUTCDate(x.getUTCDate() + 1); } return x.toISOString().slice(0, 10); }

/** Jours de cours de l'enseignant, avec les classes de chaque jour. */
export function teachingDays(ctx, tid) {
  const tc = ctx.teacher(tid), m = new Map();
  for (const s of (tc && tc.slots) || []) if (+s.h > 0) { const k = +s.d; if (!m.has(k)) m.set(k, new Set()); m.get(k).add((ctx.cls(s.c) || {}).name || s.c); }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([d, cls]) => ({ d, classes: [...cls] }));
}
/** Fichier calendrier (.ics) : un rendez-vous chaque jour de cours, à l'heure choisie, avec alarme, jusqu'à la fin de l'année scolaire. */
export function remindersIcs(ctx, tid, hour = '18:00', origin = '') {
  const days = teachingDays(ctx, tid), until = compact(ctx.ye) + 'T235959Z', [hh, mm] = hour.split(':');
  const ev = days.map(({ d, classes }) => ['BEGIN:VEVENT', 'UID:rekort-' + tid + '-' + d + '@rekort', 'DTSTAMP:' + compact(ctx.today) + 'T000000Z',
    'DTSTART:' + compact(nextDow(ctx.today, d)) + 'T' + pad(hh) + pad(mm) + '00', 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY;BYDAY=' + BY[d % 7] + ';UNTIL=' + until,
    'SUMMARY:Rekort : cochez vos cours du jour', 'DESCRIPTION:' + classes.join(', ') + (origin ? ' — ' + origin : ''), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Rekort : cochez vos cours', 'TRIGGER:PT0S', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rekort//FR', ...ev, 'END:VCALENDAR'].join('\r\n');
}
/** Lien Google Agenda pour un jour de cours (s'ouvre dans l'application Agenda du téléphone). */
export function googleLink(ctx, tid, d, classes, hour = '18:00') {
  const day = compact(nextDow(ctx.today, d)), [hh, mm] = hour.split(':'), start = day + 'T' + pad(hh) + pad(mm) + '00', end = day + 'T' + pad(hh) + pad(+mm + 10) + '00';
  const q = new URLSearchParams({ action: 'TEMPLATE', text: 'Rekort : cochez vos cours du jour', details: classes.join(', ') + ' — ' + location.origin, dates: start + '/' + end, recur: 'RRULE:FREQ=WEEKLY;BYDAY=' + BY[d % 7] + ';UNTIL=' + compact(ctx.ye) });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

/** Carte « Rappels dans mon téléphone » : choisir l'heure, puis ajouter les rappels au calendrier (avec alarme). */
export function ReminderSetup({ ctx, tid, onDone }) {
  const [hour, setHour] = useState('18:00'), days = teachingDays(ctx, tid);
  if (!days.length) return html`<p class="sub">${t('Votre emploi du temps n’est pas encore renseigné : les rappels se règlent d’après vos jours de cours.')}</p>`;
  const file = () => confirmDialog({ title: t('Ajouter les rappels au calendrier ?'), message: t('Un rappel avec alarme sera ajouté à votre calendrier chaque jour de cours ({d}) à {h}, jusqu’à la fin de l’année. Vous pourrez le supprimer dans le calendrier.', { d: days.map(x => dayName(x.d % 7)).join(', '), h: hour }), confirm: t('Ajouter'),
    onConfirm: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([remindersIcs(ctx, tid, hour, location.origin)], { type: 'text/calendar' })); a.download = 'rekort-rappels.ics'; document.body.appendChild(a); a.click(); a.remove(); onDone && onDone(); } });
  return html`<div class="stack" style="gap:10px">
    <p class="sub">${t('Le téléphone vous rappelle, le soir de chaque jour de cours, de cocher vos cours dans Rekort. Le rappel sonne comme une alarme de calendrier.')}</p>
    <label class="field"><span>${t('Heure du rappel')}</span><input class="input" type="time" value=${hour} onInput=${(e) => setHour(e.target.value || '18:00')} /></label>
    <button class="btn accent block" onClick=${file}><${Icon} n="calendar" />${t('Ajouter à mon calendrier (tous les jours de cours)')}</button>
    <details><summary class="sub">${t('Avec Google Agenda : un rappel par jour de cours')}</summary><div class="stack" style="gap:6px;margin-top:8px">${days.map(x => html`<a class="btn soft" href=${googleLink(ctx, tid, x.d, x.classes, hour)} target="_blank" rel="noopener">${dayName(x.d % 7)} · ${x.classes.join(', ')}</a>`)}</div></details></div>`;
}
