import React, { useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { fmt } from '../lib/budget-math';
import { SUGGESTED_RUBRICS } from '../lib/catalog';
import { ImportRecurrence, ImportRow, parseBudgetSheet } from '../lib/importer';
import { MAX_NAME_LENGTH } from '../lib/validation';
import { ErrorText, PrimaryButton } from './ui';

interface Props {
  existingRubrics: string[];
  /** Returns an error, or null once the rubrics and lines are created. */
  onConfirm: (rows: ImportRow[]) => string | null;
}

const EXAMPLE = 'Loyer 50000 / Eau 5000 / Scolarité 120000 ponctuel\nMaman 10000 chaque mois\nAssurance moto 25000 annuel';

export const ImportPanel: React.FC<Props> = ({ existingRubrics, onConfirm }) => {
  const [text, setText] = useState('');
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [error, setError] = useState('');
  const listId = 'import-rubrics';

  const analyse = () => {
    const parsed = parseBudgetSheet(text, existingRubrics);
    if (!parsed.length) return setError('Aucune ligne reconnue. Écrivez un nom suivi d’un montant, par exemple « Loyer 50000 ».');
    setError('');
    setRows(parsed);
  };

  const patch = (key: string, p: Partial<ImportRow>) => setRows((rs) => rs && rs.map((r) => (r.key === key ? { ...r, ...p } : r)));

  if (!rows) {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
          Collez votre fiche : une ligne par dépense, ou séparées par « / ». Ajoutez « ponctuel », « chaque mois » ou « annuel »
          si besoin. Vous vérifiez tout avant de créer.
        </p>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] leading-relaxed focus:border-[var(--color-primary)] focus:outline-hidden"
          aria-label="Votre fiche"
        />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton onClick={analyse} disabled={!text.trim()}>
          <Sparkles size={16} /> Voir l’aperçu
        </PrimaryButton>
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
  return (
    <div className="flex flex-col gap-2">
      <datalist id={listId}>
        {[...new Set([...existingRubrics, ...SUGGESTED_RUBRICS.map((s) => s.name)])].map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <div className="flex justify-between items-center text-xs">
        <span className="font-heading font-bold text-[var(--color-text)]">
          Aperçu · {rows.length} ligne{rows.length > 1 ? 's' : ''}
        </span>
        <span className="text-[var(--color-text-muted)] num">Total {fmt(total)} F</span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="p-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <input
              value={r.label}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => patch(r.key, { label: e.target.value })}
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold bg-[var(--color-surface)]"
              aria-label="Nom de la ligne"
            />
            <input
              inputMode="numeric"
              value={r.amount === null ? '' : String(r.amount)}
              placeholder="Sans montant"
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, '').slice(0, 9);
                patch(r.key, { amount: d ? parseInt(d, 10) : null });
              }}
              className="w-24 px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-right text-xs font-heading font-bold num bg-[var(--color-surface)]"
              aria-label="Montant"
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs && rs.filter((x) => x.key !== r.key))}
              className="w-8 shrink-0 rounded-lg text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)] flex items-center justify-center"
              aria-label={`Retirer ${r.label}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              list={listId}
              value={r.rubric}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => patch(r.key, { rubric: e.target.value })}
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[11px] bg-[var(--color-surface)]"
              aria-label="Rubrique"
            />
            <select
              value={r.recurrence}
              onChange={(e) => patch(r.key, { recurrence: e.target.value as ImportRecurrence })}
              className="px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-[11px] font-semibold bg-[var(--color-surface)]"
              aria-label="Récurrence"
            >
              <option value="monthly">Chaque mois</option>
              <option value="once">Ce mois seulement</option>
              <option value="yearly">Chaque année</option>
            </select>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRows((rs) => [...(rs || []), { key: `n${Date.now()}`, rubric: 'Autres', label: '', amount: null, recurrence: 'monthly' }])
        }
        className="py-2 rounded-xl border border-dashed border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] flex items-center justify-center gap-1"
      >
        <Plus size={14} /> Ajouter une ligne
      </button>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton
        onClick={() => {
          const clean = rows.filter((r) => r.label.trim());
          if (!clean.length) return setError('Ajoutez au moins une ligne avec un nom.');
          const err = onConfirm(clean);
          if (err) setError(err);
        }}
      >
        Créer ces rubriques et lignes
      </PrimaryButton>
      <button type="button" onClick={() => setRows(null)} className="text-xs font-semibold text-[var(--color-text-muted)] py-1">
        Modifier le texte
      </button>
    </div>
  );
};
