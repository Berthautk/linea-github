/**
 * Conversion of the old storage format (months with `plan` lines grouped by a
 * rubric NAME and entries pointing to plan lines with `p`) into the dynamic
 * model: categories, items and month lines. Nothing is dropped: every plan
 * line becomes a month line with the same id, so every entry keeps its link.
 */
import { generateId } from './budget-math';
import { styleForRubric } from './importer';
import { templateOnceLabels } from './templates';
import {
  BudgetItem,
  Category,
  CategoryKind,
  Entry,
  LegacyEntry,
  LegacyMonthData,
  MemberBudget,
  MonthDoc,
  MonthLine,
} from './types';
import { clampAmount, cleanName, nameKey } from './validation';

/** Look of the rubrics of the previous version, so migrated rubrics keep their icon and colour. */
const LEGACY_STYLES: Record<string, { icon: string; color: string }> = {
  revenus: { icon: 'Wallet', color: '#12A150' },
  logement: { icon: 'House', color: '#2563EB' },
  enfants: { icon: 'GraduationCap', color: '#7C3AED' },
  maison: { icon: 'Sparkles', color: '#0D9488' },
  'soutien famille': { icon: 'HeartHandshake', color: '#E11D48' },
  sante: { icon: 'Pill', color: '#DC2626' },
  transport: { icon: 'Bike', color: '#D97706' },
  repas: { icon: 'UtensilsCrossed', color: '#EA580C' },
  dettes: { icon: 'Receipt', color: '#4F46E5' },
  frais: { icon: 'Percent', color: '#64748B' },
  provisions: { icon: 'PiggyBank', color: '#059669' },
  tontine: { icon: 'Users', color: '#6366F1' },
  autres: { icon: 'Shapes', color: '#475569' },
};

export function isLegacyMonth(doc: unknown): doc is LegacyMonthData {
  const d = doc as Record<string, unknown> | null;
  return !!d && Array.isArray(d.plan) && !Array.isArray(d.lines);
}

export function hasLegacyData(months: Record<string, unknown>): boolean {
  return Object.values(months).some(isLegacyMonth);
}

function convertEntry(e: LegacyEntry, line: MonthLine | undefined): Entry {
  const { p: _p, l, g: _g, ...rest } = e as LegacyEntry & { g?: string };
  const t = e.t === 'in' || e.t === 'save' ? e.t : 'out';
  const out: Entry = {
    ...(rest as Omit<Entry, 'categoryId' | 'lineId' | 'label'>),
    t,
    amt: clampAmount(e.amt),
    categoryId: line ? line.categoryId : null,
    lineId: line ? line.id : null,
    label: cleanName(String(l || '')) || line?.label || '',
  };
  return out;
}

/**
 * Convert legacy months. Rubrics come from the plan line groups, items from
 * the latest planned month (as "Chaque mois", to be corrected in the next
 * month review), except lines of the old seeded sheet that the example
 * template marks "Ce mois seulement".
 */
export function migrateLegacy(
  legacy: Record<string, LegacyMonthData>,
  existing: Partial<MemberBudget> = {},
  now = Date.now()
): Pick<MemberBudget, 'categories' | 'items' | 'months'> {
  const keys = Object.keys(legacy).sort();
  const categories: Category[] = [...(existing.categories || [])];
  const catByKey = new Map(categories.map((c) => [nameKey(c.name), c]));
  const kindVotes = new Map<string, Record<CategoryKind, number>>();

  // 1. Rubrics, in order of first appearance.
  keys.forEach((k) =>
    (legacy[k].plan || []).forEach((p) => {
      const name = cleanName(p.g) || 'Autres';
      const key = nameKey(name);
      const votes = kindVotes.get(key) || { in: 0, out: 0, save: 0 };
      votes[p.t === 'in' || p.t === 'save' ? p.t : 'out']++;
      kindVotes.set(key, votes);
      if (catByKey.has(key)) return;
      const style = LEGACY_STYLES[key] || styleForRubric(name, categories.length);
      const cat: Category = {
        id: generateId(),
        name,
        icon: style.icon,
        color: style.color,
        order: categories.length,
        kind: 'out',
        budgetMode: 'lines',
        archived: false,
        createdAt: now,
      };
      if (key === 'dettes') cat.linkedTo = 'debts';
      categories.push(cat);
      catByKey.set(key, cat);
    })
  );
  categories.forEach((c) => {
    const v = kindVotes.get(nameKey(c.name));
    if (!v) return;
    c.kind = v.in > v.out && v.in >= v.save ? 'in' : v.save > v.out ? 'save' : 'out';
  });

  // 2. Items from the latest month that has a plan.
  const latest = [...keys].reverse().find((k) => (legacy[k].plan || []).length > 0);
  const items: BudgetItem[] = [...(existing.items || [])];
  const itemByKey = new Map<string, BudgetItem>();
  const once = templateOnceLabels();
  if (latest) {
    const firstSeen = new Map<string, string>();
    keys.forEach((k) =>
      (legacy[k].plan || []).forEach((p) => {
        const key = `${nameKey(p.g)}::${nameKey(p.l)}`;
        if (!firstSeen.has(key)) firstSeen.set(key, k);
      })
    );
    legacy[latest].plan.forEach((p, i) => {
      const cat = catByKey.get(nameKey(cleanName(p.g) || 'Autres'))!;
      const key = `${nameKey(p.g)}::${nameKey(p.l)}`;
      if (itemByKey.has(key)) return;
      const isOnce = !!legacy[latest].seeded && once.has(nameKey(p.l));
      const item: BudgetItem = {
        id: generateId(),
        categoryId: cat.id,
        label: cleanName(p.l) || 'Ligne',
        amount: p.a ? clampAmount(p.a) : null,
        recurrence: isOnce ? { kind: 'once', month: latest } : { kind: 'monthly', startMonth: firstSeen.get(key) },
        active: true,
        order: i,
        archived: false,
      };
      items.push(item);
      itemByKey.set(key, item);
    });
  }

  // 3. Month documents: same line ids, so entries keep their links.
  const months: Record<string, MonthDoc> = {};
  keys.forEach((k) => {
    const old = legacy[k];
    const lines: MonthLine[] = (old.plan || []).map((p, i) => {
      const cat = catByKey.get(nameKey(cleanName(p.g) || 'Autres'))!;
      const item = itemByKey.get(`${nameKey(p.g)}::${nameKey(p.l)}`);
      const inTemplate = item && (item.recurrence.kind !== 'once' || item.recurrence.month === k);
      const line: MonthLine = {
        id: p.id || generateId(),
        categoryId: cat.id,
        label: cleanName(p.l) || 'Ligne',
        amount: p.a ? clampAmount(p.a) : null,
        origin: inTemplate ? (item!.recurrence.kind === 'once' ? 'oneoff' : 'recurring') : 'manual',
        order: i,
      };
      if (inTemplate) line.itemId = item!.id;
      return line;
    });
    const lineById = new Map(lines.map((l) => [l.id, l]));
    const doc: MonthDoc = {
      lines,
      entries: (old.entries || []).map((e) => convertEntry(e, e.p ? lineById.get(e.p) : undefined)),
      planCreated: lines.length > 0,
      createdAt: old.updated || now,
    };
    if (old.seeded) doc.fromTemplate = true;
    months[k] = doc;
  });

  return { categories, items, months };
}
