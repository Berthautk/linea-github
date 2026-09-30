/**
 * Pure operations on one member's budget. Every function returns a new
 * MemberBudget (or an error) and never mutates its input, so the caller can
 * keep the previous value for "Annuler".
 */
import { generateId } from './budget-math';
import { DEBTS_RUBRIC_DEFAULT } from './catalog';
import { debtRemaining, debtsCategory } from './plan';
import { recurrenceMatches, sameRecurrence } from './recurrence';
import {
  BudgetItem,
  BudgetMode,
  Category,
  CategoryKind,
  Debt,
  DebtPayment,
  Entry,
  MemberBudget,
  MonthDoc,
  MonthLine,
  Recurrence,
} from './types';
import { cleanName, nameKey, validateAmount, validateCategoryName, validateName } from './validation';

export type OpResult = { ok: true; budget: MemberBudget; id?: string; archived?: boolean } | { ok: false; error: string };

const ok = (budget: MemberBudget, extra: { id?: string; archived?: boolean } = {}): OpResult => ({
  ok: true,
  budget,
  ...extra,
});
const fail = (error: string): OpResult => ({ ok: false, error });

export const EMPTY_BUDGET: MemberBudget = { categories: [], items: [], debts: [], commitments: [], months: {} };

function setMonth(b: MemberBudget, key: string, m: MonthDoc): MemberBudget {
  return { ...b, months: { ...b.months, [key]: m } };
}

function getMonth(b: MemberBudget, key: string): MonthDoc {
  return b.months[key] || { lines: [], entries: [] };
}

function mapMonths(b: MemberBudget, fn: (m: MonthDoc, key: string) => MonthDoc): MemberBudget {
  let changed = false;
  const months: Record<string, MonthDoc> = {};
  Object.entries(b.months).forEach(([k, m]) => {
    const next = fn(m, k);
    if (next !== m) changed = true;
    months[k] = next;
  });
  return changed ? { ...b, months } : b;
}

/* ------------------------------ queries ------------------------------ */

export function categoryHasEntries(b: MemberBudget, categoryId: string): boolean {
  return Object.values(b.months).some((m) => m.entries.some((e) => e.categoryId === categoryId));
}

export function lineHasEntries(month: MonthDoc | undefined, lineId: string): boolean {
  return !!month?.entries.some((e) => e.lineId === lineId);
}

export function itemHasEntries(b: MemberBudget, itemId: string): boolean {
  return Object.values(b.months).some((m) => {
    const ids = new Set(m.lines.filter((l) => l.itemId === itemId).map((l) => l.id));
    return ids.size > 0 && m.entries.some((e) => e.lineId && ids.has(e.lineId));
  });
}

export function findLine(b: MemberBudget, monthKey: string, lineId: string): MonthLine | undefined {
  return b.months[monthKey]?.lines.find((l) => l.id === lineId);
}

/* ------------------------------ rubrics ------------------------------ */

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  budgetMode?: BudgetMode;
  envelopeAmount?: number | null;
  linkedTo?: 'debts';
}

export function createCategory(
  b: MemberBudget,
  input: CategoryInput,
  monthKey?: string,
  now = Date.now()
): OpResult {
  const name = validateCategoryName(input.name, b.categories);
  if (!name.ok) return fail(name.error);
  const env = validateAmount(input.envelopeAmount ?? null);
  if (!env.ok) return fail(env.error);
  const mode: BudgetMode = input.budgetMode || 'lines';
  const cat: Category = {
    id: generateId(),
    name: name.value,
    icon: input.icon,
    color: input.color,
    order: b.categories.reduce((m, c) => Math.max(m, c.order), -1) + 1,
    kind: input.kind,
    budgetMode: mode,
    archived: false,
    createdAt: now,
  };
  if (mode === 'envelope') cat.envelopeAmount = env.value;
  if (input.linkedTo) cat.linkedTo = input.linkedTo;
  let next: MemberBudget = { ...b, categories: [...b.categories, cat] };
  if (mode === 'envelope' && monthKey && next.months[monthKey]?.planCreated) {
    const m = getMonth(next, monthKey);
    next = setMonth(next, monthKey, { ...m, envelopes: { ...(m.envelopes || {}), [cat.id]: env.value } });
  }
  return ok(next, { id: cat.id });
}

