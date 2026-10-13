import { html } from './vendor/preact-htm.js';
import { t } from './i18n.js';
import { fmt } from './dates.js';
import { getLang } from './i18n.js';

/** Barres par semaine/mois : heures dues (contour) et heures faites (plein). */
export function BarChart({ data, unit = 'week' }) {
  if (!data.length) return null;
  const W = 640, H = 200, L = 34, B = 26, T = 10, R = 8;
  const max = Math.max(4, ...data.map(d => Math.max(d.due, d.done)));
  const top = Math.ceil(max / 4) * 4, bw = (W - L - R) / data.length, y = (v) => T + (H - T - B) * (1 - v / top);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(top * f));
  const lang = getLang();
  const label = (d) => (unit === 'month' ? fmt(d.key + '-01', lang, { noYear: true }).replace(/^\d+(er)? /, '').slice(0, 4) : fmt(d.ps, lang, { noYear: true }).replace(/ (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/, '/' ).slice(0, 8));
  return html`<svg class="chart" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${t('Heures dues et heures faites par période')}>
    ${ticks.map(v => html`<g><line x1=${L} x2=${W - R} y1=${y(v)} y2=${y(v)} stroke="var(--line)" stroke-width="1" stroke-dasharray=${v ? '3 4' : ''} /><text x=${L - 6} y=${y(v) + 4} text-anchor="end">${v}</text></g>`)}
    ${data.map((d, i) => { const x = L + i * bw + bw * 0.14, w = bw * 0.72, hd = y(0) - y(d.due), hh = y(0) - y(d.done);
      return html`<g>
        <rect x=${x} y=${y(d.due)} width=${w} height=${Math.max(0, hd)} rx="5" fill=${d.future ? 'none' : 'var(--sand)'} stroke="var(--line)" stroke-width="1.5" stroke-dasharray=${d.future ? '4 3' : ''} />
        <rect x=${x + w * 0.18} y=${y(d.done)} width=${w * 0.64} height=${Math.max(0, hh)} rx="4" fill=${d.done >= d.due * 0.8 || !d.due ? 'var(--teal)' : 'var(--coral)'} />
        <text x=${x + w / 2} y=${H - 8} text-anchor="middle">${label(d)}</text></g>`; })}
  </svg>`;
}
