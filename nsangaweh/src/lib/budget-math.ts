import { Category, Entry, EntryType, MonthDoc, MonthLine, Wallet } from './types';

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'wallet-cash',
    name: 'Espèces',
    type: 'cash',
    color: '#12A150',
    icon: 'Banknote',
    initialBalance: 0,
  },
  {
    id: 'wallet-momo',
    name: 'MTN MoMo',
    type: 'momo',
    color: '#F5B700',
    icon: 'Smartphone',
    initialBalance: 0,
  },
  {
    id: 'wallet-om',
    name: 'Orange Money',
    type: 'om',
    color: '#EA580C',
    icon: 'Smartphone',
    initialBalance: 0,
  },
  {
    id: 'wallet-bank',
    name: 'Banque',
    type: 'bank',
    color: '#2563EB',
    icon: 'Building2',
    initialBalance: 0,
  },
];

/**
 * Format integer FCFA into readable French format with narrow non-breaking space
 */
export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
}

/**
 * Signed format for balance
 */
export function fmtS(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '+0';
  const val = Math.round(n);
  const formatted = fmt(Math.abs(val));
  return val > 0 ? `+${formatted}` : val < 0 ? `−${formatted}` : `0`;
}

/**
 * Compact formatting for charts
 */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${Math.round(n / 1_000)}k`;
  }
  return String(Math.round(n));
}

/**
 * Strip accents and lowercase
 */
export function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parse FCFA amount strings like "5000", "5k", "5 000 F", "1.5M"
 */
export function parseAmount(str: string): number | null {
  if (!str) return null;
  const clean = str.trim().toLowerCase();
  const kMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s*k$/);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }
  const mMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s*m$/);
  if (mMatch) {
    const num = parseFloat(mMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }
  const digitsOnly = clean.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  const val = parseInt(digitsOnly, 10);
  return isNaN(val) ? null : val;
}

/**
 * Generate 10-char random code without ambiguous characters
 */
export function generateHouseholdCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonthKey(): string {
  return todayStr().slice(0, 7);
}

export function addMonth(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split('-');
  let y = parseInt(yStr, 10);
  let m = parseInt(mStr, 10) + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] || m} ${y}`;
}

export function monthName(monthKey: string): string {
  const parts = monthLabel(monthKey).split(' ');
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + parts[1];
}

export function shortMonth(monthKey: string): string {
  const m = parseInt(monthKey.split('-')[1], 10);
  const names = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];
  return names[m - 1] || monthKey;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10));
  return new Date(y, m, 0).getDate();
}

/**
 * Return month key taking custom start day (1 to 28) into account
 */
