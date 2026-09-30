import React, { useEffect, useMemo, useState } from 'react';
import { Check, HandCoins, Plus, Trash2 } from 'lucide-react';
import { fmt, monthNumber, MONTH_NAMES, shortMonth } from '../lib/budget-math';
import { sortCategories } from '../lib/calc';
import { RubricBadge } from '../lib/icons';
import { recurrenceChoice, RecurrenceChoice } from '../lib/recurrence';
import { BudgetItem, Category, CategoryKind, MonthLine, Recurrence } from '../lib/types';
import { MAX_NAME_LENGTH, validateAmount, validateName } from '../lib/validation';
import { ErrorText, FieldLabel, inputClass, Keypad, PrimaryButton, Segmented, Sheet, Toggle } from './ui';

export interface LineValues {
  label: string;
  amount: number | null;
  categoryId: string;
  recurrence: Recurrence;
  note: string;
  remind: boolean;
}

interface Props {
  open: boolean;
  monthKey: string;
  categories: Category[];
  line?: MonthLine | null;
  item?: BudgetItem | null;
  paid?: number;
  defaultCategoryId?: string;
  /** Restrict the rubric chips (e.g. only income rubrics for "Ajouter un revenu"). */
  kindFilter?: CategoryKind;
  /** Set when "Nouvelle rubrique…" just created one, so it gets selected. */
  createdCategoryId?: string | null;
  onSave: (v: LineValues) => string | null;
  onPayNow?: (line: MonthLine) => void;
  onDelete?: (line: MonthLine) => void;
  onNewRubric: () => void;
  onClose: () => void;
}

