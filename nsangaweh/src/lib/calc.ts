import { Category, CategoryKind, Entry, MonthDoc, MonthLine } from './types';

export const EMPTY_MONTH: MonthDoc = { lines: [], entries: [] };

export interface LineCalc {
  line: MonthLine;
  paid: number;
  remaining: number;
}

export interface CategoryCalc {
  id: string;
  category: Category;
  kind: CategoryKind;
  /** Envelope when this month stores an envelope amount for the rubric. */
  mode: 'lines' | 'envelope';
  envelope: number | null;
  planned: number;
  actual: number;
  remaining: number;
  lines: LineCalc[];
  /** Entries of the rubric not attached to a visible line. */
  unplanned: number;
  unsetLines: number;
}

export type FreeBasis = 'received' | 'planned' | 'none';

export interface MonthCalc {
  monthKey: string;
  month: MonthDoc;
  hasPlan: boolean;
  inc: number;
  out: number;
  saved: number;
  pIn: number;
  pOut: number;
  pSave: number;
  /** Planned expenses and savings not paid yet. */
  toPay: number;
  toReceive: number;
  /** Money left after the planned payments, or null when there is no income at all. */
  free: number | null;
  freeBasis: FreeBasis;
  byCategory: Record<string, CategoryCalc>;
  byLine: Record<string, number>;
  /** Categories in display order, split by kind. */
  income: CategoryCalc[];
  expense: CategoryCalc[];
  /** Spending with no rubric (or a rubric that no longer exists). */
  uncategorizedOut: number;
  uncategorizedIn: number;
  transfers: number;
  unsetCount: number;
}

