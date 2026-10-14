// Outils de dates (tout en texte AAAA-MM-JJ, calculs en UTC pour éviter les décalages de fuseau).
const DAY = 864e5;
export const pad = (n) => (n < 10 ? '0' : '') + n;
export const toISO = (d) => d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
export const parse = (iso) => new Date(iso + 'T00:00:00Z');
export const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
export const addDays = (iso, n) => toISO(new Date(parse(iso).getTime() + n * DAY));
export const dow = (iso) => parse(iso).getUTCDay();                    // 0 = dimanche … 6 = samedi
export const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / DAY);  // b - a
export const minISO = (a, b) => (a < b ? a : b);
export const maxISO = (a, b) => (a > b ? a : b);
export function eachDay(ps, pe) {
  const out = []; if (!ps || !pe || pe < ps) return out;
  for (let d = ps, k = 0; d <= pe && k < 800; d = addDays(d, 1), k++) out.push(d);
  return out;
}
export const mondayOf = (iso) => addDays(iso, -((dow(iso) + 6) % 7));
export const monthStart = (iso) => iso.slice(0, 8) + '01';
export const monthEnd = (iso) => { const d = parse(monthStart(iso)); return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))); };
export const addMonths = (iso, n) => { const d = parse(monthStart(iso)); return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))); };

const MFR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DFR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const monthName = (m, lang) => (lang === 'en' ? MEN : MFR)[m];
export const dayName = (d, lang, short) => { const n = (lang === 'en' ? DEN : DFR)[d]; return short ? n.slice(0, 3) : n; };
export function fmt(iso, lang = 'fr', opts = {}) {
  if (!iso || iso.length < 10) return '…';
  const [y, m, d] = iso.split('-').map(Number);
  const mn = monthName(m - 1, lang);
  const day = d === 1 && lang !== 'en' ? '1er' : d;
  const base = opts.noYear ? (lang === 'en' ? `${mn} ${d}` : `${day} ${mn}`) : (lang === 'en' ? `${mn} ${d}, ${y}` : `${day} ${mn} ${y}`);
  return opts.weekday ? dayName(dow(iso), lang, opts.short) + ' ' + base : base;
}
/** Une journée d'école n'a pas de cours entre 1 h et 5 h 59 du matin : « 01:20 » tapé sans « PM » veut dire 13:20. */
export const normTime = (v) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || '')); return m && +m[1] >= 1 && +m[1] <= 5 ? pad(+m[1] + 12) + ':' + m[2] : v; };
export const timeToMin = (t) => { const [h, m] = String(normTime(t) || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN; };
export const minToTime = (n) => pad(Math.floor(n / 60) % 24) + ':' + pad(n % 60);
export function minutesBetween(a, b) { const x = timeToMin(a), y = timeToMin(b); if (isNaN(x) || isNaN(y)) return 0; const d = y - x; return d <= 0 ? 0 : d; }

/* ---------- pauses de la journée : un cours qui chevauche une pause ne la compte pas dans sa durée ---------- */
export const DEFAULT_BREAKS = [{ f: '10:30', t: '10:45' }, { f: '12:45', t: '13:15' }];
const brk = (breaks) => (breaks || DEFAULT_BREAKS).map(b => [timeToMin(b.f), timeToMin(b.t)]).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
/** Durée en heures entre deux heures, pauses déduites (arrondie au quart d'heure). */
export function slotHours(st, en, breaks, period = 60) {
  const a = timeToMin(st), b = timeToMin(en); if (isNaN(a) || isNaN(b) || b <= a) return 0;
  let m = b - a; for (const [f, t] of brk(breaks)) m -= Math.max(0, Math.min(b, t) - Math.max(a, f));
  const q = period === 60 ? 4 : 2;   // 60 min : au quart d'heure ; périodes plus courtes : à la demi-période près
  return Math.max(0, Math.round(m / period * q) / q);
}
/** Heure de fin d'un cours qui commence à `st` et dure `h` heures de cours (pauses non comptées). */
export function endFor(st, h, breaks, period = 60) {
  let cur = timeToMin(st), left = Math.round((+h || 0) * period); if (isNaN(cur)) return '';
  for (const [f, t] of brk(breaks)) { if (cur >= t) continue; if (cur >= f) { cur = t; continue; } if (left <= f - cur) return minToTime(cur + left); left -= f - cur; cur = t; }
  return minToTime(cur + left);
}

/** Durée créditée (en minutes de cours) entre deux heures : pauses déduites, ramenée à l'heure de cours de l'établissement (`period` minutes, 60 par défaut). */
export function creditMinutes(st, en, breaks, period = 60) {
  const a = timeToMin(st), b = timeToMin(en); if (isNaN(a) || isNaN(b) || b <= a) return 0;
  let m = b - a; for (const [f, t] of brk(breaks)) m -= Math.max(0, Math.min(b, t) - Math.max(a, f));
  return Math.max(0, Math.round(Math.max(0, m) * 60 / (period || 60)));
}

/** Cours de la semaine remis en ordre : heures lues en 24 h, durée recalculée, et, pour des périodes de moins de 60 min, heure de fin ramenée sur la grille des périodes (7:30 + 2 périodes de 50 min = 9:10). */
export function fixSlot(s, breaks, period = 60) {
  if (!s || !s.st) return s;
  const st = normTime(s.st); let en = normTime(s.en) || endFor(st, s.h, breaks, period), h = slotHours(st, en, breaks, period);
  if (!(h > 0)) return s;
  if (period !== 60) en = endFor(st, h, breaks, period);
  return { ...s, st, en, h };
}
