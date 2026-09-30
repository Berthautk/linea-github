import React, { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { fmt } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { Entry, EntryType, MonthCalculation, PlanLine } from '../lib/types';

interface EntryEditSheetProps {
  isOpen: boolean;
  entry: Entry | null;
  calc: MonthCalculation;
  onClose: () => void;
  onSave: (updated: Entry) => void;
  onDelete: (id: string) => void;
}

export const EntryEditSheet: React.FC<EntryEditSheetProps> = ({
  isOpen,
  entry,
  calc,
  onClose,
  onSave,
  onDelete,
}) => {
  const [amt, setAmt] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<EntryType>('out');
  const [planId, setPlanId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    if (entry) {
      setAmt(String(entry.amt));
      setLabel(entry.l || '');
      setDate(entry.d);
      setType(entry.t);
      setPlanId(entry.p);
      setConfirmDelete(false);
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseInt(amt.replace(/\D/g, ''), 10) || 0;
    if (parsedAmt <= 0) return;

    triggerHaptic('success');
    onSave({
      ...entry,
      amt: parsedAmt,
      l: label.trim(),
      d: date,
      t: type,
      p: planId,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      triggerHaptic('warning');
      onDelete(entry.id);
      onClose();
    } else {
      triggerHaptic('light');
      setConfirmDelete(true);
    }
  };

  // Find matching plan line if any
  const selectedPlan = planId ? calc.monthData.plan.find((p) => p.id === planId) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Modifier l’opération"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-[var(--color-border)]/60">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
            Détail de l’opération
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Montant */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Montant (FCFA)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="text-2xl font-heading font-bold px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] num"
              required
            />
          </div>

          {/* Libellé */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Libellé / Note
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={selectedPlan ? selectedPlan.l : 'Ex : Courses marché'}
              className="text-sm font-medium px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Date de l’opération
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-dark)] transition cursor-pointer"
            >
              <Check size={18} />
              Enregistrer
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                confirmDelete
                  ? 'bg-[var(--color-expense)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)]'
              }`}
            >
              <Trash2 size={18} />
              {confirmDelete ? 'Confirmer ?' : 'Supprimer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