/** Find an active rubric by name (normalised) or create it with the given style. */
export function ensureCategory(b: MemberBudget, input: CategoryInput, monthKey?: string): OpResult {
  const key = nameKey(input.name);
  const found =
    (input.linkedTo && b.categories.find((c) => c.linkedTo === input.linkedTo && !c.archived)) ||
    b.categories.find((c) => !c.archived && nameKey(c.name) === key);
  if (found) {
    if (input.linkedTo && found.linkedTo !== input.linkedTo) {
      return ok(
        { ...b, categories: b.categories.map((c) => (c.id === found.id ? { ...c, linkedTo: input.linkedTo } : c)) },
        { id: found.id }
      );
    }
    return ok(b, { id: found.id });
  }
  const archivedSame = b.categories.find((c) => c.archived && nameKey(c.name) === key);
  if (archivedSame) {
    return ok(
      {
        ...b,
        categories: b.categories.map((c) =>
          c.id === archivedSame.id ? { ...c, archived: false, ...(input.linkedTo ? { linkedTo: input.linkedTo } : {}) } : c
        ),
      },
      { id: archivedSame.id }
    );
  }
  return createCategory(b, input, monthKey);
}

export function updateCategory(
  b: MemberBudget,
  id: string,
  patch: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'kind'>>
): OpResult {
  const cat = b.categories.find((c) => c.id === id);
  if (!cat) return fail('Rubrique introuvable.');
  const next: Category = { ...cat };
  if (patch.name !== undefined) {
    const v = validateCategoryName(patch.name, b.categories, id);
    if (!v.ok) return fail(v.error);
    next.name = v.value;
  }
  if (patch.icon) next.icon = patch.icon;
  if (patch.color) next.color = patch.color;
  if (patch.kind) next.kind = patch.kind;
  return ok({ ...b, categories: b.categories.map((c) => (c.id === id ? next : c)) });
}

export function reorderCategories(b: MemberBudget, orderedIds: string[]): MemberBudget {
  const pos = new Map(orderedIds.map((id, i) => [id, i]));
  const tail = orderedIds.length;
  return {
    ...b,
    categories: b.categories.map((c) => {
      const order = pos.has(c.id) ? pos.get(c.id)! : tail + c.order;
      return order === c.order ? c : { ...c, order };
    }),
  };
}

/**
 * "Supprimer": a rubric without any entry is removed with its lines;
 * one with entries in any month is archived so history stays intact.
 */
export function deleteCategory(b: MemberBudget, id: string): OpResult {
  const cat = b.categories.find((c) => c.id === id);
  if (!cat) return fail('Rubrique introuvable.');
  if (categoryHasEntries(b, id)) {
    return ok({ ...b, categories: b.categories.map((c) => (c.id === id ? { ...c, archived: true } : c)) }, { archived: true });
  }
  const next = mapMonths(
    {
      ...b,
      categories: b.categories.filter((c) => c.id !== id),
      items: b.items.filter((i) => i.categoryId !== id),
      commitments: b.commitments.filter((c) => c.categoryId !== id),
    },
    (m) => {
      const hasLines = m.lines.some((l) => l.categoryId === id);
      const hasEnv = !!m.envelopes && id in m.envelopes;
      if (!hasLines && !hasEnv) return m;
      const envelopes = { ...(m.envelopes || {}) };
      delete envelopes[id];
      return { ...m, lines: m.lines.filter((l) => l.categoryId !== id), envelopes };
    }
  );
  return ok(next, { archived: false });
}

export function archiveCategory(b: MemberBudget, id: string): MemberBudget {
  return { ...b, categories: b.categories.map((c) => (c.id === id ? { ...c, archived: true } : c)) };
}

export function restoreCategory(b: MemberBudget, id: string): MemberBudget {
  return { ...b, categories: b.categories.map((c) => (c.id === id ? { ...c, archived: false } : c)) };
}

/** Move every entry of an archived rubric to another rubric, then remove the empty rubric. */
export function moveCategoryEntries(b: MemberBudget, fromId: string, toId: string): OpResult {
  if (fromId === toId) return fail('Choisissez une autre rubrique.');
  if (!b.categories.some((c) => c.id === toId)) return fail('Rubrique de destination introuvable.');
  const moved = mapMonths(b, (m) => {
    if (!m.entries.some((e) => e.categoryId === fromId)) return m;
    return {
      ...m,
      entries: m.entries.map((e) => (e.categoryId === fromId ? { ...e, categoryId: toId, lineId: null } : e)),
    };
  });
  return deleteCategory(moved, fromId);
}

