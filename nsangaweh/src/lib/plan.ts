import { addMonth, fmt, generateId, monthName } from './budget-math';
import { calcMonth } from './calc';
import { isMonthly, recurrenceMatches } from './recurrence';
import { cleanName } from './validation';
import { BudgetItem, Category, Debt, LineOrigin, MonthDoc, MonthLine } from './types';

export interface ReviewRow {
  key: string;
  itemId?: string;
  debtId?: string;
  categoryId: string;
  label: string;
  amount: number | null;
  include: boolean;
  origin: LineOrigin;
  note?: string;
  remind?: boolean;
  /** Small explanation shown under the row. */
  hint?: string;
}

export interface ReviewEnvelope {
  categoryId: string;
  amount: number | null;
  rollover: number;
}

export interface MonthReview {
  monthKey: string;
  prevMonthKey: string;
  /** "Reviennent chaque mois" — on by default. */
  recurring: ReviewRow[];
  /** "Saisonnières prévues ce mois" — on by default. */
  seasonal: ReviewRow[];
  /** Lines fed by the Carnet de dettes — on by default. */
  debts: ReviewRow[];
  /** "Ponctuelles du mois dernier" — NOT copied by default. */
  lastOneoffs: ReviewRow[];
  /** "Non payé le mois dernier" — the unpaid remainder, off by default. */
  unpaid: ReviewRow[];
  envelopes: ReviewEnvelope[];
}

export function debtRemaining(d: Debt): number {
  const paid = (d.payments || []).reduce((s, p) => s + p.amt, 0);
  return Math.max(0, d.principal - paid);
}

export function debtsCategory(categories: Category[]): Category | undefined {
  return categories.find((c) => c.linkedTo === 'debts' && !c.archived);
}

export interface PlanSource {
  categories: Category[];
  items: BudgetItem[];
  debts?: Debt[];
  months: Record<string, MonthDoc>;
}

/** Latest month before `monthKey` that has a plan. */
export function previousPlannedMonth(months: Record<string, MonthDoc>, monthKey: string): string | null {
  const keys = Object.keys(months)
    .filter((k) => k < monthKey && months[k]?.planCreated)
    .sort();
  return keys.length ? keys[keys.length - 1] : null;
}

export function buildMonthReview(
  src: PlanSource,
  monthKey: string,
  opts: { rollover?: boolean } = {}
): MonthReview {
  const cats = new Map(src.categories.map((c) => [c.id, c]));
  const usable = (catId: string) => {
    const c = cats.get(catId);
    return !!c && !c.archived && c.budgetMode === 'lines';
  };

  const eligible = src.items
    .filter((it) => it.active && !it.archived && usable(it.categoryId))
    .filter((it) => recurrenceMatches(it.recurrence, monthKey))
    .sort((a, b) => a.order - b.order);

  const toRow = (it: BudgetItem): ReviewRow => ({
    key: `item-${it.id}`,
    itemId: it.id,
    categoryId: it.categoryId,
    label: it.label,
    amount: it.amount,
    include: true,
    origin: it.recurrence.kind === 'once' ? 'oneoff' : 'recurring',
    note: it.note,
    remind: it.remind,
  });

  const recurring = eligible.filter((it) => isMonthly(it.recurrence)).map(toRow);
  const seasonal = eligible.filter((it) => !isMonthly(it.recurrence)).map(toRow);

  const debtCat = debtsCategory(src.categories);
  const debts: ReviewRow[] = debtCat
    ? (src.debts || [])
        .filter((d) => d.direction === 'i_owe' && d.status === 'active' && debtRemaining(d) > 0)
        .map((d) => ({
          key: `debt-${d.id}`,
          debtId: d.id,
          categoryId: debtCat.id,
          label: cleanName(d.person),
          amount: debtRemaining(d),
          include: true,
          origin: 'debt' as const,
          hint: 'Reste dû dans le carnet de dettes',
        }))
    : [];

  const prevKey = previousPlannedMonth(src.months, monthKey) || addMonth(monthKey, -1);
  const prev = src.months[prevKey];
  const lastOneoffs: ReviewRow[] = [];
  const unpaid: ReviewRow[] = [];
  const envelopes: ReviewEnvelope[] = [];

  const prevCalc = prev?.planCreated ? calcMonth(src.categories, prev, prevKey) : null;
  const plannedItemIds = new Set(eligible.map((i) => i.id));

  if (prev?.planCreated && prevCalc) {
    prev.lines.forEach((l) => {
      if (l.archived || !usable(l.categoryId)) return;
      if ((l.origin === 'oneoff' || l.origin === 'manual') && !(l.itemId && plannedItemIds.has(l.itemId))) {
        lastOneoffs.push({
          key: `prev-${l.id}`,
          categoryId: l.categoryId,
          label: l.label,
          amount: l.amount,
          include: false,
          origin: 'oneoff',
          note: l.note,
        });
      }
      const kind = cats.get(l.categoryId)?.kind;
      const paid = prevCalc.byLine[l.id] || 0;
      const rest = (l.amount || 0) - paid;
      if (l.origin !== 'debt' && kind !== 'in' && (l.amount || 0) > 0 && rest > 0) {
        unpaid.push({
          key: `unpaid-${l.id}`,
          categoryId: l.categoryId,
          label: cleanName(`${l.label} (reste)`),
          amount: rest,
          include: false,
          origin: 'oneoff',
          hint: `${paidLabel(paid, l.amount || 0)} en ${monthName(prevKey).toLowerCase()}`,
        });
      }
    });
  }

  src.categories
    .filter((c) => !c.archived && c.budgetMode === 'envelope')
    .sort((a, b) => a.order - b.order)
    .forEach((c) => {
      const base = c.envelopeAmount ?? null;
      let rollover = 0;
      if (opts.rollover && prevCalc) {
        const pc = prevCalc.byCategory[c.id];
        if (pc && pc.mode === 'envelope') rollover = Math.max(0, pc.planned - pc.actual);
      }
      envelopes.push({
        categoryId: c.id,
        amount: rollover ? (base || 0) + rollover : base,
        rollover,
      });
    });

  return { monthKey, prevMonthKey: prevKey, recurring, seasonal, debts, lastOneoffs, unpaid, envelopes };
}

