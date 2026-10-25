/**
 * Turns the budgets each partner built on their own (previous versions) into
 * ONE shared household budget. Same rubric name (case and accents ignored)
 * means the same rubric; same line name in the same rubric means the same
 * line. Every operation keeps its author. Nothing is deleted: the old
 * per-person documents stay in place as a backup.
 */
import { sortCategories } from './calc';
import { isLegacyMonth, migrateLegacy } from './migration';
import {
  BudgetItem,
  Category,
  Commitment,
  Debt,
  Entry,
  LegacyMonthData,
  MemberBudget,
  MonthDoc,
  MonthLine,
} from './types';
import { nameKey } from './validation';

export interface PersonalBudget {
  uid: string;
  categories: Category[];
  items: BudgetItem[];
  months: Record<string, MonthDoc>;
  debts: Debt[];
  commitments: Commitment[];
}

/** Raw documents of one partner, possibly still in the very first (name-based) format. */
export function readPersonalBudget(
  uid: string,
  raw: { categories: any[]; items: any[]; months: Record<string, any>; debts?: any[]; commitments?: any[] }
): PersonalBudget {
  const legacy: Record<string, LegacyMonthData> = {};
  const months: Record<string, MonthDoc> = {};
  Object.entries(raw.months).forEach(([k, d]) => {
    if (isLegacyMonth(d)) legacy[k] = d;
    else months[k] = { lines: [], entries: [], ...d };
  });
  let categories: Category[] = raw.categories;
  let items: BudgetItem[] = raw.items;
  if (Object.keys(legacy).length) {
    const m = migrateLegacy(legacy, { categories: raw.categories, items: raw.items });
    categories = m.categories;
    items = m.items;
    Object.assign(months, m.months);
  }
  return { uid, categories, items, months, debts: raw.debts || [], commitments: raw.commitments || [] };
}

export function hasPersonalData(p: PersonalBudget): boolean {
  return p.categories.length > 0 || Object.keys(p.months).length > 0 || p.debts.length > 0;
}

/** Merge the partners' own budgets, in household order (the creator first). */
export function mergeMemberBudgets(members: PersonalBudget[]): MemberBudget {
  const categories: Category[] = [];
  const catByKey = new Map<string, Category>();
  const catMap = new Map<string, string>();

  members.forEach((m) =>
    sortCategories(m.categories).forEach((c) => {
      const key = nameKey(c.name);
      let target = catByKey.get(key);
      if (!target) {
        target = { ...c, order: categories.length };
        categories.push(target);
        catByKey.set(key, target);
      } else {
        if (target.archived && !c.archived) target.archived = false;
        if (c.linkedTo && !target.linkedTo) target.linkedTo = c.linkedTo;
      }
      catMap.set(`${m.uid}:${c.id}`, target.id);
    })
  );

  const items: BudgetItem[] = [];
  const itemByKey = new Map<string, BudgetItem>();
  const itemMap = new Map<string, string>();
  members.forEach((m) =>
    [...m.items]
      .sort((a, b) => a.order - b.order)
      .forEach((it) => {
        const catId = catMap.get(`${m.uid}:${it.categoryId}`);
        if (!catId) return;
        const key = `${catId}|${nameKey(it.label)}|${it.recurrence.kind}`;
        let target = itemByKey.get(key);
        if (!target) {
          target = { ...it, categoryId: catId, order: items.length };
          items.push(target);
          itemByKey.set(key, target);
        }
        itemMap.set(`${m.uid}:${it.id}`, target.id);
      })
  );

  const months: Record<string, MonthDoc> = {};
  const lineMap = new Map<string, string>();
  const lineKey = (l: MonthLine) => `${l.categoryId}|${nameKey(l.label)}|${l.debtId || ''}`;

  members.forEach((m) =>
    Object.entries(m.months).forEach(([k, md]) => {
      const tm = months[k] || (months[k] = { lines: [], entries: [] });
      (md.lines || []).forEach((l) => {
        const catId = catMap.get(`${m.uid}:${l.categoryId}`);
        if (!catId) return;
        const key = `${catId}|${nameKey(l.label)}|${l.debtId || ''}`;
        const existing = tm.lines.find((x) => lineKey(x) === key);
        if (existing) {
          lineMap.set(`${m.uid}:${k}:${l.id}`, existing.id);
          return;
        }
        const line: MonthLine = { ...l, categoryId: catId, order: tm.lines.length };
        if (l.itemId) {
          const itemId = itemMap.get(`${m.uid}:${l.itemId}`);
          if (itemId) line.itemId = itemId;
          else delete line.itemId;
        }
        tm.lines.push(line);
        lineMap.set(`${m.uid}:${k}:${l.id}`, line.id);
      });
      Object.entries(md.envelopes || {}).forEach(([cid, v]) => {
        const nc = catMap.get(`${m.uid}:${cid}`);
        if (!nc) return;
        tm.envelopes = tm.envelopes || {};
        if (!(nc in tm.envelopes)) tm.envelopes[nc] = v;
      });
      if (md.planCreated) tm.planCreated = true;
      if (md.fromTemplate) tm.fromTemplate = true;
      if (md.createdAt) tm.createdAt = Math.min(tm.createdAt || md.createdAt, md.createdAt);
      (md.entries || []).forEach((e) => {
        const entry: Entry = {
          ...e,
          by: m.uid,
          categoryId: e.categoryId ? catMap.get(`${m.uid}:${e.categoryId}`) ?? null : null,
          lineId: e.lineId ? lineMap.get(`${m.uid}:${k}:${e.lineId}`) ?? null : null,
        };
        tm.entries.push(entry);
      });
    })
  );

  const debtIds = new Set<string>();
  const debts: Debt[] = [];
  members.forEach((m) =>
    m.debts.forEach((d) => {
      if (debtIds.has(d.id)) return;
      debtIds.add(d.id);
      debts.push(d);
    })
  );

  const commitIds = new Set<string>();
  const commitments: Commitment[] = [];
  members.forEach((m) =>
    m.commitments.forEach((c) => {
      if (commitIds.has(c.id)) return;
      commitIds.add(c.id);
      const categoryId = catMap.get(`${m.uid}:${c.categoryId}`) || c.categoryId;
      const next: Commitment = { ...c, categoryId };
      if (c.itemId) {
        const itemId = itemMap.get(`${m.uid}:${c.itemId}`);
        if (itemId) next.itemId = itemId;
        else delete next.itemId;
      }
      commitments.push(next);
    })
  );

  return { categories, items, debts, commitments, provisions: [], goals: [], tontines: [], shopping: [], months };
}
