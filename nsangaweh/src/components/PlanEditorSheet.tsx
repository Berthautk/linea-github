import React, { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { fmt, generateId, GROUPS } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { RubricIconBadge } from '../lib/rubrics';
import { EntryType, PlanLine } from '../lib/types';

interface PlanEditorSheetProps {
  isOpen: boolean;
  plan: PlanLine[];
  onClose: () => void;
  onUpdatePlan: (updatedPlan: PlanLine[]) => void;
}

export const PlanEditorSheet: React.FC<PlanEditorSheetProps> = ({
  isOpen,
  plan,
  onClose,
  onUpdatePlan,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>(GROUPS[1]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New line fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newGroup, setNewGroup] = useState<string>(GROUPS[1]);
  const [newAmount, setNewAmount] = useState('');

  if (!isOpen) return null;

  const handleUpdateAmount = (id: string, value: string) => {
    const intVal = parseInt(value.replace(/\D/g, ''), 10) || 0;
    const updated = plan.map((p) => (p.id === id ? { ...p, a: intVal } : p));
    onUpdatePlan(updated);
  };

  const handleUpdateLabel = (id: string, value: string) => {
    const updated = plan.map((p) => (p.id === id ? { ...p, l: value } : p));
    onUpdatePlan(updated);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      triggerHaptic('warning');
      const updated = plan.filter((p) => p.id !== id);
      onUpdatePlan(updated);
      setConfirmDeleteId(null);
    } else {
      triggerHaptic('light');
      setConfirmDeleteId(id);
    }
  };

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    triggerHaptic('success');
    const amt = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    const newLine: PlanLine = {
      id: generateId(),
      l: newLabel.trim(),
      g: newGroup,
      a: amt,
      t: (newGroup === 'Revenus' ? 'in' : 'out') as EntryType,
    };
    onUpdatePlan([...plan, newLine]);
    setNewLabel('');
    setNewAmount('');
    setShowAddForm(false);
  };

  // Group lines
  const groupOrder = GROUPS.filter((g) => plan.some((p) => p.g === g));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Modifier le plan du mois"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="pt-3 pb-2.5 px-5 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Modifier le plan du mois
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          {/* Add Line Prompt / Form */}
          {showAddForm ? (
            <form
              onSubmit={handleAddLine}
              className="p-3.5 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/40 flex flex-col gap-2.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-heading font-bold text-[var(--color-primary)]">
                  Ajouter une ligne au plan
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Annuler
                </button>
              </div>

              <input
                type="text"
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Libellé (ex : Eau courante, Loyer)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  inputMode="numeric"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Montant prévu (F)"
                  className="px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-right num font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-heading font-bold shadow-xs hover:bg-[var(--color-primary-dark)] transition"
              >
                Enregistrer la ligne
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAddForm(true);
              }}
              className="w-full py-2.5 rounded-2xl border border-dashed border-[var(--color-primary)] text-[var(--color-primary)] font-heading font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-light)] transition cursor-pointer"
            >
              <Plus size={16} />
              Ajouter une ligne au plan
            </button>
          )}

          {/* Grouped Lines */}
          {groupOrder.map((group) => {
            const lines = plan.filter((p) => p.g === group);
            const totalPlanned = lines.reduce((acc, p) => acc + (p.a || 0), 0);

            return (
              <div
                key={group}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xs"
              >
                <div className="px-3.5 py-2 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RubricIconBadge groupName={group} size="sm" />
                    <span className="font-heading font-bold text-xs text-[var(--color-text)]">
                      {group}
                    </span>
                  </div>
                  <span className="text-xs font-heading font-bold text-[var(--color-text-muted)] num">
                    {fmt(totalPlanned)} F
                  </span>
                </div>

                <div className="divide-y divide-[var(--color-border)]/40 p-1">
                  {lines.map((p) => {
                    const isSure = confirmDeleteId === p.id;
                    return (
                      <div
                        key={p.id}
                        className="p-2 flex items-center gap-2 hover:bg-[var(--color-surface-subtle)]/30 transition rounded-xl"
                      >
                        <input
                          type="text"
                          value={p.l}
                          onChange={(e) => handleUpdateLabel(p.id, e.target.value)}
                          className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] min-w-0"
                          aria-label="Libellé"
                        />

                        <input
                          type="text"
                          inputMode="numeric"
                          value={p.a ? String(p.a) : ''}
                          placeholder="0"
                          onChange={(e) => handleUpdateAmount(p.id, e.target.value)}
                          className="w-20 text-xs font-heading font-bold text-right px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] num"
                          aria-label="Montant prévu"
                        />

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className={`h-7 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 ${
                            isSure
                              ? 'bg-[var(--color-expense)] text-white'
                              : 'text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)]'
                          }`}
                        >
                          {isSure ? 'Sûr ?' : <Trash2 size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Done Button */}
        <div className="p-3 border-t border-[var(--color-border)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-dark)] active:scale-95 transition"
          >
            <Check size={18} />
            Terminer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};
