/**
 * "Importer ma fiche": turns a pasted list such as
 *   "Loyer 50000 / Eau 5000 / Scolarité 120000 ponctuel"
 * into rubrics and lines. The result is always shown as an editable preview.
 */
import { addLine, ensureCategory, OpResult } from './budget-ops';
import { monthNumber, parseAmount } from './budget-math';
import { OTHER_RUBRIC_DEFAULT, PALETTE, SUGGESTED_RUBRICS } from './catalog';
import { CategoryKind, MemberBudget, Recurrence } from './types';
import { cleanName, MAX_AMOUNT, nameKey } from './validation';

export type ImportRecurrence = 'once' | 'monthly' | 'yearly';

export interface ImportRow {
  key: string;
  rubric: string;
  label: string;
  amount: number | null;
  recurrence: ImportRecurrence;
}

const ONCE_RE = /\b(ponctuel(?:le)?s?|ce mois(?: seulement| uniquement)?|une (?:seule )?fois|unique|exceptionnel(?:le)?)\b/i;
const YEARLY_RE = /\b(annuel(?:le)?s?|chaque ann[ée]e|par an|tous les ans|une fois par an)\b/i;
const MONTHLY_RE = /\b(chaque mois|mensuel(?:le)?s?|par mois|tous les mois)\b/i;
const AMOUNT_RE = /(\d[\d\s  .]*\d|\d)(?:[.,](\d+))?\s*(k|m|mille|fcfa|francs?|xaf|f)?(?![\p{L}\d])/giu;

function detectRecurrence(text: string): { recurrence: ImportRecurrence; rest: string } {
  // "une fois par an" is yearly, so test yearly first.
  if (YEARLY_RE.test(text)) return { recurrence: 'yearly', rest: text.replace(YEARLY_RE, ' ') };
  if (ONCE_RE.test(text)) return { recurrence: 'once', rest: text.replace(ONCE_RE, ' ') };
  if (MONTHLY_RE.test(text)) return { recurrence: 'monthly', rest: text.replace(MONTHLY_RE, ' ') };
  return { recurrence: 'monthly', rest: text };
}

function extractAmount(text: string): { amount: number | null; rest: string } {
  let last: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  AMOUNT_RE.lastIndex = 0;
  while ((m = AMOUNT_RE.exec(text)) !== null) last = m;
  if (!last) return { amount: null, rest: text };
  const digits = last[1].replace(/[\s  .]/g, '');
  const suffix = (last[3] || '').toLowerCase();
  let amount: number | null;
  if (suffix === 'k' || suffix === 'm' || suffix === 'mille') {
    const mult = suffix === 'm' ? 1_000_000 : 1000;
    const dec = last[2] ? parseFloat(`${digits}.${last[2]}`) : parseInt(digits, 10);
    amount = Math.round(dec * mult);
  } else {
    amount = parseAmount(digits);
  }
  if (amount !== null && amount > MAX_AMOUNT) amount = null;
  const rest = text.slice(0, last.index) + ' ' + text.slice(last.index + last[0].length);
  return { amount, rest };
}

function cleanLabel(s: string): string {
  return cleanName(
    s
      .replace(/\(\s*\)/g, ' ')
      .replace(/[=:>–—-]+\s*$/g, ' ')
      .replace(/^\s*[-–—•*=:>]+/g, ' ')
      .replace(/\s+[-–—=:]\s*$/g, ' ')
  ).replace(/[\s,.;:–—-]+$/g, '');
}

/** Guess a rubric for a line from the user's rubrics, then the suggestions' keywords. */
export function guessRubric(label: string, existing: string[] = []): string {
  const k = nameKey(label);
  const words = k.split(' ');
  const own = existing.find((r) => {
    const rk = nameKey(r);
    return rk && (k.includes(rk) || words.includes(rk));
  });
  if (own) return own;
  const sug = SUGGESTED_RUBRICS.find((s) => s.keywords.some((kw) => words.includes(kw) || (kw.includes(' ') && k.includes(kw))));
  return sug ? sug.name : OTHER_RUBRIC_DEFAULT.name;
}

export function parseBudgetSheet(text: string, existingRubrics: string[] = []): ImportRow[] {
  const rows: ImportRow[] = [];
  let current: string | null = null;
  (text || '').split(/\r?\n/).forEach((rawLine) => {
    let line = rawLine.trim();
    if (!line) {
      current = null;
      return;
    }
    // "Logement :" alone is a heading for the following lines.
    const heading = line.match(/^([^\d:>]+?)\s*[:>]\s*$/);
    if (heading) {
      current = cleanName(heading[1]);
      return;
    }
    // "Logement : Loyer 50000 / Eau 5000" sets the rubric for the whole line.
    const prefixed = line.match(/^([^\d:>]+?)\s*[:>]\s*(.+)$/);
    let lineRubric: string | null = null;
    if (prefixed && /\d/.test(prefixed[2]) && /[\p{L}]/u.test(prefixed[2].replace(/\d/g, ''))) {
      lineRubric = cleanName(prefixed[1]);
      line = prefixed[2];
    }
    line.split(/\s*[\/;|•]\s*/).forEach((chunk) => {
      if (!chunk.trim()) return;
      const r = detectRecurrence(chunk);
      const a = extractAmount(r.rest);
      const label = cleanLabel(a.rest);
      if (!label) return;
      rows.push({
        key: `r${rows.length}`,
        rubric: lineRubric || current || guessRubric(label, existingRubrics),
        label,
        amount: a.amount,
        recurrence: r.recurrence,
      });
    });
  });
  return rows;
}

export function importRecurrence(r: ImportRecurrence, monthKey: string): Recurrence {
  if (r === 'once') return { kind: 'once', month: monthKey };
  if (r === 'yearly') return { kind: 'yearly', month: monthNumber(monthKey), startMonth: monthKey };
  return { kind: 'monthly', startMonth: monthKey };
}

/** Style for a new rubric: the suggestion with the same name, otherwise a palette colour. */
export function styleForRubric(name: string, index: number): { icon: string; color: string; kind: CategoryKind } {
  const k = nameKey(name);
  const sug = SUGGESTED_RUBRICS.find((s) => nameKey(s.name) === k);
  if (sug) return { icon: sug.icon, color: sug.color, kind: sug.kind };
  const incomeLike = /\b(revenu|revenus|salaire|salaires)\b/.test(k);
  if (incomeLike) return { icon: 'Wallet', color: '#12A150', kind: 'in' };
  return { icon: 'Shapes', color: PALETTE[index % PALETTE.length], kind: 'out' };
}

/** Create the rubrics and lines of the confirmed preview in `monthKey`. */
export function applyImport(b: MemberBudget, rows: ImportRow[], monthKey: string): OpResult {
  let next = b;
  const ids = new Map<string, string>();
  let created = 0;
  for (const row of rows) {
    const rubric = cleanName(row.rubric) || OTHER_RUBRIC_DEFAULT.name;
    const key = nameKey(rubric);
    let catId = ids.get(key);
    if (!catId) {
      const style = styleForRubric(rubric, next.categories.length + created);
      const r = ensureCategory(next, { name: rubric, ...style, budgetMode: 'lines' }, monthKey);
      if (!r.ok) return r;
      next = r.budget;
      catId = r.id!;
      ids.set(key, catId);
      created++;
    }
    const r = addLine(next, monthKey, {
      categoryId: catId,
      label: row.label,
      amount: row.amount,
      recurrence: importRecurrence(row.recurrence, monthKey),
    });
    if (!r.ok) return r;
    next = r.budget;
  }
  return { ok: true, budget: next };
}