export function getBudgetMonthForDate(dateStr: string, monthStartDay: number = 1): string {
  if (monthStartDay <= 1) return dateStr.slice(0, 7);
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  if (d >= monthStartDay) {
    // Current calendar month or next?
    // If start day is e.g. 25, then Sept 25 belongs to October cycle
    return addMonth(`${y}-${m < 10 ? '0' : ''}${m}`, 1);
  }
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

/** Number of months from `from` to `to` (both YYYY-MM). */
export function monthDiff(from: string, to: string): number {
  const [fy, fm] = from.split('-').map((v) => parseInt(v, 10));
  const [ty, tm] = to.split('-').map((v) => parseInt(v, 10));
  return (ty - fy) * 12 + (tm - fm);
}

export function monthNumber(monthKey: string): number {
  return parseInt(monthKey.slice(5, 7), 10);
}

export const MONTH_NAMES = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** "d'octobre" / "de septembre" for "Créer le plan d'octobre". */
export function deMonth(monthKey: string): string {
  const name = MONTH_NAMES[monthNumber(monthKey) - 1] || monthKey;
  return /^[aeiouyéèêàâîïôûh]/i.test(name) ? `d’${name}` : `de ${name}`;
}

export interface QuickParse {
  type: 'in' | 'out' | 'save';
  amt: number | null;
  label: string;
  line: MonthLine | null;
}

/**
 * Quick smart 1-line text entry parser.
 * Examples: "5000 beurre", "+150000 salaire", "5k pousse".
 * Matches against the month's own lines; the entry type follows the rubric kind.
 */
export function parseQuick(
  text: string,
  month?: Pick<MonthDoc, 'lines'>,
  categories: Category[] = []
): QuickParse {
  const raw = text.trim();
  if (!raw) return { type: 'out', amt: null, label: '', line: null };

  let type: 'in' | 'out' | 'save' = 'out';
  let explicit = false;
  let working = raw;
  if (working.startsWith('+')) {
    type = 'in';
    explicit = true;
    working = working.slice(1).trim();
  } else if (working.startsWith('-')) {
    explicit = true;
    working = working.slice(1).trim();
  }

  const tokens = working.split(/\s+/);
  let amt = parseAmount(tokens[0]);
  let labelPart = '';
  if (amt !== null) {
    labelPart = tokens.slice(1).join(' ');
  } else {
    const last = tokens[tokens.length - 1] || '';
    amt = parseAmount(last);
    labelPart = amt !== null ? tokens.slice(0, -1).join(' ') : working;
  }

  const nLabel = norm(labelPart);
  const line = matchLine(labelPart, month?.lines || [], categories);
  if (line) {
    const kind = categories.find((c) => c.id === line.categoryId)?.kind;
    if (kind) type = kind;
  } else if (!explicit) {
    const incomeKeywords = ['salaire', 'revenu', 'vente', 'paie', 'prime', 'bourse', 'honoraires'];
    const saveKeywords = ['epargne', 'economie', 'reserve'];
    if (incomeKeywords.some((k) => nLabel.includes(k))) type = 'in';
    if (saveKeywords.some((k) => nLabel.includes(k))) type = 'save';
  }

  return { type, amt, label: line ? line.label : labelPart.trim(), line };
}

/** Best-scoring month line for a free label (exact > contains > shared words). */
export function matchLine(
  label: string,
  lines: MonthLine[],
  categories: Category[] = []
): MonthLine | null {
  const nLabel = norm(label).trim();
  if (!nLabel) return null;
  const archivedCats = new Set(categories.filter((c) => c.archived).map((c) => c.id));
  const words = nLabel.split(/\s+/).filter((w) => w.length >= 3);
  let best: MonthLine | null = null;
  let bestScore = 0;
  lines.forEach((l) => {
    if (l.archived || archivedCats.has(l.categoryId)) return;
    const n = norm(l.label);
    let score = 0;
    if (n === nLabel) score = 100;
    else if (n.includes(nLabel) || nLabel.includes(n)) score = 70;
    else words.forEach((w) => n.includes(w) && (score += 30));
    if (score > bestScore && score >= 30) {
      bestScore = score;
      best = l;
    }
  });
  return best;
}

/** End-of-month forecast from the spending pace. */
export function computeForecast(
  calc: { inc: number; out: number },
  currentMonth: string
): { forecastBalance: number; dailyPace: number; daysPassed: number; daysLeft: number } {
  const totalDays = daysInMonth(currentMonth);
  const isCurrentMonth = currentMonth === todayStr().slice(0, 7);
  const currentDay = isCurrentMonth ? Math.min(new Date().getDate(), totalDays) : totalDays;
  const daysPassed = Math.max(1, currentDay);
  const daysLeft = Math.max(0, totalDays - currentDay);
  const dailyPace = calc.out / daysPassed;
  const forecastBalance = calc.inc - (calc.out + dailyPace * daysLeft);
  return {
    forecastBalance: Math.round(forecastBalance),
    dailyPace: Math.round(dailyPace),
    daysPassed,
    daysLeft,
  };
}

export interface MonthInsightData {
  monthKey: string;
  inc: number;
  out: number;
  pOut: number;
  /** Spending per rubric display name. */
  byRubric: Record<string, number>;
}

export function getInsights(dataList: MonthInsightData[]): string[] {
  if (!dataList || dataList.length === 0) {
    return ['Commencez à noter vos opérations pour voir vos tendances financières.'];
  }
  const insights: string[] = [];
  const latest = dataList[dataList.length - 1];

  if (latest.inc > 0) {
    const rate = Math.round(((latest.inc - latest.out) / latest.inc) * 100);
    if (rate >= 20) insights.push(`Vous conservez <b>${rate}%</b> de vos revenus.`);
    else if (rate > 0) insights.push(`<b>${rate}%</b> de vos revenus ne sont pas dépensés.`);
    else insights.push('Vos dépenses dépassent vos revenus reçus ce mois-ci.');
  }

  if (dataList.length >= 2) {
    const prev = dataList[dataList.length - 2];
    if (prev.out > 0) {
      const diff = Math.round(((latest.out - prev.out) / prev.out) * 100);
      if (diff > 0) insights.push(`Dépenses en hausse de <b>${diff}%</b> par rapport au mois précédent.`);
      else if (diff < 0) insights.push(`Dépenses en baisse de <b>${-diff}%</b> par rapport au mois précédent.`);
    }
  }

  const top = Object.entries(latest.byRubric).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] > 0) {
    insights.push(`Poste principal : <b>${escapeHtml(top[0])}</b> (${fmt(top[1])} F).`);
  }

  if (latest.pOut > 0) {
    const execRate = Math.round((latest.out / latest.pOut) * 100);
    insights.push(`Vous avez dépensé <b>${execRate}%</b> du montant prévu.`);
  }

  return insights.length > 0 ? insights : ['Vos données sont prêtes pour l’analyse.'];
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Default label when the user did not type one. */
export function defaultEntryLabel(t: EntryType): string {
  return t === 'in' ? 'Revenu' : t === 'save' ? 'Épargne' : t === 'transfer' ? 'Virement' : 'Dépense';
}

export type { Entry };
