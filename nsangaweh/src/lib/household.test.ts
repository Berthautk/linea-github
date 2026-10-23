import { describe, expect, it } from 'vitest';
import { addEntry, addLine, createCategory, EMPTY_BUDGET, OpResult, updateCategory } from './budget-ops';
import { calcMonth } from './calc';
import { mergeMemberBudgets, PersonalBudget, readPersonalBudget } from './household';
import { diffBudget, entriesDocId, restorePaths, setAuthorEntries, setMonthPlan, valueAt } from './sync';
import { Category, Entry, MemberBudget, MonthDoc } from './types';

const OCT = '2026-10';
const EMMA = 'emma';
const EUGE = 'euge';

function must(r: OpResult): MemberBudget {
  if (!r.ok) throw new Error(r.error);
  return r.budget;
}

const cat = (id: string, name: string, order: number, kind: Category['kind'] = 'out'): Category => ({
  id,
  name,
  icon: 'Shapes',
  color: '#475569',
  order,
  kind,
  budgetMode: 'lines',
  archived: false,
  createdAt: 0,
});

let n = 0;
const entry = (p: Partial<Entry> & Pick<Entry, 't' | 'amt'>): Entry => ({
  id: `e${++n}`,
  d: '2026-10-10',
  ts: n,
  categoryId: null,
  lineId: null,
  label: '',
  w: 'wallet-cash',
  ...p,
});

function twoPeople(): PersonalBudget[] {
  const emma: PersonalBudget = {
    uid: EMMA,
    categories: [cat('c-log', 'Logement', 0), cat('c-san', 'Santé', 1), cat('c-rev', 'Revenus', 2, 'in')],
    items: [
      { id: 'i-loyer', categoryId: 'c-log', label: 'Loyer', amount: 50000, recurrence: { kind: 'monthly' }, active: true, order: 0, archived: false },
    ],
    months: {
      [OCT]: {
        planCreated: true,
        lines: [
          { id: 'l-loyer', itemId: 'i-loyer', categoryId: 'c-log', label: 'Loyer', amount: 50000, origin: 'recurring' },
          { id: 'l-remede', categoryId: 'c-san', label: 'Remède', amount: 12000, origin: 'oneoff' },
        ],
        entries: [
          entry({ t: 'out', amt: 20000, categoryId: 'c-log', lineId: 'l-loyer' }),
          entry({ t: 'in', amt: 122000, categoryId: 'c-rev' }),
        ],
      },
    },
    debts: [],
    commitments: [],
  };
  const euge: PersonalBudget = {
    uid: EUGE,
    categories: [cat('x-san', 'SANTE', 0), cat('x-tra', 'Transport', 1)],
    items: [],
    months: {
      [OCT]: {
        planCreated: true,
        lines: [
          { id: 'x-remede', categoryId: 'x-san', label: 'remède', amount: 9999, origin: 'oneoff' },
          { id: 'x-taxi', categoryId: 'x-tra', label: 'Taxi', amount: 3000, origin: 'oneoff' },
        ],
        entries: [entry({ t: 'out', amt: 5000, categoryId: 'x-san', lineId: 'x-remede' })],
      },
    },
    debts: [],
    commitments: [],
  };
  return [emma, euge];
}

describe('One shared household budget', () => {
  it('merges the partners’ own budgets: same names mean the same rubric and line', () => {
    const merged = mergeMemberBudgets(twoPeople());
    expect(merged.categories.map((c) => c.name)).toEqual(['Logement', 'Santé', 'Revenus', 'Transport']);
    const oct = merged.months[OCT];
    expect(oct.lines.map((l) => l.label)).toEqual(['Loyer', 'Remède', 'Taxi']);
    expect(oct.lines.find((l) => l.label === 'Remède')!.amount).toBe(12000); // the creator's amount wins
    expect(merged.items).toHaveLength(1);
    expect(oct.lines[0].itemId).toBe('i-loyer');
  });

  it('keeps every operation with its author and relinks it to the shared rubric and line', () => {
    const merged = mergeMemberBudgets(twoPeople());
    const oct = merged.months[OCT];
    expect(oct.entries.map((e) => e.by).sort()).toEqual([EMMA, EMMA, EUGE]);
    const remede = oct.lines.find((l) => l.label === 'Remède')!;
    const eugenie = oct.entries.find((e) => e.by === EUGE)!;
    expect(eugenie.lineId).toBe(remede.id);
    expect(eugenie.categoryId).toBe(merged.categories.find((c) => c.name === 'Santé')!.id);
  });

  it('adds the entries of both partners into the same totals', () => {
    const merged = mergeMemberBudgets(twoPeople());
    const c = calcMonth(merged.categories, merged.months[OCT], OCT);
    expect(c.inc).toBe(122000);
    expect(c.out).toBe(25000);
    expect(c.byLine[merged.months[OCT].lines.find((l) => l.label === 'Remède')!.id]).toBe(5000);
  });

  it('converts a partner who still used the very first name-based format', () => {
    const p = readPersonalBudget('old', {
      categories: [],
      items: [],
      months: {
        [OCT]: {
          plan: [{ id: 'p1', g: 'Logement', l: 'Loyer', a: 50000, t: 'out' }],
          entries: [{ id: 'x', d: '2026-10-02', ts: 1, t: 'out', amt: 50000, p: 'p1', l: '', w: 'wallet-cash' }],
        },
      },
    });
    const merged = mergeMemberBudgets([p]);
    expect(merged.months[OCT].entries[0]).toMatchObject({ by: 'old', lineId: 'p1' });
  });

  it('renaming a rubric is seen by both partners (one shared rubric)', () => {
    let b = mergeMemberBudgets(twoPeople());
    const san = b.categories.find((c) => c.name === 'Santé')!;
    b = must(updateCategory(b, san.id, { name: 'Soins' }));
    expect(b.categories.filter((c) => c.name === 'Soins')).toHaveLength(1);
    expect(b.categories.some((c) => c.name === 'Santé')).toBe(false);
  });
});