/** How an entry counts: transfers never count, entries in a 'save' rubric are savings. */
export function effectiveKind(e: Entry, catKind?: CategoryKind): 'in' | 'out' | 'save' | null {
  if (e.status === 'declined') return null;
  if (e.t === 'transfer') return null;
  if (e.t === 'in') return 'in';
  if (e.t === 'save' || catKind === 'save') return 'save';
  return 'out';
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

export function sortLines(lines: MonthLine[]): MonthLine[] {
  return lines
    .map((l, i) => ({ l, i }))
    .sort((a, b) => (a.l.order ?? a.i) - (b.l.order ?? b.i) || a.i - b.i)
    .map((x) => x.l);
}

export function calcMonth(
  categories: Category[],
  month: MonthDoc | undefined,
  monthKey = ''
): MonthCalc {
  const m = month || EMPTY_MONTH;
  const catById = new Map(categories.map((c) => [c.id, c]));
  const lineById = new Map(m.lines.map((l) => [l.id, l]));

  const byLine: Record<string, number> = {};
  const actualByCat: Record<string, number> = {};
  const unplannedByCat: Record<string, number> = {};
  let inc = 0;
  let out = 0;
  let saved = 0;
  let uncategorizedOut = 0;
  let uncategorizedIn = 0;
  let transfers = 0;

  m.entries.forEach((e) => {
    if (e.t === 'transfer' && e.status !== 'declined') transfers += e.amt;
    const cat = e.categoryId ? catById.get(e.categoryId) : undefined;
    const k = effectiveKind(e, cat?.kind);
    if (!k) return;
    if (k === 'in') inc += e.amt;
    else if (k === 'save') saved += e.amt;
    else out += e.amt;

    if (!cat) {
      if (k === 'in') uncategorizedIn += e.amt;
      else if (k === 'out') uncategorizedOut += e.amt;
      return;
    }
    actualByCat[cat.id] = (actualByCat[cat.id] || 0) + e.amt;
    const line = e.lineId ? lineById.get(e.lineId) : undefined;
    if (line && !line.archived && line.categoryId === cat.id) {
      byLine[line.id] = (byLine[line.id] || 0) + e.amt;
    } else {
      unplannedByCat[cat.id] = (unplannedByCat[cat.id] || 0) + e.amt;
    }
  });

  const byCategory: Record<string, CategoryCalc> = {};
  let pIn = 0;
  let pOut = 0;
  let pSave = 0;
  let toPay = 0;
  let toReceive = 0;
  let unsetCount = 0;

  sortCategories(categories).forEach((cat) => {
    const catLines = sortLines(m.lines.filter((l) => l.categoryId === cat.id && !l.archived));
    const actual = actualByCat[cat.id] || 0;
    const hasEnvelope = !!m.envelopes && Object.prototype.hasOwnProperty.call(m.envelopes, cat.id);
    const envelope = hasEnvelope ? (m.envelopes![cat.id] ?? null) : null;

    // Archived rubrics keep their history but plan nothing.
    if (cat.archived && !actual && !catLines.length) return;

    const lines: LineCalc[] = catLines.map((line) => {
      const paid = byLine[line.id] || 0;
      return { line, paid, remaining: Math.max(0, (line.amount || 0) - paid) };
    });

    let planned = 0;
    let remaining = 0;
    if (!cat.archived) {
      if (hasEnvelope) {
        planned = envelope || 0;
        remaining = Math.max(0, planned - actual);
      } else {
        planned = lines.reduce((s, l) => s + (l.line.amount || 0), 0);
        remaining = lines.reduce((s, l) => s + l.remaining, 0);
      }
    }
    const unsetLines = hasEnvelope ? 0 : lines.filter((l) => l.line.amount === null).length;
    if (!cat.archived) unsetCount += unsetLines;

    byCategory[cat.id] = {
      id: cat.id,
      category: cat,
      kind: cat.kind,
      mode: hasEnvelope ? 'envelope' : 'lines',
      envelope,
      planned,
      actual,
      remaining,
      lines,
      unplanned: unplannedByCat[cat.id] || 0,
      unsetLines,
    };

    if (cat.kind === 'in') {
      pIn += planned;
      toReceive += remaining;
    } else if (cat.kind === 'save') {
      pSave += planned;
      toPay += remaining;
    } else {
      pOut += planned;
      toPay += remaining;
    }
  });

  const values = Object.values(byCategory);
  const ordered = sortCategories(values.map((v) => v.category)).map((c) => byCategory[c.id]);

  let freeBasis: FreeBasis = 'none';
  let free: number | null = null;
  if (inc > 0) {
    freeBasis = 'received';
    free = inc - out - saved - toPay;
  } else if (pIn > 0) {
    freeBasis = 'planned';
    free = pIn - out - saved - toPay;
  }

  return {
    monthKey,
    month: m,
    hasPlan: !!m.planCreated,
    inc,
    out,
    saved,
    pIn,
    pOut,
    pSave,
    toPay,
    toReceive,
    free,
    freeBasis,
    byCategory,
    byLine,
    income: ordered.filter((c) => c.kind === 'in'),
    expense: ordered.filter((c) => c.kind !== 'in'),
    uncategorizedOut,
    uncategorizedIn,
    transfers,
    unsetCount,
  };
}

export interface EntryDisplay {
  label: string;
  category: Category | null;
  line: MonthLine | null;
}

/**
 * Label and rubric for an entry. Ids win over the stored snapshot, so a
 * renamed rubric or line shows its new name everywhere, including history.
 */
export function describeEntry(
  e: Entry,
  categories: Category[] | Map<string, Category>,
  month?: MonthDoc
): EntryDisplay {
  const map = categories instanceof Map ? categories : new Map(categories.map((c) => [c.id, c]));
  const category = (e.categoryId && map.get(e.categoryId)) || null;
  const line = (e.lineId && month?.lines.find((l) => l.id === e.lineId)) || null;
  const label = line?.label || e.label || '';
  return { label, category, line };
}

export interface RankedExpense {
  key: string;
  label: string;
  category: Category | null;
  amt: number;
  who?: string;
}

/** Biggest expenses of the month grouped by line (or free label). Savings are not expenses. */
export function rankExpenses(
  list: Array<{ categories: Category[]; month?: MonthDoc; name?: string }>
): RankedExpense[] {
  const map = new Map<string, RankedExpense>();
  list.forEach(({ categories, month, name }) => {
    if (!month) return;
    const cats = new Map(categories.map((c) => [c.id, c]));
    month.entries.forEach((e) => {
      const d = describeEntry(e, cats, month);
      if (effectiveKind(e, d.category?.kind) !== 'out') return;
      const key = `${name || ''}::${d.category?.id || '-'}::${d.line?.id || d.label.toLowerCase()}`;
      const cur = map.get(key) || { key, label: d.label || 'Dépense', category: d.category, amt: 0, who: name };
      cur.amt += e.amt;
      map.set(key, cur);
    });
  });
  return [...map.values()].sort((a, b) => b.amt - a.amt);
}

/** Month has at least one entry referencing the category. */
export function monthHasCategoryEntries(month: MonthDoc | undefined, categoryId: string): boolean {
  return !!month?.entries.some((e) => e.categoryId === categoryId);
}