function paidLabel(paid: number, amount: number): string {
  return `Payé ${fmt(paid)} F sur ${fmt(amount)} F`;
}

/** Build this month's own plan from the choices of the review. Existing entries are kept. */
export function applyMonthReview(review: MonthReview, existing?: MonthDoc, now = Date.now()): MonthDoc {
  const base: MonthDoc = existing ? { ...existing } : { lines: [], entries: [] };
  const lines: MonthLine[] = [...(base.lines || [])];
  const haveItem = new Set(lines.filter((l) => l.itemId).map((l) => l.itemId));
  const haveDebt = new Set(lines.filter((l) => l.debtId).map((l) => l.debtId));

  const rows = [
    ...review.recurring,
    ...review.seasonal,
    ...review.debts,
    ...review.lastOneoffs,
    ...review.unpaid,
  ].filter((r) => r.include);

  rows.forEach((r) => {
    if (r.itemId && haveItem.has(r.itemId)) return;
    if (r.debtId && haveDebt.has(r.debtId)) return;
    const line: MonthLine = {
      id: generateId(),
      categoryId: r.categoryId,
      label: cleanName(r.label),
      amount: r.amount,
      origin: r.origin,
      order: lines.length,
    };
    if (r.itemId) line.itemId = r.itemId;
    if (r.debtId) line.debtId = r.debtId;
    if (r.note) line.note = r.note;
    if (r.remind) line.remind = true;
    lines.push(line);
  });

  const envelopes: Record<string, number | null> = { ...(base.envelopes || {}) };
  review.envelopes.forEach((e) => {
    if (!(e.categoryId in envelopes)) envelopes[e.categoryId] = e.amount;
  });

  return { ...base, lines, envelopes, planCreated: true, createdAt: base.createdAt || now };
}

/** "Commencer {mois}": the plan with the review defaults, no questions asked. */
export function generateMonthDoc(
  src: PlanSource,
  monthKey: string,
  opts: { rollover?: boolean } = {}
): MonthDoc {
  return applyMonthReview(buildMonthReview(src, monthKey, opts), src.months[monthKey]);
}

/** Copy another month's structure (lines and envelopes, no entries) into `monthKey`. */
export function copyMonthPlan(from: MonthDoc, existing?: MonthDoc, now = Date.now()): MonthDoc {
  const base: MonthDoc = existing ? { ...existing } : { lines: [], entries: [] };
  const lines = from.lines
    .filter((l) => !l.archived && l.origin !== 'debt')
    .map((l, i) => ({ ...l, id: generateId(), order: i }));
  return {
    ...base,
    lines: [...(base.lines || []), ...lines],
    envelopes: { ...(from.envelopes || {}), ...(base.envelopes || {}) },
    planCreated: true,
    createdAt: base.createdAt || now,
  };
}
