/**
 * Pure helpers for syncing the shared household budget with Firestore.
 *
 * One budget for the household, stored as small documents:
 *   households/{hid}/categories/{id}      rubrics (shared)
 *   households/{hid}/items/{id}           line templates (shared)
 *   households/{hid}/debts/{id}           debts (shared)
 *   households/{hid}/commitments/{id}     regular commitments (shared)
 *   households/{hid}/months/{YYYY-MM}     the month plan: lines, envelopes (shared)
 *   households/{hid}/entries/{YYYY-MM}_{uid}   the operations one partner noted in a month
 *
 * Operations are split by author so two phones never overwrite each other's
 * writes. In memory they are merged back into `months[key].entries`, so the
 * whole app computes totals on one combined month.
 */
import { Entry, MemberBudget, MonthDoc } from './types';

export const BUDGET_COLLECTIONS = ['categories', 'items', 'debts', 'commitments'] as const;
export type BudgetCollection = (typeof BUDGET_COLLECTIONS)[number];

type WithId = { id: string };

export interface EntriesDoc {
  month: string;
  uid: string;
  entries: Entry[];
}

export function entriesDocId(month: string, uid: string): string {
  return `${month}_${uid}`;
}

export function parseEntriesDocId(id: string): { month: string; uid: string } | null {
  const m = id.match(/^(\d{4}-\d{2})_(.+)$/);
  return m ? { month: m[1], uid: m[2] } : null;
}

/** The shared part of a month (everything except the operations), or undefined when there is none. */
export function planOf(month: MonthDoc | undefined): Omit<MonthDoc, 'entries'> | undefined {
  if (!month) return undefined;
  const { entries: _entries, ...plan } = month;
  const hasEnvelopes = !!plan.envelopes && Object.keys(plan.envelopes).length > 0;
  if (!plan.planCreated && !plan.lines.length && !hasEnvelopes) return undefined;
  return plan;
}

function samePlan(a: MonthDoc | undefined, b: MonthDoc | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return !planOf(a) && !planOf(b);
  return (
    a.lines === b.lines &&
    a.envelopes === b.envelopes &&
    a.planCreated === b.planCreated &&
    a.createdAt === b.createdAt &&
    a.fromTemplate === b.fromTemplate
  );
}

export function entriesByAuthor(month: MonthDoc | undefined): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  (month?.entries || []).forEach((e) => {
    const k = e.by || '';
    const list = map.get(k);
    if (list) list.push(e);
    else map.set(k, [e]);
  });
  return map;
}

function sameEntries(a: Entry[] = [], b: Entry[] = []): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Document paths that differ between two budgets: "categories/abc", "months/2026-09", "entries/2026-09_uid". */
export function diffBudget(prev: MemberBudget, next: MemberBudget): string[] {
  const paths: string[] = [];
  BUDGET_COLLECTIONS.forEach((c) => {
    const a = prev[c] as WithId[];
    const b = next[c] as WithId[];
    if (a === b) return;
    const before = new Map(a.map((x) => [x.id, x]));
    const after = new Map(b.map((x) => [x.id, x]));
    after.forEach((v, id) => before.get(id) !== v && paths.push(`${c}/${id}`));
    before.forEach((_v, id) => !after.has(id) && paths.push(`${c}/${id}`));
  });
  if (prev.months !== next.months) {
    const keys = new Set([...Object.keys(prev.months), ...Object.keys(next.months)]);
    keys.forEach((k) => {
      const a = prev.months[k];
      const b = next.months[k];
      if (a === b) return;
      if (!samePlan(a, b)) paths.push(`months/${k}`);
      if (a?.entries === b?.entries) return;
      const ea = entriesByAuthor(a);
      const eb = entriesByAuthor(b);
      new Set([...ea.keys(), ...eb.keys()]).forEach((uid) => {
        if (uid && !sameEntries(ea.get(uid), eb.get(uid))) paths.push(`entries/${entriesDocId(k, uid)}`);
      });
    });
  }
  return paths;
}

/** Current value of a document path, or undefined when the document should not exist. */
export function valueAt(b: MemberBudget, path: string): Record<string, unknown> | undefined {
  const [coll, id] = path.split('/');
  if (coll === 'months') return planOf(b.months[id]) as Record<string, unknown> | undefined;
  if (coll === 'entries') {
    const parsed = parseEntriesDocId(id);
    if (!parsed) return undefined;
    const list = (b.months[parsed.month]?.entries || []).filter((e) => e.by === parsed.uid);
    return list.length ? ({ month: parsed.month, uid: parsed.uid, entries: list } as Record<string, unknown>) : undefined;
  }
  const list = b[coll as BudgetCollection] as WithId[] | undefined;
  return list?.find((x) => x.id === id) as Record<string, unknown> | undefined;
}

/** Copy the documents at `paths` from `source` into `target` (used by "Annuler"). */
export function restorePaths(target: MemberBudget, source: MemberBudget, paths: string[]): MemberBudget {
  let next = target;
  paths.forEach((path) => {
    const [coll, id] = path.split('/');

    if (coll === 'months') {
      const src = source.months[id];
      const cur = next.months[id];
      const entries = cur?.entries || [];
      const restored: MonthDoc = src ? { ...src, entries } : { lines: [], entries };
      if (!src) {
        delete (restored as Partial<MonthDoc>).planCreated;
        delete (restored as Partial<MonthDoc>).envelopes;
        delete (restored as Partial<MonthDoc>).createdAt;
        delete (restored as Partial<MonthDoc>).fromTemplate;
      }
      next = { ...next, months: { ...next.months, [id]: restored } };
      return;
    }

    if (coll === 'entries') {
      const parsed = parseEntriesDocId(id);
      if (!parsed) return;
      const cur = next.months[parsed.month] || { lines: [], entries: [] };
      const mine = (source.months[parsed.month]?.entries || []).filter((e) => e.by === parsed.uid);
      const others = cur.entries.filter((e) => e.by !== parsed.uid);
      next = { ...next, months: { ...next.months, [parsed.month]: { ...cur, entries: [...others, ...mine] } } };
      return;
    }

    const c = coll as BudgetCollection;
    const v = valueAt(source, path);
    const list = (next[c] as WithId[]).filter((x) => x.id !== id);
    if (v) {
      const origIndex = (source[c] as WithId[]).findIndex((x) => x.id === id);
      list.splice(Math.min(Math.max(origIndex, 0), list.length), 0, v as unknown as WithId);
    }
    next = { ...next, [c]: list };
  });
  return next;
}

/** Replace what one partner noted in a month (used when a snapshot arrives). */
export function setAuthorEntries(b: MemberBudget, month: string, uid: string, entries: Entry[]): MemberBudget {
  const cur = b.months[month] || { lines: [], entries: [] };
  const others = cur.entries.filter((e) => e.by !== uid);
  const merged = [...others, ...entries.map((e) => ({ ...e, by: uid }))];
  return { ...b, months: { ...b.months, [month]: { ...cur, entries: merged } } };
}

/** Replace the shared plan of a month, keeping the operations. */
export function setMonthPlan(b: MemberBudget, month: string, plan: Omit<MonthDoc, 'entries'> | null): MemberBudget {
  const cur = b.months[month] || { lines: [], entries: [] };
  const next: MonthDoc = plan ? { ...plan, lines: plan.lines || [], entries: cur.entries } : { lines: [], entries: cur.entries };
  return { ...b, months: { ...b.months, [month]: next } };
}

/** Remove undefined values (Firestore rejects them) and keep the payload small. */
export function toFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
