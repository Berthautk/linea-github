import React, { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { deMonth, fmt, monthName } from '../lib/budget-math';
import { RubricBadge } from '../lib/icons';
import { MonthReview, ReviewRow } from '../lib/plan';
import { Category } from '../lib/types';
import { PrimaryButton, Sheet } from './ui';

interface Props {
  open: boolean;
  review: MonthReview | null;
  categories: Category[];
  onCreate: (review: MonthReview) => void;
  onSkip: () => void;
}

type Group = 'recurring' | 'seasonal' | 'debts' | 'lastOneoffs' | 'unpaid';

const GROUPS: Array<{ key: Group; title: string; toggle: string; empty?: string }> = [
  { key: 'recurring', title: 'Reviennent chaque mois', toggle: 'Garder' },
  { key: 'seasonal', title: 'Saisonnières prévues ce mois', toggle: 'Garder' },
  { key: 'debts', title: 'Dettes en cours (carnet)', toggle: 'Garder' },
  { key: 'lastOneoffs', title: 'Ponctuelles du mois dernier', toggle: 'Reprendre' },
  { key: 'unpaid', title: 'Non payé le mois dernier', toggle: 'Reporter le reste' },
];

function parseAmt(s: string): number | null {
  const d = s.replace(/\D/g, '').slice(0, 9);
  return d ? parseInt(d, 10) : null;
}

export const MonthReviewSheet: React.FC<Props> = ({ open, review, categories, onCreate, onSkip }) => {
  const [draft, setDraft] = useState<MonthReview | null>(review);

  useEffect(() => {
    if (open) setDraft(review ? JSON.parse(JSON.stringify(review)) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, review?.monthKey]);

  if (!open || !draft) return null;
  const cats = new Map(categories.map((c) => [c.id, c]));

  const patchRow = (g: Group, key: string, patch: Partial<ReviewRow>) =>
    setDraft((d) => (d ? { ...d, [g]: d[g].map((r) => (r.key === key ? { ...r, ...patch } : r)) } : d));

  const total = [...draft.recurring, ...draft.seasonal, ...draft.debts, ...draft.lastOneoffs, ...draft.unpaid]
    .filter((r) => r.include && cats.get(r.categoryId)?.kind !== 'in')
    .reduce((s, r) => s + (r.amount || 0), 0) +
    draft.envelopes.reduce((s, e) => s + (e.amount || 0), 0);

  const nothing = GROUPS.every((g) => !draft[g.key].length) && !draft.envelopes.length;

  return (
    <Sheet
      open={open}
      full
      title={`Préparer ${monthName(draft.monthKey).toLowerCase()}`}
      onClose={onSkip}
      footer={
        <>
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] px-0.5">
            <span>Dépenses et épargne prévues</span>
            <b className="num text-[var(--color-text)]">{fmt(total)} F</b>
          </div>
          <PrimaryButton onClick={() => onCreate(draft)}>
            <CalendarCheck size={18} /> Créer le plan {deMonth(draft.monthKey)}
          </PrimaryButton>
          <button type="button" onClick={onSkip} className="text-xs font-semibold text-[var(--color-text-muted)] py-1">
            Plus tard
          </button>
        </>
      }
    >
      <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
        Choisissez ce qui revient ce mois-ci. Les lignes ponctuelles du mois dernier ne sont pas reprises, sauf si vous le
        demandez. Vous pourrez tout modifier ensuite.
      </p>

      {nothing && (
        <div className="p-4 rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-center text-[var(--color-text-muted)]">
          Aucune ligne à reprendre. Le plan sera vide : ajoutez vos lignes ensuite.
        </div>
      )}

      {GROUPS.map((g) =>
        draft[g.key].length ? (
          <section key={g.key} className="flex flex-col gap-1.5">
            <h4 className="m-0 text-xs font-heading font-bold text-[var(--color-text)] px-0.5">
              {g.title} <span className="text-[var(--color-text-muted)] font-normal">· {draft[g.key].length}</span>
            </h4>
            {draft[g.key].map((r) => {
              const c = cats.get(r.categoryId);
              return (
                <div
                  key={r.key}
                  className={`min-h-14 px-3 py-2 rounded-2xl border flex items-center gap-2.5 transition ${
                    r.include
                      ? 'border-[var(--color-border)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)]/60 bg-[var(--color-surface-subtle)] opacity-70'
                  }`}
                >
                  <RubricBadge icon={c?.icon} color={c?.color} size="sm" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <span className="block text-xs font-semibold text-[var(--color-text)] truncate">{r.label}</span>
                    <span className="block text-[10px] text-[var(--color-text-muted)] truncate">
                      {c?.name}
                      {r.hint ? ` · ${r.hint}` : ''}
                    </span>
                  </div>
                  <input
                    inputMode="numeric"
                    value={r.amount === null ? '' : String(r.amount)}
                    placeholder="Sans montant"
                    onChange={(e) => patchRow(g.key, r.key, { amount: parseAmt(e.target.value) })}
                    className="w-[104px] px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-right text-xs font-heading font-bold num placeholder:text-[10px] placeholder:font-normal"
                    aria-label={`Montant ${r.label}`}
                  />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.include}
                    aria-label={`${g.toggle} ${r.label}`}
                    onClick={() => patchRow(g.key, r.key, { include: !r.include })}
                    className={`relative w-10 h-6 rounded-full shrink-0 transition ${
                      r.include ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        r.include ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
            {(g.key === 'lastOneoffs' || g.key === 'unpaid') && (
              <span className="text-[10px] text-[var(--color-text-muted)] px-0.5">
                Interrupteur : « {g.toggle} ». Désactivé par défaut.
              </span>
            )}
          </section>
        ) : null
      )}

      {draft.envelopes.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h4 className="m-0 text-xs font-heading font-bold text-[var(--color-text)] px-0.5">Enveloppes</h4>
          {draft.envelopes.map((e) => {
            const c = cats.get(e.categoryId);
            return (
              <div
                key={e.categoryId}
                className="min-h-14 px-3 py-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2.5"
              >
                <RubricBadge icon={c?.icon} color={c?.color} size="sm" />
                <div className="min-w-0 flex-1 leading-tight">
                  <span className="block text-xs font-semibold text-[var(--color-text)] truncate">{c?.name}</span>
                  {e.rollover > 0 && (
                    <span className="block text-[10px] text-[var(--color-text-muted)]">
                      Dont {fmt(e.rollover)} F non dépensés le mois dernier
                    </span>
                  )}
                </div>
                <input
                  inputMode="numeric"
                  value={e.amount === null ? '' : String(e.amount)}
                  placeholder="Sans montant"
                  onChange={(ev) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            envelopes: d.envelopes.map((x) =>
                              x.categoryId === e.categoryId ? { ...x, amount: parseAmt(ev.target.value) } : x
                            ),
                          }
                        : d
                    )
                  }
                  className="w-[104px] px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-right text-xs font-heading font-bold num placeholder:text-[10px] placeholder:font-normal"
                  aria-label={`Enveloppe ${c?.name}`}
                />
              </div>
            );
          })}
        </section>
      )}
    </Sheet>
  );
};
