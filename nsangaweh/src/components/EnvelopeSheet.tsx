import React, { useEffect, useState } from 'react';
import { fmt } from '../lib/budget-math';
import { Category } from '../lib/types';
import { ErrorText, Keypad, PrimaryButton, Sheet, Toggle } from './ui';

interface Props {
  open: boolean;
  category: Category | null;
  amount: number | null;
  spent: number;
  onSave: (amount: number | null, scope: 'month' | 'following') => string | null;
  onClose: () => void;
}

export const EnvelopeSheet: React.FC<Props> = ({ open, category, amount, spent, onSave, onClose }) => {
  const [value, setValue] = useState('');
  const [none, setNone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue(amount ? String(amount) : '');
    setNone(amount === null);
    setError('');
  }, [open, category?.id, amount]);

  const save = (scope: 'month' | 'following') => {
    const v = none ? null : value ? parseInt(value, 10) : 0;
    const err = onSave(v, scope);
    if (err) setError(err);
  };

  return (
    <Sheet
      open={open}
      title={`Enveloppe ${category?.name || ''}`}
      onClose={onClose}
      footer={
        <>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton onClick={() => save('month')}>Seulement ce mois</PrimaryButton>
          <PrimaryButton tone="ghost" onClick={() => save('following')}>
            Ce mois et les suivants
          </PrimaryButton>
        </>
      }
    >
      <p className="m-0 text-xs text-[var(--color-text-muted)]">
        Un seul montant pour toute la rubrique. Déjà dépensé ce mois-ci : <b className="num">{fmt(spent)} F</b>.
      </p>
      {!none && (
        <>
          <div className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-right">
            <span className="text-2xl font-heading font-extrabold num">{value ? fmt(parseInt(value, 10)) : '0'}</span>{' '}
            <span className="text-xs font-bold text-[var(--color-primary)]">F</span>
          </div>
          <Keypad value={value} onChange={setValue} />
        </>
      )}
      <Toggle checked={none} onChange={setNone} label="Sans montant fixé" />
    </Sheet>
  );
};
