/**
 * Pure helpers for syncing a member budget with Firestore: every rubric, item,
 * debt and commitment is one document, every month is one document. A change
 * is written as the set of documents whose object reference changed.
 */
import { MemberBudget, MonthDoc } from './types';

export const BUDGET_COLLECTIONS = ['categories', 'items', 'debts', 'commitments'] as const;
export type BudgetCollection = (typeof BUDGET_COLLECTIONS)[number];

type WithId = { id: string };

/** Paths such as "categories/abc" or "months/2026-09" that differ between two budgets. */
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
    Object.keys(next.months).forEach((k) => prev.months[k] !== next.months[k] && paths.push(`months/${k}`));
    Object.keys(prev.months).forEach((k) => !(k in next.months) && paths.push(`months/${k}`));
  }
  return paths;
}

/** Current value of a document path, or undefined when it was deleted. */
export function valueAt(b: MemberBudget, path: string): WithId | MonthDoc | undefined {
  const [coll, id] = path.split('/');
  if (coll === 'months') return b.months[id];
  const list = b[coll as BudgetCollection] as WithId[] | undefined;
  return list?.find((x) => x.id === id);
}

/** Copy the documents at `paths` from `source` into `target` (used by "Annuler"). */
export function restorePaths(target: MemberBudget, source: MemberBudget, paths: string[]): MemberBudget {
  let next = target;
  paths.forEach((path) => {
    const [coll, id] = path.split('/');
    const v = valueAt(source, path);
    if (coll === 'months') {
      const months = { ...next.months };
      if (v) months[id] = v as MonthDoc;
      else delete months[id];
      next = { ...next, months };
      return;
    }
    const c = coll as BudgetCollection;
    const list = (next[c] as WithId[]).filter((x) => x.id !== id);
    if (v) {
      const origIndex = (source[c] as WithId[]).findIndex((x) => x.id === id);
      list.splice(Math.min(Math.max(origIndex, 0), list.length), 0, v as WithId);
    }
    next = { ...next, [c]: list };
  });
  return next;
}

/** Remove undefined values (Firestore rejects them) and keep the payload small. */
export function toFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