/**
 * Switch a rubric between "Détaillé par lignes" and "Enveloppe simple".
 * Lines -> envelope: the envelope takes the lines' total, the lines stop recurring.
 * Envelope -> lines: the envelope becomes a first monthly line.
 */
export function setBudgetMode(b: MemberBudget, id: string, mode: BudgetMode, monthKey: string): OpResult {
  const cat = b.categories.find((c) => c.id === id);
  if (!cat) return fail('Rubrique introuvable.');
  if (cat.budgetMode === mode) return ok(b);
  const m = getMonth(b, monthKey);

  if (mode === 'envelope') {
    const catLines = m.lines.filter((l) => l.categoryId === id && !l.archived);
    const total = catLines.reduce((s, l) => s + (l.amount || 0), 0);
    const amount = catLines.length ? total : (cat.envelopeAmount ?? null);
    const keep = (l: MonthLine) => l.categoryId !== id || lineHasEntries(m, l.id);
    let next: MemberBudget = {
      ...b,
      categories: b.categories.map((c) => (c.id === id ? { ...c, budgetMode: 'envelope', envelopeAmount: amount } : c)),
      items: b.items.map((it) => (it.categoryId === id && it.active ? { ...it, active: false } : it)),
    };
    if (m.planCreated) {
      next = setMonth(next, monthKey, {
        ...m,
        lines: m.lines.filter(keep).map((l) => (l.categoryId === id ? { ...l, archived: true } : l)),
        envelopes: { ...(m.envelopes || {}), [id]: amount },
      });
    }
    return ok(next);
  }

  // envelope -> lines
  const envAmount = m.envelopes && id in m.envelopes ? m.envelopes[id] : (cat.envelopeAmount ?? null);
  let next: MemberBudget = {
    ...b,
    categories: b.categories.map((c) => (c.id === id ? { ...c, budgetMode: 'lines', envelopeAmount: null } : c)),
  };
  if (m.planCreated) {
    const envelopes = { ...(m.envelopes || {}) };
    delete envelopes[id];
    next = setMonth(next, monthKey, { ...m, envelopes });
    const hasActiveItems = next.items.some((it) => it.categoryId === id && it.active && !it.archived);
    if (!hasActiveItems) {
      const added = addLine(next, monthKey, {
        categoryId: id,
        label: cat.name,
        amount: envAmount ?? null,
        recurrence: { kind: 'monthly', startMonth: monthKey },
      });
      if (!added.ok) return added;
      next = added.budget;
    }
  }
  return ok(next);
}

/** Change the envelope of a rubric for this month only, or this month and the following ones. */
export function setEnvelopeAmount(
  b: MemberBudget,
  id: string,
  monthKey: string,
  amount: number | null,
  scope: 'month' | 'following'
): OpResult {
  const v = validateAmount(amount);
  if (!v.ok) return fail(v.error);
  let next = b;
  if (scope === 'following') {
    next = {
      ...next,
      categories: next.categories.map((c) => (c.id === id ? { ...c, envelopeAmount: v.value } : c)),
    };
    next = mapMonths(next, (m, k) =>
      k > monthKey && m.envelopes && id in m.envelopes ? { ...m, envelopes: { ...m.envelopes, [id]: v.value } } : m
    );
  }
  const m = getMonth(next, monthKey);
  next = setMonth(next, monthKey, { ...m, envelopes: { ...(m.envelopes || {}), [id]: v.value } });
  return ok(next);
}

/* ------------------------------- lines ------------------------------- */

export interface LineInput {
  categoryId: string;
  label: string;
  amount: number | null;
  recurrence: Recurrence;
  note?: string;
  remind?: boolean;
}

/**
 * Add a line to a month. "Ce mois seulement" creates a one-off line only;
 * any other recurrence also creates the item template for later months.
 */
