// Texte du rappel (sans interface, donc testable) : depuis combien de temps le collègue n'a rien saisi, et quels cours manquent.
import { stats, todaySlots } from './calc.js';
import { addDays, diffDays, dow, fmt, dayName } from './dates.js';
const num1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

const first = (n) => (n || '').replace(/^(Mr?\.?|Mme|Mlle|M\.)\s+/i, '').split(' ').filter(Boolean)[0] || '';
const surname = (tc) => tc.short ? tc.short.charAt(0) + tc.short.slice(1).toLowerCase() : first(tc.name);

/** Cours prévus, passés, ni saisis ni excusés : ceux que le collègue a oubliés (14 derniers jours). */
export function missedSlots(ctx, tc, days = 14) {
  const out = [];
  for (let k = days; k >= 1; k--) {
    const iso = addDays(ctx.today, -k); if (iso < ctx.ys || dow(iso) === 0) continue;
    const td = todaySlots(ctx, tc.id, iso); if (!td.teaching || td.reason) continue;
    const rows = td.rows.filter(r => !r.done && !r.absent); if (rows.length) out.push({ iso, rows });
  }
  return out;
}

/** Combien de temps sans saisie, et quel niveau de fermeté (1 : rappel amical, 2 : rien depuis plusieurs jours, 3 : plus d'une semaine). */
export function silence(ctx, tc) {
  const last = (ctx.byTeacher[tc.id] || []).filter(e => e.type !== 'absence' && e.date <= ctx.today).map(e => e.date).sort().pop() || '';
  const days = last ? diffDays(last, ctx.today) : null;
  return { last, days, level: days == null || days >= 14 ? 3 : days >= 4 ? 2 : 1 };
}

export function reminderText(ctx, tc, lang) {
  const en = lang === 'en', { days, level } = silence(ctx, tc), S = stats(ctx, tc.id, ctx.ys, ctx.today), miss = Math.max(0, S.due - S.hours);
  const weeks = days == null ? 0 : Math.floor(days / 7);
  const ago = days == null ? (en ? 'the start of the year' : 'le début de l’année')
    : days < 7 ? (en ? `${days} day${days > 1 ? 's' : ''}` : `${days} jour${days > 1 ? 's' : ''}`)
      : (en ? `${weeks} week${weeks > 1 ? 's' : ''}` : `${weeks} semaine${weeks > 1 ? 's' : ''}`);
  const lines = missedSlots(ctx, tc).slice(-6).map(m => `• ${dayName(dow(m.iso), lang, true)} ${fmt(m.iso, lang, { noYear: true })} : ${m.rows.map(r => (ctx.cls(r.c) || {}).name || r.c).join(', ')}`);
  const list = lines.length ? (en ? '\nLessons not recorded:\n' : '\nCours non enregistrés :\n') + lines.join('\n') + '\n' : '';
  const hours = miss >= 1 ? (en ? ` About ${num1(miss)} h are missing compared with your timetable.` : ` Il manque environ ${num1(miss)} h par rapport à votre emploi du temps.`) : '';
  const hi = (en ? 'Hello ' : 'Bonjour ') + surname(tc) + ',', link = '\n' + (typeof location !== 'undefined' ? location.origin : '');
  if (level === 1) return en ? `${hi} a quick reminder: please record today’s lessons in Rekort. Thank you!${list}${link}` : `${hi} petit rappel : merci d’enregistrer vos cours du jour sur Rekort. Merci !${list}${link}`;
  if (level === 2) return en ? `${hi} nothing has been recorded in Rekort for ${ago}.${hours}${list}Please enter your lessons this week.${link}` : `${hi} rien n’est enregistré dans Rekort depuis ${ago}.${hours}${list}Merci de saisir vos cours cette semaine.${link}`;
  const intro = days == null ? (en ? 'I still see no lesson recorded in Rekort since the start of the year.' : 'je ne vois encore aucun cours enregistré dans Rekort depuis le début de l’année.') : null;
  return en ? `${hi} ${intro || `it has been ${ago} since your lessons were last recorded in Rekort.`}${hours} The follow-up sheets for the vice-principal’s office and the inspection are built from your entries: please catch up today.${list}${link}`
    : `${hi} ${intro || `voilà ${ago} que vos cours ne sont plus enregistrés dans Rekort.`}${hours} Les fiches de suivi (censorat, inspection) sont calculées à partir de vos saisies : merci de régulariser dès aujourd’hui.${list}${link}`;
}

