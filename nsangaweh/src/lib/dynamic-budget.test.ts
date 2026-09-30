import { describe, expect, it } from 'vitest';
import {
  addDebt,
  addEntry,
  addLine,
  createCategory,
  deleteCategory,
  deleteLine,
  editLine,
  editNeedsScope,
  EMPTY_BUDGET,
  moveCategoryEntries,
  OpResult,
  setBudgetMode,
  updateCategory,
} from './budget-ops';
import { calcMonth, describeEntry } from './calc';
import { addMerge, aggregateFamily, suggestMerges } from './family';
import { applyImport, parseBudgetSheet } from './importer';
import { hasLegacyData, migrateLegacy } from './migration';
import { applyMonthReview, buildMonthReview, generateMonthDoc } from './plan';
import { recurrenceMatches } from './recurrence';
import { applyTemplate, TEMPLATE_SEPTEMBER_2026 } from './templates';
import { Category, Entry, LegacyMonthData, MemberBudget, MemberData, MonthDoc } from './types';
import { cleanName, validateAmount, validateCategoryName } from './validation';

const SEP = '2026-09';
const OCT = '2026-10';

function must(r: OpResult): MemberBudget {
  if (!r.ok) throw new Error(r.error);
  return r.budget;
}

function withId(r: OpResult): { b: MemberBudget; id: string } {
  if (!r.ok) throw new Error(r.error);
  return { b: r.budget, id: r.id! };
}

let seq = 0;
function entry(p: Partial<Entry> & Pick<Entry, 't' | 'amt'>): Entry {
  seq++;
  return {
    id: `e${seq}`,
    d: `${SEP}-10`,
    ts: seq,
    categoryId: null,
    lineId: null,
    label: '',
    w: 'cash',
    ...p,
  };
}

function rubric(b: MemberBudget, name: string, extra: Partial<Parameters<typeof createCategory>[1]> = {}, month = SEP) {
  return withId(createCategory(b, { name, icon: 'Shapes', color: '#475569', kind: 'out', ...extra }, month));
}

function lineOf(b: MemberBudget, month: string, label: string) {
  return b.months[month]?.lines.find((l) => l.label === label && !l.archived);
}

describe('Recurrence rules', () => {
  it('monthly, with optional start and end months', () => {
    expect(recurrenceMatches({ kind: 'monthly' }, '2027-03')).toBe(true);
    const bounded = { kind: 'monthly' as const, startMonth: '2026-10', endMonth: '2026-12' };
    expect(recurrenceMatches(bounded, SEP)).toBe(false);
    expect(recurrenceMatches(bounded, OCT)).toBe(true);
    expect(recurrenceMatches(bounded, '2026-12')).toBe(true);
    expect(recurrenceMatches(bounded, '2027-01')).toBe(false);
  });

  it('every N months from the start month', () => {
    const rec = { kind: 'everyNMonths' as const, n: 3, startMonth: '2026-08' };
    expect(recurrenceMatches(rec, '2026-08')).toBe(true);
    expect(recurrenceMatches(rec, SEP)).toBe(false);
    expect(recurrenceMatches(rec, '2026-11')).toBe(true);
    expect(recurrenceMatches(rec, '2027-02')).toBe(true);
    expect(recurrenceMatches(rec, '2026-05')).toBe(false);
  });

  it('certain months (school fee tranches in September, January and April)', () => {
    const rec = { kind: 'months' as const, months: [9, 1, 4] };
    expect(['2026-09', '2027-01', '2027-04'].every((m) => recurrenceMatches(rec, m))).toBe(true);
    expect(recurrenceMatches(rec, OCT)).toBe(false);
  });

  it('yearly and once', () => {
    expect(recurrenceMatches({ kind: 'yearly', month: 12 }, '2026-12')).toBe(true);
    expect(recurrenceMatches({ kind: 'yearly', month: 12 }, '2026-11')).toBe(false);
    expect(recurrenceMatches({ kind: 'once', month: SEP }, SEP)).toBe(true);
    expect(recurrenceMatches({ kind: 'once', month: SEP }, OCT)).toBe(false);
  });
});