export function addLine(b: MemberBudget, monthKey: string, input: LineInput): OpResult {
  const label = validateName(input.label, 'Le nom de la ligne');
  if (!label.ok) return fail(label.error);
  const amount = validateAmount(input.amount);
  if (!amount.ok) return fail(amount.error);
  const cat = b.categories.find((c) => c.id === input.categoryId);
  if (!cat) return fail('Choisissez une rubrique.');

  let next = b;
  if (cat.budgetMode === 'envelope') {
    // Adding a line to an envelope turns the rubric into lines (the envelope becomes the first line).
    const sw = setBudgetMode(next, cat.id, 'lines', monthKey);
    if (!sw.ok) return sw;
    next = sw.budget;
  }

  const m = getMonth(next, monthKey);
  const line: MonthLine = {
    id: generateId(),
    categoryId: cat.id,
    label: label.value,
    amount: amount.value,
    origin: input.recurrence.kind === 'once' ? 'oneoff' : 'recurring',
    order: m.lines.filter((l) => l.categoryId === cat.id).length,
  };
  if (input.note?.trim()) line.note = input.note.trim().slice(0, 200);
  if (input.remind) line.remind = true;

  if (input.recurrence.kind !== 'once') {
    const item: BudgetItem = {
      id: generateId(),
      categoryId: cat.id,
      label: label.value,
      amount: amount.value,
      recurrence: input.recurrence,
      active: true,
      order: next.items.filter((i) => i.categoryId === cat.id).length,
      archived: false,
    };
    if (line.note) item.note = line.note;
    if (input.remind) item.remind = true;
    line.itemId = item.id;
    next = { ...next, items: [...next.items, item] };
  }

  next = setMonth(next, monthKey, { ...m, lines: [...m.lines, line], planCreated: true, createdAt: m.createdAt || Date.now() });
  return ok(next, { id: line.id });
}

export interface LinePatch {
  label?: string;
  amount?: number | null;
  categoryId?: string;
  note?: string;
  remind?: boolean;
  recurrence?: Recurrence;
}

/** Does this edit need the "Seulement ce mois / Ce mois et les suivants" question? */
export function editNeedsScope(b: MemberBudget, monthKey: string, lineId: string, patch: LinePatch): boolean {
  const line = findLine(b, monthKey, lineId);
  if (!line?.itemId) return false;
  const item = b.items.find((i) => i.id === line.itemId);
  if (!item || item.archived) return false;
  if (patch.recurrence && !sameRecurrence(patch.recurrence, item.recurrence)) return false; // template change by nature
  return (
    (patch.label !== undefined && cleanName(patch.label) !== line.label) ||
    (patch.amount !== undefined && patch.amount !== line.amount) ||
    (patch.categoryId !== undefined && patch.categoryId !== line.categoryId) ||
    (patch.note !== undefined && (patch.note || '') !== (line.note || '')) ||
    (patch.remind !== undefined && !!patch.remind !== !!line.remind)
  );
}

function patchLine(line: MonthLine, p: { label?: string; amount?: number | null; categoryId?: string; note?: string; remind?: boolean }): MonthLine {
  const next: MonthLine = { ...line };
  if (p.label !== undefined) next.label = p.label;
  if (p.amount !== undefined) next.amount = p.amount;
  if (p.categoryId !== undefined) next.categoryId = p.categoryId;
  if (p.note !== undefined) {
    if (p.note) next.note = p.note;
    else delete next.note;
  }
  if (p.remind !== undefined) {
    if (p.remind) next.remind = true;
    else delete next.remind;
  }
  return next;
}

/** When a line moves to another rubric, its entries follow it. */
function moveLineEntries(m: MonthDoc, lineId: string, categoryId: string): MonthDoc['entries'] {
  return m.entries.map((e) => (e.lineId === lineId && e.categoryId !== categoryId ? { ...e, categoryId } : e));
}

/**
 * Edit a month line.
 * - scope 'month': only this month's line changes.
 * - scope 'following': the item template, this month and the months already
 *   planned after it change; a new name is applied to every month.
 * Changing the recurrence always updates the template.
 */
