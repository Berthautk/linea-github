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

/** Objectif cumulé (contour) et réalisé cumulé (plein), semaine par semaine : les barres des semaines passées restent jusqu'en fin d'année. */
export function ProgressChart({ rows, mode = 'L', unit = '' }) {
  if (!rows.length) return null;
  const goal = (r) => (mode === 'L' ? r.goalL : r.goalH), done = (r) => (mode === 'L' ? r.doneL : r.doneH);
  const W = 640, H = 220, L = 38, B = 28, T = 12, R = 8, n = rows.length, bw = (W - L - R) / n;
  const max = Math.max(4, ...rows.map(r => Math.max(goal(r), done(r) || 0))), step = max > 200 ? 50 : max > 80 ? 20 : max > 40 ? 10 : 4, top = Math.ceil(max / step) * step;
  const y = (v) => T + (H - T - B) * (1 - v / top), ticks = []; for (let v = 0; v <= top; v += step) ticks.push(v);
  const every = n > 28 ? 4 : n > 14 ? 2 : 1, cur = rows.findIndex(r => !r.future && (rows[rows.indexOf(r) + 1] || { future: true }).future);
  return html`<svg class="chart" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${t('Objectif et réalisé cumulés, semaine par semaine')}>
    ${ticks.map(v => html`<g><line x1=${L} x2=${W - R} y1=${y(v)} y2=${y(v)} stroke="var(--line)" stroke-width="1" stroke-dasharray=${v ? '3 4' : ''} /><text x=${L - 6} y=${y(v) + 4} text-anchor="end">${v}</text></g>`)}
    ${rows.map((r, i) => { const x = L + i * bw + bw * 0.12, w = bw * 0.76, g = goal(r), d = done(r), hd = y(0) - y(g), hh = d == null ? 0 : y(0) - y(d), ok = d != null && (d >= g * 0.9 || !g), mid = d != null && d >= g * 0.7;
      return html`<g><rect x=${x} y=${y(g)} width=${w} height=${Math.max(0, hd)} rx="3" fill=${r.future ? 'none' : 'var(--sand)'} stroke="var(--line)" stroke-width="1.2" stroke-dasharray=${r.future ? '3 3' : ''} />
        ${d != null ? html`<rect x=${x + w * 0.2} y=${y(d)} width=${w * 0.6} height=${Math.max(0, hh)} rx="3" fill=${ok ? 'var(--teal)' : mid ? 'var(--apricot)' : 'var(--coral)'} />` : null}
        ${i % every === 0 || i === n - 1 ? html`<text x=${x + w / 2} y=${H - 10} text-anchor="middle" font-size="10">${r.k}</text>` : null}</g>`; })}
    ${cur >= 0 ? html`<g><line x1=${L + cur * bw + bw / 2} x2=${L + cur * bw + bw / 2} y1=${T} y2=${H - B} stroke="var(--ink)" stroke-width="1" stroke-dasharray="2 3" opacity=".5" /><text x=${L + cur * bw + bw / 2} y=${T + 8} text-anchor=${cur > n / 2 ? 'end' : 'start'} font-size="10" dx=${cur > n / 2 ? -4 : 4} fill="var(--ink)">${t('aujourd’hui')}</text></g>` : null}
  </svg>`;
}

/** Objectif et réalisé à la fin de chaque trimestre. */
export function TermChart({ rows, mode = 'L' }) {
  if (!rows.length) return null;
  const goal = (r) => (mode === 'L' ? r.goalL : r.goalH), done = (r) => (mode === 'L' ? r.doneL : r.doneH);
  const W = 640, H = 190, L = 38, B = 28, T = 16, R = 8, n = rows.length, gw = (W - L - R) / n, max = Math.max(4, ...rows.map(r => Math.max(goal(r), done(r) || 0))), top = Math.ceil(max / 4) * 4;
  const y = (v) => T + (H - T - B) * (1 - v / top);
  return html`<svg class="chart" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${t('Objectif et réalisé par trimestre')}>
    <line x1=${L} x2=${W - R} y1=${y(0)} y2=${y(0)} stroke="var(--line)" />
    ${rows.map((r, i) => { const x0 = L + i * gw + gw * 0.18, w = gw * 0.28, g = goal(r), d = done(r), ok = d != null && (d >= g * 0.9 || !g);
      return html`<g><rect x=${x0} y=${y(g)} width=${w} height=${Math.max(0, y(0) - y(g))} rx="4" fill=${r.future ? 'none' : 'var(--sand)'} stroke="var(--line)" stroke-width="1.5" stroke-dasharray=${r.future ? '4 3' : ''} /><text x=${x0 + w / 2} y=${y(g) - 4} text-anchor="middle" font-size="11">${Math.round(g)}</text>
        ${d != null ? html`<rect x=${x0 + w + 6} y=${y(d)} width=${w} height=${Math.max(0, y(0) - y(d))} rx="4" fill=${ok ? 'var(--teal)' : d >= g * 0.7 ? 'var(--apricot)' : 'var(--coral)'} /><text x=${x0 + w + 6 + w / 2} y=${y(d) - 4} text-anchor="middle" font-size="11" font-weight="700">${Math.round(d)}</text>` : null}
        <text x=${x0 + w + 3} y=${H - 8} text-anchor="middle">${r.id}</text></g>`; })}
  </svg>`;
}
