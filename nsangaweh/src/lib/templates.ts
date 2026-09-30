/**
 * Ready-made budgets offered in Réglages > Modèles. Nothing is preloaded:
 * a template only creates rubrics and lines when the user applies it.
 */
import { addLine, ensureCategory, OpResult } from './budget-ops';
import { IconName } from './catalog';
import { CategoryKind, MemberBudget } from './types';
import { nameKey } from './validation';

export interface TemplateLine {
  label: string;
  amount: number | null;
  /** true = "Ce mois seulement", false = "Chaque mois". */
  once: boolean;
}

export interface TemplateRubric {
  name: string;
  icon: IconName;
  color: string;
  kind: CategoryKind;
  linkedTo?: 'debts';
  lines: TemplateLine[];
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  rubrics: TemplateRubric[];
}

export const TEMPLATE_SEPTEMBER_2026: BudgetTemplate = {
  id: 'fiche-septembre-2026',
  name: 'Exemple : ma fiche de septembre 2026',
  description: 'Vos rubriques et lignes de septembre 2026, avec la rentrée et les réparations marquées « Ce mois seulement ».',
  rubrics: [
    {
      name: 'Revenus',
      icon: 'Wallet',
      color: '#12A150',
      kind: 'in',
      lines: [{ label: 'Revenus du mois', amount: null, once: false }],
    },
    {
      name: 'Logement',
      icon: 'House',
      color: '#2563EB',
      kind: 'out',
      lines: [
        { label: 'Loyer', amount: null, once: false },
        { label: 'Eau', amount: null, once: false },
        { label: 'Électricité', amount: 10000, once: false },
      ],
    },
    {
      name: 'Enfants',
      icon: 'GraduationCap',
      color: '#7C3AED',
      kind: 'out',
      lines: [{ label: 'Scolarité et fournitures des enfants', amount: 120000, once: true }],
    },
    {
      name: 'Maison',
      icon: 'Sparkles',
      color: '#0D9488',
      kind: 'out',
      lines: [{ label: 'Femme de ménage', amount: null, once: false }],
    },
    {
      name: 'Soutien famille',
      icon: 'HeartHandshake',
      color: '#E11D48',
      kind: 'out',
      lines: [
        { label: 'Maman', amount: 10000, once: false },
        { label: 'Cabrel', amount: 17500, once: false },
        { label: 'Transport maman', amount: 20000, once: false },
      ],
    },
    {
      name: 'Santé',
      icon: 'Pill',
      color: '#DC2626',
      kind: 'out',
      lines: [
        { label: 'Remède', amount: 12000, once: true },
        { label: 'Consultation', amount: null, once: false },
      ],
    },
    {
      name: 'Transport',
      icon: 'Bike',
      color: '#D97706',
      kind: 'out',
      lines: [
        { label: 'Réparation moto', amount: 13000, once: true },
        { label: 'Pousse-pousse', amount: 10000, once: false },
      ],
    },
    {
      name: 'Repas',
      icon: 'UtensilsCrossed',
      color: '#EA580C',
      kind: 'out',
      lines: [{ label: 'Petit déjeuner', amount: 50000, once: false }],
    },
    {
      name: 'Dettes',
      icon: 'Receipt',
      color: '#4F46E5',
      kind: 'out',
      linkedTo: 'debts',
      lines: [
        { label: 'Chaussures', amount: 17000, once: true },
        { label: 'Beurre', amount: 5000, once: true },
        { label: 'Claude', amount: 10000, once: true },
      ],
    },
  ],
};

export const TEMPLATES: BudgetTemplate[] = [TEMPLATE_SEPTEMBER_2026];

/** One-off flag of a template line by label (used when migrating an old seeded month). */
export function templateOnceLabels(t: BudgetTemplate = TEMPLATE_SEPTEMBER_2026): Set<string> {
  const s = new Set<string>();
  t.rubrics.forEach((r) => r.lines.forEach((l) => l.once && s.add(nameKey(l.label))));
  return s;
}

/**
 * Apply a template to `monthKey`: rubrics are reused when the user already has
 * one with the same name, lines are added to that month's plan.
 */
export function applyTemplate(b: MemberBudget, t: BudgetTemplate, monthKey: string): OpResult {
  let next = b;
  for (const r of t.rubrics) {
    const c = ensureCategory(
      next,
      { name: r.name, icon: r.icon, color: r.color, kind: r.kind, budgetMode: 'lines', linkedTo: r.linkedTo },
      monthKey
    );
    if (!c.ok) return c;
    next = c.budget;
    for (const l of r.lines) {
      // A line the month already has in this rubric is kept as is.
      const existing = next.months[monthKey]?.lines.some(
        (x) => !x.archived && x.categoryId === c.id && nameKey(x.label) === nameKey(l.label)
      );
      if (existing) continue;
      const a = addLine(next, monthKey, {
        categoryId: c.id!,
        label: l.label,
        amount: l.amount,
        recurrence: l.once ? { kind: 'once', month: monthKey } : { kind: 'monthly', startMonth: monthKey },
      });
      if (!a.ok) return a;
      next = a.budget;
    }
  }
  const m = next.months[monthKey];
  if (m) next = { ...next, months: { ...next.months, [monthKey]: { ...m, fromTemplate: true } } };
  return { ok: true, budget: next };
}
