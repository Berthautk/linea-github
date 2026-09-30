import React, { useState } from 'react';
import { Check, HandCoins, Plus, Trash2 } from 'lucide-react';
import { fmt, generateId, todayStr } from '../lib/budget-math';
import { debtRemaining } from '../lib/plan';
import { Debt } from '../lib/types';
import { MAX_NAME_LENGTH, validateAmount, validateName } from '../lib/validation';
import { ErrorText, FieldLabel, inputClass, PrimaryButton, Segmented, Sheet } from './ui';

interface Props {
  open: boolean;
  debts: Debt[];
  debtsRubricName?: string;
  onAdd: (d: Debt) => string | null;
  onPay: (d: Debt, amount: number) => void;
  onDelete: (d: Debt) => void;
  onClose: () => void;
}

export const DebtsSheet: React.FC<Props> = ({ open, debts, debtsRubricName, onAdd, onPay, onDelete, onClose }) => {
  const [mode, setMode] = useState<'list' | 'add' | 'pay'>('list');
  const [current, setCurrent] = useState<Debt | null>(null);
  const [person, setPerson] = useState('');
  const [direction, setDirection] = useState<Debt['direction']>('i_owe');
  const [amount, setAmount] = useState('');
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setMode('list');
    setCurrent(null);
    setPerson('');
    setAmount('');
    setDue('');
    setNote('');
    setError('');
  };

  const active = debts.filter((d) => d.status === 'active');
  const settled = debts.filter((d) => d.status === 'settled');
  const iOwe = active.filter((d) => d.direction === 'i_owe').reduce((s, d) => s + debtRemaining(d), 0);
  const owedToMe = active.filter((d) => d.direction === 'they_owe').reduce((s, d) => s + debtRemaining(d), 0);

  const submitAdd = () => {
    const n = validateName(person, 'Le nom');
    if (!n.ok) return setError(n.error);
    const a = validateAmount(amount, false);
    if (!a.ok || !a.value) return setError(a.ok ? 'Indiquez un montant.' : a.error);
    const debt: Debt = {
      id: generateId(),
      person: n.value,
      direction,
      principal: a.value,
      createdAt: todayStr(),
      payments: [],
      status: 'active',
    };
    if (due) debt.dueDate = due;
    if (note.trim()) debt.note = note.trim().slice(0, 200);
    const err = onAdd(debt);
    if (err) return setError(err);
    reset();
  };

  const submitPay = () => {
    if (!current) return;
    const a = validateAmount(amount, false);
    if (!a.ok || !a.value) return setError(a.ok ? 'Indiquez un montant.' : a.error);
    onPay(current, Math.min(a.value, debtRemaining(current)));
    reset();
  };

  const footer =
    mode === 'add' ? (
      <>
        <ErrorText>{error}</ErrorText>
        <PrimaryButton onClick={submitAdd}>
          <Check size={18} /> Enregistrer la dette
        </PrimaryButton>
      </>
    ) : mode === 'pay' ? (
      <>
        <ErrorText>{error}</ErrorText>
        <PrimaryButton onClick={submitPay}>
          <HandCoins size={18} /> {current?.direction === 'i_owe' ? 'Enregistrer le paiement' : 'Enregistrer le remboursement reçu'}
        </PrimaryButton>
      </>
    ) : (
      <PrimaryButton onClick={() => setMode('add')}>
        <Plus size={18} /> Nouvelle dette
      </PrimaryButton>
    );

  return (
    <Sheet
      open={open}
      title={mode === 'add' ? 'Nouvelle dette' : mode === 'pay' ? current?.person || 'Paiement' : 'Carnet de dettes'}
      onClose={() => {
        reset();
        onClose();
      }}
      footer={footer}
    >
      {mode === 'list' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-[var(--color-expense-soft)]">
              <span className="block text-[10px] font-semibold text-[var(--color-text-muted)]">Je dois encore</span>
              <b className="text-base font-heading num">{fmt(iOwe)} F</b>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--color-income-soft)]">
              <span className="block text-[10px] font-semibold text-[var(--color-text-muted)]">On me doit encore</span>
              <b className="text-base font-heading num">{fmt(owedToMe)} F</b>
            </div>
          </div>
          <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
            Chaque dette que vous devez apparaît comme une ligne de la rubrique « {debtsRubricName || 'Dettes'} », avec ce qu’il reste à payer.
          </p>
          {!active.length && <p className="m-0 py-3 text-xs text-center text-[var(--color-text-muted)]">Aucune dette en cours.</p>}
          {active.map((d) => (
            <div key={d.id} className="min-h-14 px-3 py-2 rounded-2xl border border-[var(--color-border)] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrent(d);
                  setAmount(String(debtRemaining(d)));
                  setMode('pay');
                }}
                className="flex-1 min-w-0 text-left"
              >
                <span className="block text-xs font-semibold truncate">{d.person}</span>
                <span className="block text-[10px] text-[var(--color-text-muted)]">
                  {d.direction === 'i_owe' ? 'Je dois' : 'Me doit'} · reste {fmt(debtRemaining(d))} F sur {fmt(d.principal)} F
                  {d.dueDate ? ` · avant le ${d.dueDate.slice(8, 10)}/${d.dueDate.slice(5, 7)}` : ''}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(d)}
                className="w-9 h-9 rounded-lg text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)] flex items-center justify-center"
                aria-label={`Supprimer la dette ${d.person}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {settled.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-[var(--color-text-muted)] font-semibold py-1">Soldées ({settled.length})</summary>
              {settled.map((d) => (
                <div key={d.id} className="py-1.5 flex justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>{d.person}</span>
                  <span className="num">{fmt(d.principal)} F</span>
                </div>
              ))}
            </details>
          )}
        </>
      )}

      {mode === 'add' && (
        <>
          <Segmented<Debt['direction']>
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'i_owe', label: 'Je dois' },
              { value: 'they_owe', label: 'On me doit' },
            ]}
          />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="debt-person">{direction === 'i_owe' ? 'À qui ?' : 'Qui ?'}</FieldLabel>
            <input id="debt-person" className={inputClass} value={person} maxLength={MAX_NAME_LENGTH} onChange={(e) => setPerson(e.target.value)} placeholder="Ex : Claude, boutique du quartier" />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="debt-amount">Montant (F)</FieldLabel>
            <input id="debt-amount" className={`${inputClass} num font-heading font-bold`} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 9))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="debt-due">À rembourser avant (facultatif)</FieldLabel>
              <input id="debt-due" type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="debt-note">Note</FieldLabel>
              <input id="debt-note" className={inputClass} value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <button type="button" onClick={reset} className="text-xs font-semibold text-[var(--color-text-muted)] py-1">
            Retour au carnet
          </button>
        </>
      )}

      {mode === 'pay' && current && (
        <>
          <p className="m-0 text-xs text-[var(--color-text-muted)]">
            Reste {fmt(debtRemaining(current))} F sur {fmt(current.principal)} F.
            {current.direction === 'i_owe' ? ' Le paiement est noté comme une dépense de la ligne de cette dette.' : ''}
          </p>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="debt-pay">Montant (F)</FieldLabel>
            <input id="debt-pay" className={`${inputClass} num font-heading font-bold`} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 9))} />
          </div>
          <button type="button" onClick={reset} className="text-xs font-semibold text-[var(--color-text-muted)] py-1">
            Retour au carnet
          </button>
        </>
      )}
    </Sheet>
  );
};