describe('Syncing a shared budget between two phones', () => {
  function shared(): MemberBudget {
    let b = must(createCategory(EMPTY_BUDGET, { name: 'Logement', icon: 'House', color: '#2563EB', kind: 'out' }, OCT));
    const log = b.categories[0].id;
    b = must(addLine(b, OCT, { categoryId: log, label: 'Loyer', amount: 50000, recurrence: { kind: 'monthly', startMonth: OCT } }));
    return b;
  }

  it('writes only what changed: my entry goes to my own document, the plan stays shared', () => {
    const b = shared();
    const log = b.categories[0].id;
    const next = addEntry(b, OCT, entry({ t: 'out', amt: 1000, categoryId: log, by: EMMA }));
    expect(diffBudget(b, next)).toEqual([`entries/${entriesDocId(OCT, EMMA)}`]);

    const edited = must(addLine(next, OCT, { categoryId: log, label: 'Eau', amount: 5000, recurrence: { kind: 'once', month: OCT } }));
    expect(diffBudget(next, edited)).toEqual([`months/${OCT}`]);
  });

  it('one partner adding an entry never touches the other partner’s documents', () => {
    let b = shared();
    b = setAuthorEntries(b, OCT, EUGE, [entry({ t: 'out', amt: 700 })]);
    const mine = addEntry(b, OCT, entry({ t: 'in', amt: 9000, by: EMMA }));
    expect(diffBudget(b, mine)).toEqual([`entries/${entriesDocId(OCT, EMMA)}`]);
    expect(valueAt(mine, `entries/${entriesDocId(OCT, EUGE)}`)!.entries).toHaveLength(1);
  });

  it('a partner’s snapshot replaces only their operations and keeps mine and the plan', () => {
    let b = addEntry(shared(), OCT, entry({ t: 'in', amt: 10000, by: EMMA }));
    b = setAuthorEntries(b, OCT, EUGE, [entry({ t: 'in', amt: 5000 })]);
    const c = calcMonth(b.categories, b.months[OCT]);
    expect(c.inc).toBe(15000); // 10 000 + 5 000: the entries of both add up for the household
    b = setAuthorEntries(b, OCT, EUGE, []);
    expect(calcMonth(b.categories, b.months[OCT]).inc).toBe(10000);
    expect(b.months[OCT].lines).toHaveLength(1);
  });

  it('a partner’s plan snapshot keeps the operations already in the month', () => {
    let b = addEntry(shared(), OCT, entry({ t: 'in', amt: 10000, by: EMMA }));
    const plan = { lines: [], planCreated: true };
    b = setMonthPlan(b, OCT, plan);
    expect(b.months[OCT].entries).toHaveLength(1);
    expect(b.months[OCT].lines).toHaveLength(0);
  });

  it('"Annuler" restores my entry without touching the partner’s', () => {
    let before = shared();
    before = setAuthorEntries(before, OCT, EUGE, [entry({ t: 'out', amt: 300 })]);
    const after = addEntry(before, OCT, entry({ t: 'out', amt: 1000, by: EMMA }));
    const partnerAddedLater = setAuthorEntries(after, OCT, EUGE, [entry({ t: 'out', amt: 300 }), entry({ t: 'out', amt: 400 })]);
    const undone = restorePaths(partnerAddedLater, before, [`entries/${entriesDocId(OCT, EMMA)}`]);
    const m: MonthDoc = undone.months[OCT];
    expect(m.entries.filter((e) => e.by === EMMA)).toHaveLength(0);
    expect(m.entries.filter((e) => e.by === EUGE)).toHaveLength(2);
  });

  it('does not write an empty plan document for a month that only has operations', () => {
    const b = addEntry(EMPTY_BUDGET, OCT, entry({ t: 'in', amt: 1, by: EMMA }));
    expect(diffBudget(EMPTY_BUDGET, b)).toEqual([`entries/${entriesDocId(OCT, EMMA)}`]);
    expect(valueAt(b, `months/${OCT}`)).toBeUndefined();
  });
});
