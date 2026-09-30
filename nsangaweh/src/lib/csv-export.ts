import { describeEntry } from './calc';
import { MemberBudget } from './types';

const TYPE_LABEL = { in: 'Revenu', out: 'Dépense', save: 'Épargne', transfer: 'Virement' } as const;

const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

/** Export every entry with its rubric and line names (resolved from ids). */
export function exportLedgerToCSV(budget: MemberBudget, userName: string, householdId: string) {
  const rows: string[][] = [['Mois', 'Date', 'Type', 'Montant (FCFA)', 'Rubrique', 'Libellé', 'Auteur', 'Foyer']];
  const cats = new Map(budget.categories.map((c) => [c.id, c]));
  Object.keys(budget.months)
    .sort()
    .forEach((mk) => {
      const m = budget.months[mk];
      m.entries.forEach((e) => {
        const d = describeEntry(e, cats, m);
        rows.push([mk, e.d, TYPE_LABEL[e.t], String(e.amt), q(d.category?.name || 'Sans rubrique'), q(d.label), q(userName), q(householdId)]);
      });
    });

  const csv = '﻿' + rows.map((r) => r.join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `nsangaweh-budget-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