describe('Month plan generation', () => {
  function sample() {
    let { b, id: log } = rubric(EMPTY_BUDGET, 'Logement');
    const r2 = rubric(b, 'Enfants');
    b = r2.b;
    const kids = r2.id;
    b = must(addLine(b, SEP, { categoryId: log, label: 'Loyer', amount: 50000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    b = must(addLine(b, SEP, { categoryId: kids, label: 'Scolarité', amount: 120000, recurrence: { kind: 'once', month: SEP } }));
    b = must(
      addLine(b, SEP, { categoryId: kids, label: 'Tranche école', amount: 40000, recurrence: { kind: 'months', months: [9, 1, 4], startMonth: SEP } })
    );
    b = must(addLine(b, SEP, { categoryId: log, label: 'Assurance', amount: 30000, recurrence: { kind: 'yearly', month: 1, startMonth: SEP } }));
    return { b, log, kids };
  }

  it('each month gets only the lines whose recurrence matches', () => {
    const { b } = sample();
    const oct = generateMonthDoc(b, OCT);
    expect(oct.lines.map((l) => l.label).sort()).toEqual(['Loyer']);
    const jan = generateMonthDoc(b, '2027-01');
    expect(jan.lines.map((l) => l.label).sort()).toEqual(['Assurance', 'Loyer', 'Tranche école']);
    expect(oct.planCreated).toBe(true);
  });

  it('a "Ce mois seulement" line never appears in later months (the 120 000 problem)', () => {
    const { b } = sample();
    for (const m of [OCT, '2026-11', '2027-09']) {
      expect(generateMonthDoc(b, m).lines.some((l) => l.label === 'Scolarité')).toBe(false);
    }
  });

  it('never generates lines before a rubric or line started', () => {
    const { b } = sample();
    expect(generateMonthDoc(b, '2026-08').lines).toHaveLength(0);
  });

  it('archived rubrics are left out of new months', () => {
    const { b, log } = sample();
    const archived: MemberBudget = { ...b, categories: b.categories.map((c) => (c.id === log ? { ...c, archived: true } : c)) };
    expect(generateMonthDoc(archived, OCT).lines).toHaveLength(0);
  });
});

describe('Month review ("Préparer octobre")', () => {
  it('copies monthly lines, not last month one-offs, and offers the unpaid remainder', () => {
    let { b, id: log } = rubric(EMPTY_BUDGET, 'Logement');
    b = must(addLine(b, SEP, { categoryId: log, label: 'Loyer', amount: 50000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    b = must(addLine(b, SEP, { categoryId: log, label: 'Peinture', amount: 20000, recurrence: { kind: 'once', month: SEP } }));
    const loyer = lineOf(b, SEP, 'Loyer')!;
    b = addEntry(b, SEP, entry({ t: 'out', amt: 30000, categoryId: log, lineId: loyer.id }));

    const review = buildMonthReview(b, OCT);
    expect(review.recurring.map((r) => [r.label, r.include])).toEqual([['Loyer', true]]);
    expect(review.lastOneoffs.map((r) => [r.label, r.include])).toEqual([['Peinture', false]]);
    const unpaidLoyer = review.unpaid.find((r) => r.label.startsWith('Loyer'))!;
    expect(unpaidLoyer.amount).toBe(20000);
    expect(unpaidLoyer.include).toBe(false);

    const byDefault = applyMonthReview(review);
    expect(byDefault.lines.map((l) => l.label)).toEqual(['Loyer']);

    unpaidLoyer.include = true;
    review.lastOneoffs[0].include = true;
    const chosen = applyMonthReview(review);
    expect(chosen.lines.map((l) => [l.label, l.amount, l.origin])).toEqual([
      ['Loyer', 50000, 'recurring'],
      ['Peinture', 20000, 'oneoff'],
      ['Loyer (reste)', 20000, 'oneoff'],
    ]);
  });

  it('rolls an envelope over only when the option is on', () => {
    let { b, id: food } = rubric(EMPTY_BUDGET, 'Repas', { budgetMode: 'envelope', envelopeAmount: 50000 });
    b = { ...b, months: { [SEP]: { lines: [], entries: [], planCreated: true, envelopes: { [food]: 50000 } } } };
    b = addEntry(b, SEP, entry({ t: 'out', amt: 35000, categoryId: food }));
    expect(buildMonthReview(b, OCT).envelopes[0].amount).toBe(50000);
    const rolled = buildMonthReview(b, OCT, { rollover: true }).envelopes[0];
    expect(rolled.rollover).toBe(15000);
    expect(rolled.amount).toBe(65000);
  });
});

describe('Editing and deleting lines', () => {
  function planned() {
    let { b, id: log } = rubric(EMPTY_BUDGET, 'Logement');
    b = must(addLine(b, SEP, { categoryId: log, label: 'Loyer', amount: 50000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    b = { ...b, months: { ...b.months, [OCT]: generateMonthDoc(b, OCT) } };
    return { b, log };
  }

  it('"Seulement ce mois" changes only this month', () => {
    const { b } = planned();
    const line = lineOf(b, SEP, 'Loyer')!;
    expect(editNeedsScope(b, SEP, line.id, { amount: 60000 })).toBe(true);
    const next = must(editLine(b, SEP, line.id, { amount: 60000 }, 'month'));
    expect(lineOf(next, SEP, 'Loyer')!.amount).toBe(60000);
    expect(lineOf(next, OCT, 'Loyer')!.amount).toBe(50000);
    expect(next.items[0].amount).toBe(50000);
    expect(generateMonthDoc(next, '2026-11').lines[0].amount).toBe(50000);
  });

  it('"Ce mois et les suivants" updates the template, this month and planned later months', () => {
    const { b } = planned();
    const line = lineOf(b, SEP, 'Loyer')!;
    const next = must(editLine(b, SEP, line.id, { amount: 60000 }, 'following'));
    expect(lineOf(next, SEP, 'Loyer')!.amount).toBe(60000);
    expect(lineOf(next, OCT, 'Loyer')!.amount).toBe(60000);
    expect(next.items[0].amount).toBe(60000);
    expect(generateMonthDoc(next, '2026-11').lines[0].amount).toBe(60000);
  });

  it('marking a recurring line "Ce mois seulement" stops it in one step', () => {
    const { b } = planned();
    const line = lineOf(b, SEP, 'Loyer')!;
    const next = must(editLine(b, SEP, line.id, { recurrence: { kind: 'once', month: SEP } }, 'month'));
    expect(lineOf(next, SEP, 'Loyer')!.origin).toBe('oneoff');
    expect(lineOf(next, OCT, 'Loyer')).toBeUndefined();
    expect(generateMonthDoc(next, '2026-11').lines).toHaveLength(0);
  });

  it('a one-off line becomes recurring when set to "Chaque mois"', () => {
    let { b, id: log } = rubric(EMPTY_BUDGET, 'Logement');
    b = must(addLine(b, SEP, { categoryId: log, label: 'Gaz', amount: 8000, recurrence: { kind: 'once', month: SEP } }));
    expect(b.items).toHaveLength(0);
    const line = lineOf(b, SEP, 'Gaz')!;
    b = must(editLine(b, SEP, line.id, { recurrence: { kind: 'monthly', startMonth: SEP } }, 'month'));
    expect(b.items).toHaveLength(1);
    expect(generateMonthDoc(b, OCT).lines[0].label).toBe('Gaz');
  });

  it('"Seulement ce mois" delete removes only this month line', () => {
    const { b } = planned();
    const line = lineOf(b, SEP, 'Loyer')!;
    const next = must(deleteLine(b, SEP, line.id, 'month'));
    expect(lineOf(next, SEP, 'Loyer')).toBeUndefined();
    expect(lineOf(next, OCT, 'Loyer')).toBeDefined();
    expect(generateMonthDoc(next, '2026-11').lines).toHaveLength(1);
  });

  it('"Ne plus jamais reporter" archives a used template and keeps history', () => {
    const { b, log } = planned();
    const sepLine = lineOf(b, SEP, 'Loyer')!;
    const withPayment = addEntry(b, SEP, entry({ t: 'out', amt: 50000, categoryId: log, lineId: sepLine.id }));
    const octLine = lineOf(withPayment, OCT, 'Loyer')!;
    const r = deleteLine(withPayment, OCT, octLine.id, 'never');
    const next = must(r);
    expect(r.ok && r.archived).toBe(true);
    expect(next.items[0].archived).toBe(true);
    expect(lineOf(next, SEP, 'Loyer')).toBeDefined(); // history untouched
    expect(next.months[SEP].entries).toHaveLength(1);
    expect(generateMonthDoc(next, '2026-11').lines).toHaveLength(0);
  });

  it('a template never used is deleted fully', () => {
    const { b } = planned();
    const line = lineOf(b, OCT, 'Loyer')!;
    const next = must(deleteLine(b, OCT, line.id, 'never'));
    expect(next.items).toHaveLength(0);
  });
});

describe('Rubrics: rename, delete safety, modes, duplicates', () => {
  it('renaming a rubric or a line propagates to history (ids, not names)', () => {
    let { b, id: fam } = rubric(EMPTY_BUDGET, 'Soutien famille');
    b = must(addLine(b, SEP, { categoryId: fam, label: 'Maman', amount: 10000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    const line = lineOf(b, SEP, 'Maman')!;
    b = addEntry(b, SEP, entry({ t: 'out', amt: 10000, categoryId: fam, lineId: line.id, label: 'Maman' }));
    b = { ...b, months: { ...b.months, [OCT]: generateMonthDoc(b, OCT) } };

    b = must(updateCategory(b, fam, { name: 'Aide famille' }));
    const octLine = lineOf(b, OCT, 'Maman')!;
    b = must(editLine(b, OCT, octLine.id, { label: 'Maman Rose' }, 'following'));

    const shown = describeEntry(b.months[SEP].entries[0], b.categories, b.months[SEP]);
    expect(shown.category?.name).toBe('Aide famille');
    expect(shown.label).toBe('Maman Rose');
  });

  it('a rubric without entries is deleted, one with entries is archived', () => {
    let { b, id: a } = rubric(EMPTY_BUDGET, 'Loisirs');
    const r2 = rubric(b, 'Santé');
    b = r2.b;
    b = must(addLine(b, SEP, { categoryId: a, label: 'Cinéma', amount: 5000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    b = addEntry(b, SEP, entry({ t: 'out', amt: 3000, categoryId: r2.id }));

    const del = deleteCategory(b, a);
    expect(del.ok && del.archived).toBe(false);
    const afterDel = must(del);
    expect(afterDel.categories.some((c) => c.id === a)).toBe(false);
    expect(afterDel.items).toHaveLength(0);
    expect(afterDel.months[SEP].lines).toHaveLength(0);

    const arch = deleteCategory(afterDel, r2.id);
    expect(arch.ok && arch.archived).toBe(true);
    const archived = must(arch);
    expect(archived.categories.find((c) => c.id === r2.id)!.archived).toBe(true);
    expect(archived.months[SEP].entries).toHaveLength(1);
    expect(calcMonth(archived.categories, archived.months[SEP]).out).toBe(3000);
  });

  it('moving the entries of an archived rubric empties and removes it', () => {
    let { b, id: old } = rubric(EMPTY_BUDGET, 'Aide famille');
    const r2 = rubric(b, 'Soutien famille');
    b = addEntry(r2.b, SEP, entry({ t: 'out', amt: 7000, categoryId: old }));
    b = must(moveCategoryEntries(b, old, r2.id));
    expect(b.categories.map((c) => c.name)).toEqual(['Soutien famille']);
    expect(b.months[SEP].entries[0].categoryId).toBe(r2.id);
  });

  it('refuses duplicate rubric names (case and accents ignored)', () => {
    const { b } = rubric(EMPTY_BUDGET, 'Santé');
    const r = createCategory(b, { name: '  SANTE ', icon: 'Pill', color: '#DC2626', kind: 'out' });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/déjà une rubrique « Santé »/);
    expect(validateCategoryName('santé', b.categories, b.categories[0].id).ok).toBe(true);
  });

  it('envelope totals versus line totals, and switching modes', () => {
    let { b, id: food } = rubric(EMPTY_BUDGET, 'Repas', { budgetMode: 'envelope', envelopeAmount: 60000 });
    b = { ...b, months: { [SEP]: generateMonthDoc(b, SEP) } };
    b = addEntry(b, SEP, entry({ t: 'out', amt: 25000, categoryId: food }));
    let c = calcMonth(b.categories, b.months[SEP]).byCategory[food];
    expect([c.mode, c.planned, c.actual, c.remaining]).toEqual(['envelope', 60000, 25000, 35000]);

    b = must(setBudgetMode(b, food, 'lines', SEP));
    c = calcMonth(b.categories, b.months[SEP]).byCategory[food];
    expect(c.mode).toBe('lines');
    expect(c.lines.map((l) => [l.line.label, l.line.amount])).toEqual([['Repas', 60000]]);
    expect(c.planned).toBe(60000);

    b = must(addLine(b, SEP, { categoryId: food, label: 'Marché', amount: 40000, recurrence: { kind: 'monthly', startMonth: SEP } }));
    b = must(setBudgetMode(b, food, 'envelope', SEP));
    c = calcMonth(b.categories, b.months[SEP]).byCategory[food];
    expect([c.mode, c.planned]).toEqual(['envelope', 100000]);
    expect(generateMonthDoc(b, OCT).lines).toHaveLength(0);
    expect(generateMonthDoc(b, OCT).envelopes![food]).toBe(100000);
  });
});

describe('Totals rules', () => {
  const cats: Category[] = [
    { id: 'rev', name: 'Revenus', icon: 'Wallet', color: '#12A150', order: 0, kind: 'in', budgetMode: 'lines', archived: false, createdAt: 0 },
    { id: 'log', name: 'Logement', icon: 'House', color: '#2563EB', order: 1, kind: 'out', budgetMode: 'lines', archived: false, createdAt: 0 },
    { id: 'epa', name: 'Épargne', icon: 'PiggyBank', color: '#12A150', order: 2, kind: 'save', budgetMode: 'lines', archived: false, createdAt: 0 },
    { id: 'old', name: 'Ancienne', icon: 'Shapes', color: '#475569', order: 3, kind: 'out', budgetMode: 'lines', archived: true, createdAt: 0 },
  ];
  const month: MonthDoc = {
    planCreated: true,
    lines: [
      { id: 'l-loyer', categoryId: 'log', label: 'Loyer', amount: 50000, origin: 'recurring' },
      { id: 'l-gone', categoryId: 'log', label: 'Supprimée', amount: 99000, origin: 'oneoff', archived: true },
      { id: 'l-epa', categoryId: 'epa', label: 'Réserve', amount: 20000, origin: 'recurring' },
      { id: 'l-old', categoryId: 'old', label: 'Vieux', amount: 70000, origin: 'recurring' },
      { id: 'l-free', categoryId: 'log', label: 'Eau', amount: null, origin: 'recurring' },
    ],
    entries: [],
  };

  it('exclude archived lines and rubrics, and keep savings apart from expenses', () => {
    const c = calcMonth(cats, {
      ...month,
      entries: [entry({ t: 'save', amt: 5000, categoryId: 'epa', lineId: 'l-epa' }), entry({ t: 'out', amt: 1000, categoryId: 'old' })],
    });
    expect(c.pOut).toBe(50000);
    expect(c.pSave).toBe(20000);
    expect(c.saved).toBe(5000);
    expect(c.out).toBe(1000); // real spending in an archived rubric still counts
    expect(c.toPay).toBe(50000 + 15000);
    expect(c.unsetCount).toBe(1);
  });

  it('never counts transfers between wallets as spending', () => {
    const c = calcMonth(cats, {
      ...month,
      entries: [entry({ t: 'transfer', amt: 40000, w: 'momo', toW: 'cash' }), entry({ t: 'out', amt: 300, label: 'Frais virement' })],
    });
    expect(c.out).toBe(300);
    expect(c.transfers).toBe(40000);
  });

  it('shows no "free" figure without income, uses planned income before it is received', () => {
    const none = calcMonth(cats, month);
    expect(none.free).toBeNull();
    expect(none.freeBasis).toBe('none');

    const planned = calcMonth(cats, {
      ...month,
      lines: [...month.lines, { id: 'l-sal', categoryId: 'rev', label: 'Salaire', amount: 300000, origin: 'recurring' }],
    });
    expect(planned.freeBasis).toBe('planned');
    expect(planned.free).toBe(300000 - 70000);

    const received = calcMonth(cats, { ...month, entries: [entry({ t: 'in', amt: 100000, categoryId: 'rev' })] });
    expect(received.freeBasis).toBe('received');
    expect(received.free).toBe(100000 - 70000);
  });
});

describe('Validation', () => {
  it('amounts are non-negative integers up to 999 999 999', () => {
    expect(validateAmount('5 000').ok).toBe(true);
    expect(validateAmount(-1).ok).toBe(false);
    expect(validateAmount(12.5).ok).toBe(false);
    expect(validateAmount(1_000_000_000).ok).toBe(false);
    expect(validateAmount('').ok && validateAmount('').value).toBeNull();
  });

  it('names are trimmed and limited to 40 characters', () => {
    expect(cleanName('   Loyer   maison  ')).toBe('Loyer maison');
    expect(cleanName('x'.repeat(60))).toHaveLength(40);
  });
});

describe('Importer ma fiche', () => {
  it('detects amounts, rubrics and recurrence keywords', () => {
    const rows = parseBudgetSheet('Loyer 50000 / Eau 5000 / Scolarité 120000 ponctuel');
    expect(rows.map((r) => [r.label, r.amount, r.recurrence, r.rubric])).toEqual([
      ['Loyer', 50000, 'monthly', 'Logement'],
      ['Eau', 5000, 'monthly', 'Logement'],
      ['Scolarité', 120000, 'once', 'Enfants et école'],
    ]);
  });

  it('understands "chaque mois", "annuel", headings and spaced amounts', () => {
    const rows = parseBudgetSheet('Famille :\nMaman 10 000 chaque mois\nAssurance moto 25k annuel\nCadeau sans montant');
    expect(rows.map((r) => [r.rubric, r.label, r.amount, r.recurrence])).toEqual([
      ['Famille', 'Maman', 10000, 'monthly'],
      ['Famille', 'Assurance moto', 25000, 'yearly'],
      ['Famille', 'Cadeau sans montant', null, 'monthly'],
    ]);
  });

  it('creates rubrics and lines from the confirmed preview', () => {
    const rows = parseBudgetSheet('Loyer 50000 / Scolarité 120000 ponctuel');
    const b = must(applyImport(EMPTY_BUDGET, rows, SEP));
    expect(b.categories.map((c) => c.name)).toEqual(['Logement', 'Enfants et école']);
    expect(b.items).toHaveLength(1); // only the monthly line gets a template
    expect(b.months[SEP].lines).toHaveLength(2);
    expect(generateMonthDoc(b, OCT).lines.map((l) => l.label)).toEqual(['Loyer']);
  });
});

describe('Template and migration', () => {
  it('the September 2026 example marks the rentrée lines "Ce mois seulement"', () => {
    const b = must(applyTemplate(EMPTY_BUDGET, TEMPLATE_SEPTEMBER_2026, SEP));
    expect(b.months[SEP].lines).toHaveLength(17);
    expect(b.months[SEP].fromTemplate).toBe(true);
    const oct = generateMonthDoc(b, OCT).lines.map((l) => l.label);
    ['Scolarité et fournitures des enfants', 'Réparation moto', 'Remède', 'Chaussures', 'Beurre', 'Claude'].forEach((l) =>
      expect(oct).not.toContain(l)
    );
    expect(oct).toContain('Loyer');
    expect(oct).toContain('Petit déjeuner');
    expect(b.categories.find((c) => c.name === 'Dettes')!.linkedTo).toBe('debts');
  });

  it('converts the old format without losing lines or entries', () => {
    const legacy: Record<string, LegacyMonthData> = {
      [SEP]: {
        seeded: true,
        plan: [
          { id: 'p-rev-1', g: 'Revenus', l: 'Revenus du mois', a: 0, t: 'in' },
          { id: 'p-log-1', g: 'Logement', l: 'Loyer', a: 50000, t: 'out' },
          { id: 'p-enf-1', g: 'Enfants', l: 'Scolarité et fournitures des enfants', a: 120000, t: 'out' },
        ],
        entries: [
          { id: 'x1', d: '2026-09-02', ts: 1, t: 'out', amt: 50000, p: 'p-log-1', l: '', w: 'wallet-cash' },
          { id: 'x2', d: '2026-09-03', ts: 2, t: 'in', amt: 200000, p: 'p-rev-1', l: '', w: 'wallet-cash' },
          { id: 'x3', d: '2026-09-04', ts: 3, t: 'out', amt: 1500, p: null, l: 'Beignets', w: 'wallet-cash' },
        ],
      },
    };
    expect(hasLegacyData(legacy)).toBe(true);
    const m = migrateLegacy(legacy);
    expect(m.categories.map((c) => [c.name, c.kind])).toEqual([
      ['Revenus', 'in'],
      ['Logement', 'out'],
      ['Enfants', 'out'],
    ]);
    const sep = m.months[SEP];
    expect(sep.lines.map((l) => [l.id, l.amount])).toEqual([
      ['p-rev-1', null],
      ['p-log-1', 50000],
      ['p-enf-1', 120000],
    ]);
    expect(sep.entries).toHaveLength(3);
    expect(sep.entries[0].lineId).toBe('p-log-1');
    expect(sep.entries[2]).toMatchObject({ categoryId: null, lineId: null, label: 'Beignets' });

    const b: MemberBudget = { ...EMPTY_BUDGET, ...m };
    const c = calcMonth(b.categories, sep);
    expect([c.inc, c.out]).toEqual([200000, 51500]);
    // The seeded school fee is one-off, so October does not bring it back.
    expect(generateMonthDoc(b, OCT).lines.map((l) => l.label)).toEqual(['Revenus du mois', 'Loyer']);
  });
});

describe('Debts feed the Dettes rubric', () => {
  it('creating a debt creates its line; paying the line records a payment', () => {
    let b: MemberBudget = { ...EMPTY_BUDGET, months: { [SEP]: { lines: [], entries: [], planCreated: true } } };
    b = must(
      addDebt(
        b,
        { id: 'd1', person: 'Claude', direction: 'i_owe', principal: 10000, createdAt: '2026-09-01', payments: [], status: 'active' },
        SEP
      )
    );
    const cat = b.categories.find((c) => c.linkedTo === 'debts')!;
    expect(cat.name).toBe('Dettes');
    const line = b.months[SEP].lines.find((l) => l.debtId === 'd1')!;
    expect([line.label, line.amount, line.origin]).toEqual(['Claude', 10000, 'debt']);

    b = addEntry(b, SEP, entry({ t: 'out', amt: 4000, categoryId: cat.id, lineId: line.id }));
    expect(b.debts[0].payments).toHaveLength(1);
    expect(generateMonthDoc(b, OCT).lines.map((l) => [l.label, l.amount])).toEqual([['Claude', 6000]]);
  });
});

describe('Famille aggregates by rubric name', () => {
  function member(uid: string, name: string, me: boolean, rubrics: Array<[string, number]>): MemberData {
    let b = EMPTY_BUDGET;
    rubrics.forEach(([n, amt]) => {
      const r = rubric(b, n);
      b = must(addLine(r.b, SEP, { categoryId: r.id, label: n, amount: amt, recurrence: { kind: 'once', month: SEP } }));
    });
    return { ...b, uid, name, me };
  }

  it('matches names case- and accent-insensitively and keeps the others apart', () => {
    const a = member('a', 'Awa', true, [['Santé', 10000], ['Soutien famille', 20000]]);
    const c = member('c', 'Cabrel', false, [['SANTE', 5000], ['Aide famille', 7000]]);
    const fam = aggregateFamily([a, c], SEP);
    expect(fam.shared.map((r) => [r.name, r.planned])).toEqual([['Santé', 15000]]);
    expect(fam.unmatched.map((r) => r.name).sort()).toEqual(['Aide famille', 'Soutien famille']);

    const sugg = suggestMerges([a, c]);
    expect(sugg).toHaveLength(1);
    expect([sugg[0].keepName, sugg[0].mergeName]).toEqual(['Soutien famille', 'Aide famille']);

    const merged = aggregateFamily([a, c], SEP, addMerge({}, sugg[0].keep, sugg[0].merge));
    expect(merged.unmatched).toHaveLength(0);
    expect(merged.shared.find((r) => r.name === 'Soutien famille')!.planned).toBe(27000);
    // Each partner's own data is unchanged.
    expect(c.categories.map((x) => x.name)).toContain('Aide famille');
  });

  it('uses the planned amounts of the given month only (one-off lines included)', () => {
    const a = member('a', 'Awa', true, [['Enfants', 120000]]);
    expect(aggregateFamily([a], SEP).pOut).toBe(120000);
    expect(aggregateFamily([a], OCT).pOut).toBe(0);
  });
});