export function editLine(
  b: MemberBudget,
  monthKey: string,
  lineId: string,
  patch: LinePatch,
  scope: 'month' | 'following'
): OpResult {
  const m = b.months[monthKey];
  const line = m?.lines.find((l) => l.id === lineId);
  if (!m || !line) return fail('Ligne introuvable.');

  const clean: { label?: string; amount?: number | null; categoryId?: string; note?: string; remind?: boolean } = {};
  if (patch.label !== undefined) {
    const v = validateName(patch.label, 'Le nom de la ligne');
    if (!v.ok) return fail(v.error);
    clean.label = v.value;
  }
  if (patch.amount !== undefined) {
    const v = validateAmount(patch.amount);
    if (!v.ok) return fail(v.error);
    clean.amount = v.value;
  }
  if (patch.categoryId !== undefined) {
    const c = b.categories.find((x) => x.id === patch.categoryId);
    if (!c) return fail('Rubrique introuvable.');
    if (c.budgetMode === 'envelope' && c.id !== line.categoryId) {
      return fail(`« ${c.name} » est une enveloppe simple : passez-la en lignes pour y ranger cette ligne.`);
    }
    clean.categoryId = patch.categoryId;
  }
  if (patch.note !== undefined) clean.note = patch.note.trim().slice(0, 200);
  if (patch.remind !== undefined) clean.remind = patch.remind;

  let next = b;
  let item = line.itemId ? b.items.find((i) => i.id === line.itemId) : undefined;
  const rec = patch.recurrence;

  // A one-off line that becomes recurring gets a template.
  if (!item && rec && rec.kind !== 'once') {
    const merged = patchLine(line, clean);
    const newItem: BudgetItem = {
      id: generateId(),
      categoryId: merged.categoryId,
      label: merged.label,
      amount: merged.amount,
      recurrence: rec,
      active: true,
      order: b.items.filter((i) => i.categoryId === merged.categoryId).length,
      archived: false,
    };
    if (merged.note) newItem.note = merged.note;
    if (merged.remind) newItem.remind = true;
    const newLine: MonthLine = { ...merged, itemId: newItem.id, origin: merged.origin === 'debt' ? 'debt' : 'recurring' };
    next = { ...next, items: [...next.items, newItem] };
    return ok(
      setMonth(next, monthKey, {
        ...m,
        lines: m.lines.map((l) => (l.id === lineId ? newLine : l)),
        entries: clean.categoryId ? moveLineEntries(m, lineId, clean.categoryId) : m.entries,
      })
    );
  }

  const recurrenceChanged = !!item && !!rec && !sameRecurrence(rec, item.recurrence);
  const effectiveScope = recurrenceChanged ? 'following' : scope;

  if (!item || effectiveScope === 'month') {
    return ok(
      setMonth(next, monthKey, {
        ...m,
        lines: m.lines.map((l) => (l.id === lineId ? patchLine(l, clean) : l)),
        entries: clean.categoryId ? moveLineEntries(m, lineId, clean.categoryId) : m.entries,
      })
    );
  }

  // scope 'following' on a recurring line
  const itemId = item.id;
  const newRec = rec || item.recurrence;
  const updatedItem: BudgetItem = { ...item, recurrence: newRec };
  if (clean.label !== undefined) updatedItem.label = clean.label;
  if (clean.amount !== undefined) updatedItem.amount = clean.amount;
  if (clean.categoryId !== undefined) updatedItem.categoryId = clean.categoryId;
  if (clean.note !== undefined) {
    if (clean.note) updatedItem.note = clean.note;
    else delete updatedItem.note;
  }
  if (clean.remind !== undefined) {
    if (clean.remind) updatedItem.remind = true;
    else delete updatedItem.remind;
  }
  item = updatedItem;
  next = { ...next, items: next.items.map((i) => (i.id === itemId ? updatedItem : i)) };
  const origin = newRec.kind === 'once' ? 'oneoff' : 'recurring';

  next = mapMonths(next, (mm, k) => {
    const hasLine = mm.lines.some((l) => l.itemId === itemId);
    if (k < monthKey) {
      // History keeps its amounts; only the name follows (rename propagation).
      if (!hasLine || clean.label === undefined) return mm;
      return { ...mm, lines: mm.lines.map((l) => (l.itemId === itemId ? { ...l, label: clean.label! } : l)) };
    }
    if (k === monthKey) {
      return {
        ...mm,
        lines: mm.lines.map((l) => (l.id === lineId ? { ...patchLine(l, clean), origin } : l)),
        entries: clean.categoryId ? moveLineEntries(mm, lineId, clean.categoryId) : mm.entries,
      };
    }
    // Months already planned after this one.
    if (!mm.planCreated) return mm;
    const matches = recurrenceMatches(newRec, k);
    if (!hasLine) {
      if (!matches) return mm;
      const l: MonthLine = {
        id: generateId(),
        itemId,
        categoryId: updatedItem.categoryId,
        label: updatedItem.label,
        amount: updatedItem.amount,
        origin,
        order: mm.lines.length,
      };
      return { ...mm, lines: [...mm.lines, l] };
    }
    let lines = mm.lines;
    let entries = mm.entries;
    if (!matches) {
      lines = lines
        .filter((l) => l.itemId !== itemId || lineHasEntries(mm, l.id))
        .map((l) => (l.itemId === itemId ? { ...l, archived: true } : l));
    } else {
      lines = lines.map((l) => (l.itemId === itemId ? { ...patchLine(l, clean), origin } : l));
      if (clean.categoryId) {
        lines
          .filter((l) => l.itemId === itemId)
          .forEach((l) => (entries = moveLineEntries({ ...mm, entries }, l.id, clean.categoryId!)));
      }
    }
    return { ...mm, lines, entries };
  });
  return ok(next);
}

