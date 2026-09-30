import React, { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ClipboardList, Copy, FilePlus2, ListChecks } from 'lucide-react';
import { fmt, monthName } from '../lib/budget-math';
import { SUGGESTED_RUBRICS } from '../lib/catalog';
import { RubricBadge } from '../lib/icons';
import { ImportRow } from '../lib/importer';
import { CategoryKind } from '../lib/types';
import { MAX_NAME_LENGTH, nameKey } from '../lib/validation';
import { ImportPanel } from './ImportPanel';
import { ErrorText, inputClass, PrimaryButton } from './ui';

export type SetupStep = 'name' | 'choose' | 'pick' | 'amounts' | 'copy' | 'import';

export interface PickedRubric {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  amount: number | null;
}

export interface CopySource {
  id: string;
  label: string;
}

interface Props {
  needName: boolean;
  /** Only ask the first name (the budget already exists). */
  nameOnly?: boolean;
  initialStep?: SetupStep;
  monthKey: string;
  existingRubrics: string[];
  copySources: CopySource[];
  onSaveName: (name: string) => void;
  onZero: () => void;
  onPick: (rubrics: PickedRubric[]) => string | null;
  onCopy: (sourceId: string) => string | null;
  onImport: (rows: ImportRow[]) => string | null;
  /** Present when opened from the app (not the first launch). */
  onClose?: () => void;
}

