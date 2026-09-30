import { monthDiff, monthNumber, MONTH_NAMES } from './budget-math';
import { Recurrence } from './types';

/** Does the recurrence produce a line in `monthKey` (YYYY-MM)? */
export function recurrenceMatches(rec: Recurrence, monthKey: string): boolean {
  if (rec.kind === 'once') return rec.month === monthKey;

  if (rec.startMonth && monthKey < rec.startMonth) return false;
  if (rec.endMonth && monthKey > rec.endMonth) return false;

  const m = monthNumber(monthKey);
  switch (rec.kind) {
    case 'monthly':
      return true;
    case 'everyNMonths': {
      const n = Math.max(1, Math.floor(rec.n || 1));
      const diff = monthDiff(rec.startMonth, monthKey);
      return diff >= 0 && diff % n === 0;
    }
    case 'months':
      return (rec.months || []).includes(m);
    case 'yearly':
      return rec.month === m;
    default:
      return false;
  }
}

/** "Every month" style items are shown in "Reviennent chaque mois". */
export function isMonthly(rec: Recurrence): boolean {
  return rec.kind === 'monthly';
}

export type RecurrenceChoice = 'once' | 'monthly' | 'months' | 'yearly';

/** The segmented choice shown in the line sheet. */
export function recurrenceChoice(rec: Recurrence | undefined): RecurrenceChoice {
  if (!rec || rec.kind === 'once') return 'once';
  if (rec.kind === 'monthly') return 'monthly';
  if (rec.kind === 'yearly') return 'yearly';
  return 'months'; // 'months' and 'everyNMonths' both show as "Certains mois"
}

export function describeRecurrence(rec: Recurrence | undefined): string {
  if (!rec || rec.kind === 'once') return 'Ce mois seulement';
  switch (rec.kind) {
    case 'monthly':
      return 'Chaque mois';
    case 'yearly':
      return `Chaque année en ${MONTH_NAMES[rec.month - 1] || '?'}`;
    case 'months': {
      const names = [...rec.months].sort((a, b) => a - b).map((m) => MONTH_NAMES[m - 1]);
      return names.length ? `En ${names.join(', ')}` : 'Certains mois';
    }
    case 'everyNMonths':
      return `Tous les ${rec.n} mois`;
  }
}

export function sameRecurrence(a: Recurrence | undefined, b: Recurrence | undefined): boolean {
  return JSON.stringify(a || null) === JSON.stringify(b || null);
}
