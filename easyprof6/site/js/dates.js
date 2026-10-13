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
  const base = lang === 'en' ? `${mn} ${d}, ${y}` : `${d === 1 ? '1er' : d} ${mn} ${y}`;
  if (opts.noYear) return lang === 'en' ? `${mn} ${d}` : `${d === 1 ? '1er' : d} ${mn}`;
  if (opts.weekday) return dayName(dow(iso), lang, opts.short) + ' ' + base;
  return base;
}
export const timeToMin = (t) => { const [h, m] = String(t || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN; };
export const minToTime = (n) => pad(Math.floor(n / 60) % 24) + ':' + pad(n % 60);
export function minutesBetween(a, b) { const x = timeToMin(a), y = timeToMin(b); if (isNaN(x) || isNaN(y)) return 0; const d = y - x; return d <= 0 ? 0 : d; }