export const BudgetSetupFlow: React.FC<Props> = ({
  needName,
  nameOnly,
  initialStep,
  monthKey,
  existingRubrics,
  copySources,
  onSaveName,
  onZero,
  onPick,
  onCopy,
  onImport,
  onClose,
}) => {
  const [step, setStep] = useState<SetupStep>(needName ? 'name' : initialStep || 'choose');
  const [name, setName] = useState('');
  const existingKeys = new Set(existingRubrics.map(nameKey));
  const [picked, setPicked] = useState(() =>
    SUGGESTED_RUBRICS.map((s) => ({ ...s, on: false, label: s.name, amount: '' }))
  );
  const [error, setError] = useState('');

  const back = () => {
    setError('');
    if (step === 'amounts') setStep('pick');
    else if (step === 'choose' || step === initialStep) onClose?.();
    else setStep('choose');
  };

  const chosen = picked.filter((p) => p.on);

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-background)] flex justify-center">
      <div className="w-full max-w-[480px] h-[100dvh] flex flex-col">
        <header className="px-4 pt-4 pb-2 flex items-center gap-2 shrink-0">
          {(step !== 'name' && (step !== 'choose' || onClose)) && (
            <button
              type="button"
              onClick={back}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
              aria-label="Retour"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="m-0 text-lg font-heading font-extrabold text-[var(--color-text)]">
            {step === 'name'
              ? 'Comment vous appelez-vous ?'
              : step === 'pick'
              ? 'Choisissez vos rubriques'
              : step === 'amounts'
              ? 'Combien par mois ?'
              : step === 'copy'
              ? 'Copier un autre mois'
              : step === 'import'
              ? 'Importer ma fiche'
              : 'Construisons votre budget'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3 no-scrollbar">
          {step === 'name' && (
            <>
              <p className="m-0 text-xs text-[var(--color-text-muted)]">
                Votre prénom s’affiche dans l’accueil et, pour votre partenaire, dans la vue Famille.
              </p>
              <input
                className={inputClass}
                value={name}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Votre prénom"
                autoFocus
                aria-label="Votre prénom"
              />
            </>
          )}

          {step === 'choose' && (
            <>
              <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
                Vos rubriques et vos lignes vous appartiennent : vous pourrez tout renommer, ajouter ou supprimer ensuite.
              </p>
              {[
                {
                  id: 'pick' as const,
                  icon: <ListChecks size={20} />,
                  title: 'Choisir des rubriques',
                  desc: 'Une liste de suggestions à cocher, puis un montant par rubrique si vous le souhaitez.',
                },
                {
                  id: 'import' as const,
                  icon: <ClipboardList size={20} />,
                  title: 'Importer ma fiche',
                  desc: 'Collez votre liste (« Loyer 50000 / Eau 5000 ») et vérifiez l’aperçu.',
                },
                ...(copySources.length
                  ? [
                      {
                        id: 'copy' as const,
                        icon: <Copy size={20} />,
                        title: 'Copier un autre mois',
                        desc: 'Reprendre la structure d’un mois existant, sans ses opérations.',
                      },
                    ]
                  : []),
                {
                  id: 'zero' as const,
                  icon: <FilePlus2 size={20} />,
                  title: 'Partir de zéro',
                  desc: 'Aucune rubrique : vous créez tout vous-même.',
                },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => (o.id === 'zero' ? onZero() : setStep(o.id))}
                  className="w-full p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-left flex items-center gap-3 hover:border-[var(--color-primary)] active:scale-[0.99] transition"
                >
                  <span className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    {o.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-heading font-bold text-[var(--color-text)]">{o.title}</span>
                    <span className="block text-[11px] text-[var(--color-text-muted)] leading-snug">{o.desc}</span>
                  </span>
                  <ArrowRight size={16} className="text-[var(--color-text-muted)] shrink-0" />
                </button>
              ))}
            </>
          )}

          {step === 'pick' && (
            <>
              <p className="m-0 text-xs text-[var(--color-text-muted)]">Toutes sont facultatives. Touchez un nom pour le changer.</p>
              {picked.map((p, i) => {
                const exists = existingKeys.has(nameKey(p.label));
                return (
                  <div
                    key={p.name}
                    className={`min-h-14 px-3 py-2 rounded-2xl border flex items-center gap-2.5 ${
                      p.on ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={p.on}
                      aria-label={`Choisir ${p.label}`}
                      onClick={() => setPicked((ps) => ps.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                        p.on ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)]'
                      }`}
                    >
                      {p.on && <Check size={14} />}
                    </button>
                    <RubricBadge icon={p.icon} color={p.color} size="sm" />
                    <input
                      value={p.label}
                      maxLength={MAX_NAME_LENGTH}
                      onChange={(e) =>
                        setPicked((ps) => ps.map((x, j) => (j === i ? { ...x, label: e.target.value, on: true } : x)))
                      }
                      className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-[var(--color-text)] focus:outline-hidden"
                      aria-label="Nom de la rubrique"
                    />
                    {exists && <span className="text-[10px] text-[var(--color-text-muted)]">déjà là</span>}
                  </div>
                );
              })}
            </>
          )}

          {step === 'amounts' && (
            <>
              <p className="m-0 text-xs text-[var(--color-text-muted)]">
                Un montant par rubrique pour le mois. Laissez vide pour le fixer plus tard.
              </p>
              {chosen.map((p) => (
                <div key={p.name} className="min-h-14 px-3 py-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2.5">
                  <RubricBadge icon={p.icon} color={p.color} size="sm" />
                  <span className="flex-1 min-w-0 text-sm font-semibold text-[var(--color-text)] truncate">{p.label}</span>
                  <input
                    inputMode="numeric"
                    value={p.amount}
                    placeholder="Passer"
                    onChange={(e) =>
                      setPicked((ps) =>
                        ps.map((x) => (x.name === p.name ? { ...x, amount: e.target.value.replace(/\D/g, '').slice(0, 9) } : x))
                      )
                    }
                    className="w-28 px-2.5 py-2 rounded-xl border border-[var(--color-border)] text-right text-sm font-heading font-bold num bg-[var(--color-surface)]"
                    aria-label={`Montant ${p.label}`}
                  />
                </div>
              ))}
              <span className="text-[11px] text-[var(--color-text-muted)] text-right num">
                Total {fmt(chosen.reduce((s, p) => s + (parseInt(p.amount, 10) || 0), 0))} F
              </span>
            </>
          )}

          {step === 'copy' && (
            <>
              <p className="m-0 text-xs text-[var(--color-text-muted)]">
                Les rubriques et les lignes du mois choisi sont copiées dans {monthName(monthKey).toLowerCase()}.
              </p>
              {copySources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    const err = onCopy(s.id);
                    if (err) setError(err);
                  }}
                  className="w-full p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-left text-sm font-semibold text-[var(--color-text)] flex items-center justify-between hover:border-[var(--color-primary)]"
                >
                  {s.label}
                  <ArrowRight size={16} className="text-[var(--color-text-muted)]" />
                </button>
              ))}
            </>
          )}

          {step === 'import' && <ImportPanel existingRubrics={existingRubrics} onConfirm={onImport} />}
        </main>

        {(step === 'name' || step === 'pick' || step === 'amounts' || error) && (
          <footer className="px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-[var(--color-border)] flex flex-col gap-2 shrink-0 bg-[var(--color-background)]">
            <ErrorText>{error}</ErrorText>
            {step === 'name' && (
              <PrimaryButton
                disabled={!name.trim()}
                onClick={() => {
                  if (!name.trim()) return setError('Votre prénom est obligatoire.');
                  onSaveName(name.trim().slice(0, MAX_NAME_LENGTH));
                  if (nameOnly) return;
                  setStep(initialStep || 'choose');
                }}
              >
                Continuer <ArrowRight size={16} />
              </PrimaryButton>
            )}
            {step === 'pick' && (
              <PrimaryButton
                disabled={!chosen.length}
                onClick={() => {
                  const keys = chosen.map((p) => nameKey(p.label));
                  if (keys.some((k) => !k)) return setError('Chaque rubrique cochée doit avoir un nom.');
                  if (new Set(keys).size !== keys.length) return setError('Deux rubriques cochées ont le même nom.');
                  setError('');
                  setStep('amounts');
                }}
              >
                Continuer ({chosen.length}) <ArrowRight size={16} />
              </PrimaryButton>
            )}
            {step === 'amounts' && (
              <PrimaryButton
                onClick={() => {
                  const err = onPick(
                    chosen.map((p) => ({
                      name: p.label,
                      icon: p.icon,
                      color: p.color,
                      kind: p.kind,
                      amount: p.amount ? parseInt(p.amount, 10) : null,
                    }))
                  );
                  if (err) setError(err);
                }}
              >
                <Check size={18} /> Créer mon budget
              </PrimaryButton>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};
