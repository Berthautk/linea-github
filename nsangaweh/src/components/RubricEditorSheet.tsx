import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { ICON_NAMES, PALETTE } from '../lib/catalog';
import { iconFor, RubricBadge } from '../lib/icons';
import { BudgetMode, Category, CategoryKind } from '../lib/types';
import { MAX_NAME_LENGTH, validateAmount, validateCategoryName } from '../lib/validation';
import { ErrorText, FieldLabel, inputClass, PrimaryButton, Segmented, Sheet } from './ui';

export interface RubricDraft {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  budgetMode: BudgetMode;
  envelopeAmount: number | null;
}

interface Props {
  open: boolean;
  category?: Category | null;
  categories: Category[];
  defaultKind?: CategoryKind;
  /** Returns an error message, or null when saved. */
  onSubmit: (draft: RubricDraft) => string | null;
  onClose: () => void;
}

export const RubricEditorSheet: React.FC<Props> = ({ open, category, categories, defaultKind = 'out', onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('Shapes');
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [kind, setKind] = useState<CategoryKind>(defaultKind);
  const [mode, setMode] = useState<BudgetMode>('lines');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Reset only when the sheet opens, never while typing.
  useEffect(() => {
    if (!open) return;
    setName(category?.name || '');
    setIcon(category?.icon || 'Shapes');
    setColor(category?.color || PALETTE[categories.length % PALETTE.length]);
    setKind(category?.kind || defaultKind);
    setMode(category?.budgetMode || 'lines');
    setAmount(category?.envelopeAmount ? String(category.envelopeAmount) : '');
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id]);

  const submit = () => {
    const v = validateCategoryName(name, categories, category?.id);
    if (!v.ok) return setError(v.error);
    const a = validateAmount(amount.replace(/\D/g, '') || null);
    if (!a.ok) return setError(a.error);
    const err = onSubmit({ name: v.value, icon, color, kind, budgetMode: mode, envelopeAmount: a.value });
    if (err) setError(err);
  };

  const isEdit = !!category;

  return (
    <Sheet
      open={open}
      title={isEdit ? 'Modifier la rubrique' : 'Nouvelle rubrique'}
      onClose={onClose}
      z={60}
      footer={
        <>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton onClick={submit}>
            <Check size={18} /> Enregistrer
          </PrimaryButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <RubricBadge icon={icon} color={color} size="lg" />
        <div className="flex-1 flex flex-col gap-1">
          <FieldLabel htmlFor="rubric-name">Nom de la rubrique</FieldLabel>
          <input
            id="rubric-name"
            className={inputClass}
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Ex : Logement, Repas, Aide famille"
            autoFocus={!isEdit}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Type</FieldLabel>
        <Segmented<CategoryKind>
          value={kind}
          onChange={setKind}
          options={[
            { value: 'out', label: 'Dépense' },
            { value: 'in', label: 'Revenu' },
            { value: 'save', label: 'Épargne' },
          ]}
        />
      </div>

      {!isEdit && kind !== 'in' && (
        <div className="flex flex-col gap-1">
          <FieldLabel>Budget</FieldLabel>
          <Segmented<BudgetMode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'lines', label: 'Détaillé par lignes' },
              { value: 'envelope', label: 'Enveloppe simple' },
            ]}
          />
          {mode === 'envelope' && (
            <input
              className={`${inputClass} num text-right font-heading font-bold`}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="Montant du mois (F) — facultatif"
              aria-label="Montant de l’enveloppe"
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Couleur</FieldLabel>
        <div className="grid grid-cols-6 gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-9 rounded-xl flex items-center justify-center transition ${color === c ? 'ring-2 ring-offset-2 ring-[var(--color-text)]' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
              aria-pressed={color === c}
            >
              {color === c && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Icône</FieldLabel>
        <div className="grid grid-cols-8 gap-1.5">
          {ICON_NAMES.map((n) => {
            const Icon = iconFor(n);
            const sel = icon === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setIcon(n)}
                className={`aspect-square rounded-xl flex items-center justify-center border transition ${
                  sel ? 'border-transparent text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
                style={sel ? { backgroundColor: color } : undefined}
                aria-label={n}
                aria-pressed={sel}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
};