/**
 * Delete a month line.
 * - scope 'month': only this month's line goes (archived if it has entries).
 * - scope 'never' ("Ne plus jamais reporter"): the template stops; it is archived
 *   when it has entries anywhere, deleted otherwise. Past months are untouched.
 */
export function deleteLine(b: MemberBudget, monthKey: string, lineId: string, scope: 'month' | 'never'): OpResult {
  const m = b.months[monthKey];
  const line = m?.lines.find((l) => l.id === lineId);
  if (!m || !line) return fail('Ligne introuvable.');

  const dropOrArchive = (mm: MonthDoc, pred: (l: MonthLine) => boolean): MonthDoc => {
    if (!mm.lines.some(pred)) return mm;
    return {
      ...mm,
      lines: mm.lines
        .filter((l) => !pred(l) || lineHasEntries(mm, l.id))
        .map((l) => (pred(l) ? { ...l, archived: true } : l)),
    };
  };

  let next = setMonth(b, monthKey, dropOrArchive(m, (l) => l.id === lineId));
  let archived = lineHasEntries(m, lineId);

  if (scope === 'never' && line.itemId) {
    const itemId = line.itemId;
    const used = itemHasEntries(b, itemId);
    next = used
      ? { ...next, items: next.items.map((i) => (i.id === itemId ? { ...i, active: false, archived: true } : i)) }
      : { ...next, items: next.items.filter((i) => i.id !== itemId) };
    next = mapMonths(next, (mm, k) => (k > monthKey ? dropOrArchive(mm, (l) => l.itemId === itemId) : mm));
    archived = used;
  }
  return ok(next, { archived });
}

/** Reorder the lines of one rubric in a month; templates follow the new order. */
export function reorderLines(b: MemberBudget, monthKey: string, orderedLineIds: string[]): MemberBudget {
  const m = b.months[monthKey];
  if (!m) return b;
  const pos = new Map(orderedLineIds.map((id, i) => [id, i]));
  const itemOrder = new Map<string, number>();
  const lines = m.lines.map((l) => {
    if (!pos.has(l.id)) return l;
    const order = pos.get(l.id)!;
    if (l.itemId) itemOrder.set(l.itemId, order);
    return { ...l, order };
  });
  return {
    ...setMonth(b, monthKey, { ...m, lines }),
    items: b.items.map((i) => (itemOrder.has(i.id) ? { ...i, order: itemOrder.get(i.id)! } : i)),
  };
}

/* ------------------------------ entries ------------------------------ */

export function addEntry(b: MemberBudget, monthKey: string, entry: Entry): MemberBudget {
  const m = getMonth(b, monthKey);
  let next = setMonth(b, monthKey, { ...m, entries: [...m.entries, entry] });
  if (entry.lineId) {
    const line = m.lines.find((l) => l.id === entry.lineId);
    if (line?.debtId && entry.t !== 'in') {
      next = recordDebtPayment(next, line.debtId, { id: entry.id, date: entry.d, amt: entry.amt });
    }
  }
  return next;
}

