import { getEntryLabel } from './budget-math';
import { MonthData } from './types';

/**
 * Exports user financial operations to a standard CSV file
 */
export function exportLedgerToCSV(
  months: Record<string, MonthData>,
  userName: string,
  householdId: string
) {
  const rows: string[][] = [
    ['Mois', 'Date', 'Type', 'Montant (FCFA)', 'Rubrique', 'Libelle', 'Auteur', 'Foyer'],
  ];

  const sortedMonths = Object.keys(months).sort();

  sortedMonths.forEach((mk) => {
    const m = months[mk];
    if (!m || !m.entries) return;

    m.entries.forEach((e) => {
      const el = getEntryLabel(m, e);
      rows.push([
        mk,
        e.d,
        e.t === 'in' ? 'Entrée' : 'Sortie',
        String(e.amt),
        `"${el.g.replace(/"/g, '""')}"`,
        `"${el.l.replace(/"/g, '""')}"`,
        `"${userName.replace(/"/g, '""')}"`,
        `"${householdId}"`,
      ]);
    });
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nsangaweh-budget-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
