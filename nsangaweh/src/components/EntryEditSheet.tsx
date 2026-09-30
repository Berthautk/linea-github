import React, { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { sortCategories } from '../lib/calc';
import { triggerHaptic } from '../lib/haptics';
import { Category, Entry, MonthDoc } from '../lib/types';
import { MAX_NAME_LENGTH, validateAmount } from '../lib/validation';
import { ErrorText, FieldLabel, inputClass, PrimaryButton, Sheet } from './ui';

interface Props {
  isOpen: boolean;
  entry: Entry | null;
  month?: MonthDoc;
  categories: Category[];
  onClose: () => void;
  onSave: (updated: Entry) => void;
  onDelete: (id: string) => void;
}

export const EntryEditSheet: React.FC<Props> = ({ isOpen, entry, month, categories, onClose, onSave, onDelete }) => {
  const [amt, setAmt] = useState('');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lineId, setLineId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !entry) return;
    setAmt(String(entry.amt));
    setLabel(entry.label || '');
    setDate(entry.d);
    setCategoryId(entry.categoryId || '');
    setLineId(entry.lineId || '');
    setError('');
  }, [isOpen, entry?.id]);

  if (!isOpen || !entry) return null;

  const isTransfer = entry.t === 'transfer';
  const kind = entry.t === 'in' ? 'in' : entry.t === 'save' ? 'save' : 'out';
  const cats = sortCategories(categories.filter((c) => (!c.archived || c.id === entry.categoryId) && (c.kind === kind || (kind === 'out' && c.kind === 'save'))));
  const lines = (month?.lines || []).filter((l) => l.categoryId === categoryId && (!l.archived || l.id === entry.lineId));

  const submit = () => {
    const a = validateAmount(amt.replace(/\D/g, ''), false);
    if (!a.ok || !a.value) return setError(a.ok ? 'Le montant doit être supérieur à zéro.' : a.error);
    if (!date) return setError('Choisissez une date.');
    triggerHaptic('success');
    onSave({
      ...entry,
      amt: a.value,
      label: label.trim().slice(0, MAX_NAME_LENGTH),
      d: date,
      categoryId: isTransfer ? null : categoryId || null,
      lineId: isTransfer ? null : lineId || null,
    });
  };

  return (
    <Sheet
      open={isOpen}
      title="Détail de l’opération"
      onClose={onClose}
      footer={
        <>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton onClick={submit}>
            <Check size={18} /> Enregistrer
          </PrimaryButton>
          <PrimaryButton tone="danger" onClick={() => onDelete(entry.id)}>
            <Trash2 size={16} /> Supprimer
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="entry-amt">Montant (F)</FieldLabel>
        <input
          id="entry-amt"
          inputMode="numeric"
          value={amt}
          onChange={(e) => setAmt(e.target.value.replace(/\D/g, '').slice(0, 9))}
          className={`${inputClass} text-2xl font-heading font-bold num`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="entry-label">Libellé</FieldLabel>
        <input id="entry-label" value={label} maxLength={MAX_NAME_LENGTH} onChange={(e) => setLabel(e.target.value)} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="entry-date">Date</FieldLabel>
        <input id="entry-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      {!isTransfer && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="entry-cat">Rubrique</FieldLabel>
            <select
              id="entry-cat"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setLineId('');
              }}
              className={inputClass}
            >
              <option value="">Sans rubrique</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.archived ? ' (archivée)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="entry-line">Ligne</FieldLabel>
            <select id="entry-line" value={lineId} onChange={(e) => setLineId(e.target.value)} className={inputClass} disabled={!categoryId}>
              <option value="">Hors lignes</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {isTransfer && (
        <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
          Virement entre vos comptes : il ne compte jamais comme une dépense.
        </p>
      )}
    </Sheet>
  );
};