/** Update an entry; if its budget month changed, it moves to the other month document. */
export function updateEntry(b: MemberBudget, fromMonth: string, toMonth: string, entry: Entry): MemberBudget {
  const from = getMonth(b, fromMonth);
  if (fromMonth === toMonth) {
    return setMonth(b, fromMonth, { ...from, entries: from.entries.map((e) => (e.id === entry.id ? entry : e)) });
  }
  const moved = setMonth(b, fromMonth, { ...from, entries: from.entries.filter((e) => e.id !== entry.id) });
  const to = getMonth(moved, toMonth);
  const lineOk = entry.lineId && to.lines.some((l) => l.id === entry.lineId);
  return setMonth(moved, toMonth, { ...to, entries: [...to.entries, lineOk ? entry : { ...entry, lineId: null }] });
}

export function deleteEntry(b: MemberBudget, monthKey: string, entryId: string): MemberBudget {
  const m = b.months[monthKey];
  if (!m) return b;
  const entry = m.entries.find((e) => e.id === entryId);
  let next = setMonth(b, monthKey, { ...m, entries: m.entries.filter((e) => e.id !== entryId) });
  if (entry?.debtId || entry?.lineId) {
    // Remove the matching payment from the carnet de dettes.
    next = {
      ...next,
      debts: next.debts.map((d) =>
        d.payments.some((p) => p.id === entryId)
          ? { ...d, payments: d.payments.filter((p) => p.id !== entryId), status: 'active' }
          : d
      ),
    };
  }
  return next;
}

/* ------------------------------- debts ------------------------------- */

/**
 * Add a debt to the carnet. "Je dois" debts get a line in the debts rubric of
 * the current month (the rubric is created if the user has none linked yet).
 */
export function addDebt(b: MemberBudget, debt: Debt, monthKey: string): OpResult {
  const person = validateName(debt.person, 'Le nom');
  if (!person.ok) return fail(person.error);
  const amt = validateAmount(debt.principal, false);
  if (!amt.ok || !amt.value) return fail(amt.ok ? 'Indiquez un montant.' : amt.error);
  let next: MemberBudget = { ...b, debts: [...b.debts, { ...debt, person: person.value, principal: amt.value }] };
  if (debt.direction !== 'i_owe') return ok(next, { id: debt.id });

  let cat = debtsCategory(next.categories);
  if (!cat) {
    const r = ensureCategory(next, { ...DEBTS_RUBRIC_DEFAULT, kind: 'out', linkedTo: 'debts' }, monthKey);
    if (!r.ok) return r;
    next = r.budget;
    cat = next.categories.find((c) => c.id === r.id)!;
  }
  if (cat.budgetMode === 'envelope') {
    const sw = setBudgetMode(next, cat.id, 'lines', monthKey);
    if (sw.ok) next = sw.budget;
  }
  const m = getMonth(next, monthKey);
  if (m.planCreated) {
    const line: MonthLine = {
      id: generateId(),
      categoryId: cat.id,
      label: person.value,
      amount: amt.value,
      origin: 'debt',
      debtId: debt.id,
      order: m.lines.filter((l) => l.categoryId === cat!.id).length,
    };
    next = setMonth(next, monthKey, { ...m, lines: [...m.lines, line] });
  }
  return ok(next, { id: debt.id });
}

export function recordDebtPayment(b: MemberBudget, debtId: string, payment: DebtPayment): MemberBudget {
  return {
    ...b,
    debts: b.debts.map((d) => {
      if (d.id !== debtId) return d;
      const payments = [...d.payments.filter((p) => p.id !== payment.id), payment];
      const updated: Debt = { ...d, payments };
      return debtRemaining(updated) === 0 ? { ...updated, status: 'settled' } : updated;
    }),
  };
}

export function removeDebt(b: MemberBudget, debtId: string): MemberBudget {
  return mapMonths({ ...b, debts: b.debts.filter((d) => d.id !== debtId) }, (m) =>
    m.lines.some((l) => l.debtId === debtId)
      ? {
          ...m,
          lines: m.lines
            .filter((l) => l.debtId !== debtId || lineHasEntries(m, l.id))
            .map((l) => (l.debtId === debtId ? { ...l, archived: true } : l)),
        }
      : m
  );
}