export const LineSheet: React.FC<Props> = ({
  open,
  monthKey,
  categories,
  line,
  item,
  paid = 0,
  defaultCategoryId,
  kindFilter,
  createdCategoryId,
  onSave,
  onPayNow,
  onDelete,
  onNewRubric,
  onClose,
}) => {
  const original: Recurrence = item?.recurrence || { kind: 'once', month: monthKey };
  const [label, setLabel] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [noAmount, setNoAmount] = useState(false);
  const [remind, setRemind] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [choice, setChoice] = useState<RecurrenceChoice>('once');
  const [months, setMonths] = useState<number[]>([]);
  const [yearMonth, setYearMonth] = useState(monthNumber(monthKey));
  const [touchedRecurrence, setTouchedRecurrence] = useState(false);
  const [note, setNote] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLabel(line?.label || '');
    setAmountStr(line?.amount ? String(line.amount) : '');
    setNoAmount(!!line && line.amount === null);
    setRemind(!!line?.remind);
    setCategoryId(line?.categoryId || defaultCategoryId || '');
    const rec = item?.recurrence;
    setChoice(line ? recurrenceChoice(rec) : 'monthly');
    setMonths(rec?.kind === 'months' ? rec.months : [monthNumber(monthKey)]);
    setYearMonth(rec?.kind === 'yearly' ? rec.month : monthNumber(monthKey));
    setTouchedRecurrence(false);
    setNote(line?.note || '');
    setShowKeypad(!line);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, line?.id]);

  useEffect(() => {
    if (open && createdCategoryId) setCategoryId(createdCategoryId);
  }, [open, createdCategoryId]);

  const visibleCats = useMemo(
    () => sortCategories(categories.filter((c) => !c.archived && (!kindFilter || c.kind === kindFilter))),
    [categories, kindFilter]
  );
  const selectedCat = categories.find((c) => c.id === categoryId);
  const isIncome = selectedCat?.kind === 'in';

  const buildRecurrence = (): Recurrence => {
    if (line && !touchedRecurrence && choice === recurrenceChoice(original)) return original;
    const start = item && 'startMonth' in item.recurrence && item.recurrence.startMonth ? item.recurrence.startMonth : monthKey;
    switch (choice) {
      case 'once':
        return { kind: 'once', month: monthKey };
      case 'monthly':
        return { kind: 'monthly', startMonth: start };
      case 'months':
        return { kind: 'months', months: [...months].sort((a, b) => a - b), startMonth: start };
      case 'yearly':
        return { kind: 'yearly', month: yearMonth, startMonth: start };
    }
  };

  const submit = () => {
    const n = validateName(label, 'Le nom de la ligne');
    if (!n.ok) return setError(n.error);
    if (!categoryId) return setError('Choisissez une rubrique.');
    const a = noAmount ? { ok: true as const, value: null } : validateAmount(amountStr || null);
    if (!a.ok) return setError(a.error);
    if (choice === 'months' && !months.length) return setError('Choisissez au moins un mois.');
    const err = onSave({
      label: n.value,
      amount: a.value,
      categoryId,
      recurrence: buildRecurrence(),
      note: note.trim(),
      remind: noAmount && remind,
    });
    if (err) setError(err);
  };

  const remaining = line?.amount ? Math.max(0, line.amount - paid) : 0;

  return (
    <Sheet
      open={open}
      title={line ? 'Modifier la ligne' : isIncome || kindFilter === 'in' ? 'Nouveau revenu' : 'Nouvelle ligne'}
      onClose={onClose}
      footer={
        <>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton onClick={submit}>
            <Check size={18} /> Enregistrer
          </PrimaryButton>
          {line && (
            <div className="grid grid-cols-2 gap-2">
              {onPayNow && (
                <PrimaryButton tone="ghost" onClick={() => onPayNow(line)}>
                  <HandCoins size={16} /> {isIncome ? 'Marquer reçu' : 'Payer maintenant'}
                </PrimaryButton>
              )}
              {onDelete && (
                <PrimaryButton tone="danger" onClick={() => onDelete(line)}>
                  <Trash2 size={16} /> Supprimer
                </PrimaryButton>
              )}
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="line-name">Nom</FieldLabel>
        <input
          id="line-name"
          className={inputClass}
          value={label}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => {
            setLabel(e.target.value);
            setError('');
          }}
          onFocus={() => setShowKeypad(false)}
          placeholder={kindFilter === 'in' ? 'Ex : Salaire, Vente, Loyer perçu' : 'Ex : Loyer, Eau, Maman'}
          autoFocus={!line}
        />
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Montant prévu</FieldLabel>
        {!noAmount ? (
          <button
            type="button"
            onClick={() => setShowKeypad((s) => !s)}
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex items-baseline justify-end gap-1.5"
            aria-label="Saisir le montant"
          >
            <span className={`text-2xl font-heading font-extrabold num ${amountStr ? '' : 'text-[var(--color-text-muted)]/60'}`}>
              {amountStr ? fmt(parseInt(amountStr, 10)) : '0'}
            </span>
            <span className="text-xs font-heading font-bold text-[var(--color-primary)]">F</span>
          </button>
        ) : (
          <div className="px-3.5 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            Sans montant fixé
          </div>
        )}
        {!noAmount && showKeypad && <Keypad value={amountStr} onChange={setAmountStr} />}
        {line && paid > 0 && (
          <span className="text-[11px] text-[var(--color-text-muted)] px-0.5">
            Déjà {isIncome ? 'reçu' : 'payé'} : <b className="num">{fmt(paid)} F</b>
            {remaining > 0 && (
              <>
                {' '}
                · reste <b className="num">{fmt(remaining)} F</b>
              </>
            )}
          </span>
        )}
        <Toggle
          checked={noAmount}
          onChange={(v) => {
            setNoAmount(v);
            if (v) setShowKeypad(false);
          }}
          label="Sans montant fixé"
          hint="La ligne reste dans le plan sans compter dans le total"
        />
        {noAmount && (
          <Toggle checked={remind} onChange={setRemind} label="Me rappeler de fixer le montant" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Rubrique</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {visibleCats.map((c) => {
            const sel = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setError('');
                }}
                className={`h-9 pl-1 pr-2.5 rounded-full border flex items-center gap-1.5 text-xs font-semibold transition ${
                  sel ? 'border-transparent text-white' : 'border-[var(--color-border)] text-[var(--color-text)]'
                }`}
                style={sel ? { backgroundColor: c.color } : undefined}
                aria-pressed={sel}
              >
                <RubricBadge icon={c.icon} color={sel ? '#FFFFFF' : c.color} size="sm" className="!w-7 !h-7 rounded-full" />
                <span className="truncate max-w-[130px]">{c.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNewRubric}
            className="h-9 px-3 rounded-full border border-dashed border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> Nouvelle rubrique…
          </button>
        </div>
        {selectedCat?.budgetMode === 'envelope' && !line && (
          <span className="text-[10px] text-[var(--color-text-muted)] px-0.5">
            « {selectedCat.name} » est une enveloppe : elle passera en lignes, son montant devient la première ligne.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Récurrence</FieldLabel>
        <Segmented<RecurrenceChoice>
          value={choice}
          onChange={(v) => {
            setChoice(v);
            setTouchedRecurrence(true);
          }}
          size="sm"
          options={[
            { value: 'once', label: 'Ce mois seulement' },
            { value: 'monthly', label: 'Chaque mois' },
            { value: 'months', label: 'Certains mois' },
            { value: 'yearly', label: 'Chaque année' },
          ]}
        />
        {(choice === 'months' || choice === 'yearly') && (
          <div className="grid grid-cols-6 gap-1.5">
            {MONTH_NAMES.map((name, i) => {
              const m = i + 1;
              const sel = choice === 'months' ? months.includes(m) : yearMonth === m;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setTouchedRecurrence(true);
                    if (choice === 'yearly') setYearMonth(m);
                    else setMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
                  }}
                  className={`h-8 rounded-lg text-[11px] font-heading font-bold transition ${
                    sel ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                  }`}
                  aria-pressed={sel}
                  aria-label={name}
                >
                  {shortMonth(`2000-${String(m).padStart(2, '0')}`)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="line-note">Note (facultatif)</FieldLabel>
        <input
          id="line-note"
          className={inputClass}
          value={note}
          maxLength={200}
          onChange={(e) => setNote(e.target.value)}
          onFocus={() => setShowKeypad(false)}
          placeholder="Ex : payer avant le 5"
        />
      </div>
    </Sheet>
  );
};
