import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  GripVertical,
  HandCoins,
  Info,
  ListChecks,
  Minus,
  MoreHorizontal,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { currentMonthKey, daysInMonth, fmt, fmtS, monthName, todayStr } from '../lib/budget-math';
import { CategoryCalc, describeEntry, effectiveKind, LineCalc, MonthCalc, rankExpenses } from '../lib/calc';
import { useDragReorder, useRowGestures } from '../lib/gestures';
import { triggerHaptic } from '../lib/haptics';
import { NO_RUBRIC_STYLE, RubricBadge } from '../lib/icons';
import { Category, MonthLine, Wallet } from '../lib/types';
import { ActionSheet, PrimaryButton } from './ui';

interface Props {
  monthKey: string;
  calc: MonthCalc;
  categories: Category[];
  myName: string;
  showTemplateStrip: boolean;
  previousPlanned: string | null;
  openRubric: string | null;
  onToggleRubric: (id: string | null) => void;
  onDismissStrip: () => void;
  onAddIncome: () => void;
  onAddRubric: () => void;
  onAddLine: (categoryId?: string) => void;
  onEditLine: (line: MonthLine) => void;
  onPayLine: (line: MonthLine) => void;
  onRubricMenu: (cat: Category) => void;
  onEditEnvelope: (cat: Category) => void;
  onReorderCategories: (ids: string[]) => void;
  onReorderLines: (ids: string[]) => void;
  onStartMonth: () => void;
  onPrepareMonth: () => void;
  onChooseRubrics: () => void;
  onImport: () => void;
  wallets: Wallet[];
  showHelp: boolean;
  onDismissHelp: () => void;
  onOpenQuickAdd: (type: 'in' | 'out') => void;
  onOpenHistory: () => void;
}

export const AccueilScreen: React.FC<Props> = (props) => {
  const { monthKey, calc, categories } = props;
  const [subTab, setSubTab] = useState<'plan' | 'classement' | 'graphique'>('plan');
  const [reorder, setReorder] = useState(false);
  const [plusMenu, setPlusMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const active = categories.filter((c) => !c.archived);
  const noPlan = !calc.hasPlan;

  return (
    <div className="flex flex-col gap-3 pb-28">
      {props.showHelp && <HelpCard onDismiss={props.onDismissHelp} />}

      <SummaryCard calc={calc} monthKey={monthKey} onInfo={() => setShowInfo(true)} />

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            props.onOpenQuickAdd('out');
          }}
          className="min-h-16 rounded-2xl bg-[var(--color-expense)] text-white font-heading font-extrabold text-base flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
        >
          <Minus size={22} strokeWidth={3} />
          <span className="leading-tight text-left">
            Sortie
            <span className="block text-[11px] font-semibold opacity-90">J’ai payé</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            props.onOpenQuickAdd('in');
          }}
          className="min-h-16 rounded-2xl bg-[var(--color-income)] text-white font-heading font-extrabold text-base flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
        >
          <Plus size={22} strokeWidth={3} />
          <span className="leading-tight text-left">
            Entrée
            <span className="block text-[11px] font-semibold opacity-90">J’ai reçu</span>
          </span>
        </button>
      </div>

      <RecentOps calc={calc} categories={categories} wallets={props.wallets} onOpenHistory={props.onOpenHistory} />

      <div className="pt-2 px-1">
        <h2 className="m-0 text-base font-heading font-extrabold text-[var(--color-text)]">Mon budget du mois</h2>
        <p className="m-0 text-[11px] text-[var(--color-text-muted)] leading-snug">
          Ce que vous aviez prévu de recevoir et de payer, et où vous en êtes. « 30 000 / 50 000 F » veut dire : 30 000 F déjà
          payés sur 50 000 F prévus.
        </p>
      </div>

      {!active.length ? (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs flex flex-col items-center text-center gap-2.5">
          <p className="m-0 text-sm font-heading font-bold">Vous n’avez pas encore de budget</p>
          <p className="m-0 text-xs text-[var(--color-text-muted)] max-w-xs">
            Ce n’est pas obligatoire pour noter vos entrées et sorties. Le budget sert à prévoir ce que vous allez payer.
          </p>
          <div className="w-full max-w-xs flex flex-col gap-2 pt-1">
            <PrimaryButton onClick={props.onChooseRubrics}>
              <ListChecks size={18} /> Choisir des rubriques
            </PrimaryButton>
            <PrimaryButton tone="ghost" onClick={props.onImport}>
              <ClipboardList size={18} /> Importer ma fiche
            </PrimaryButton>
          </div>
        </section>
      ) : (
        <>
          {props.showTemplateStrip && calc.unsetCount > 0 && (
            <div className="min-h-10 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text)]">
              <span>
                {calc.unsetCount} ligne{calc.unsetCount > 1 ? 's' : ''} sans montant : touchez une ligne pour mettre un montant.
              </span>
              <button type="button" onClick={props.onDismissStrip} className="p-1 text-[var(--color-text-muted)]" aria-label="Ne plus afficher">
                <X size={14} />
              </button>
            </div>
          )}

          {noPlan && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <CalendarPlus size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 text-sm font-heading font-extrabold text-[var(--color-text)]">
                    Le budget de {monthName(monthKey).toLowerCase()} n’est pas encore prêt
                  </h3>
                  <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
                    Reprenez ce qui revient chaque mois (loyer, eau…) en un geste.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PrimaryButton onClick={props.onPrepareMonth}>Vérifier et créer</PrimaryButton>
                <PrimaryButton tone="ghost" onClick={props.onStartMonth}>
                  Créer directement
                </PrimaryButton>
              </div>
            </section>
          )}

          <div className="grid grid-cols-3 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
            {(['plan', 'classement', 'graphique'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSubTab(t);
                }}
                className={`py-2 rounded-lg text-xs font-heading font-bold transition ${
                  subTab === t ? 'bg-[var(--color-primary)] text-white shadow-xs' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {t === 'plan' ? 'Par rubrique' : t === 'classement' ? 'Plus grosses sorties' : 'Graphique'}
              </button>
            ))}
          </div>

          {subTab === 'plan' && (
            <>
              <IncomeSection calc={calc} onAddIncome={props.onAddIncome} onEditLine={props.onEditLine} onPayLine={props.onPayLine} />

              <div className="flex items-center justify-between px-1 pt-1">
                <h3 className="m-0 text-sm font-heading font-extrabold text-[var(--color-text)]">Sorties prévues</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setReorder((r) => !r);
                      props.onToggleRubric(null);
                    }}
                    className={`h-9 px-3 rounded-full text-xs font-heading font-bold transition ${
                      reorder ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                    }`}
                  >
                    {reorder ? 'Terminé' : 'Changer l’ordre'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlusMenu(true)}
                    className="h-9 px-3 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-heading font-bold flex items-center gap-1 active:scale-95"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
              </div>
              <p className="m-0 px-1 -mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                Touchez une rubrique pour voir ses lignes. Touchez une ligne pour la modifier.
              </p>

              <RubricList {...props} reorder={reorder} />

              {calc.uncategorizedOut > 0 && (
                <div className="h-12 px-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RubricBadge {...NO_RUBRIC_STYLE} size="sm" />
                    <span className="text-xs font-semibold text-[var(--color-text)] truncate">Sorties sans rubrique</span>
                  </div>
                  <span className="text-xs font-heading font-bold num">{fmt(calc.uncategorizedOut)} F</span>
                </div>
              )}

              <button
                type="button"
                onClick={props.onAddRubric}
                className="h-12 rounded-2xl border-2 border-dashed border-[var(--color-border)] text-xs font-heading font-bold text-[var(--color-primary)] flex items-center justify-center gap-1.5 hover:border-[var(--color-primary)] transition"
              >
                <Plus size={16} /> Ajouter une rubrique
              </button>
            </>
          )}

          {subTab === 'classement' && <Ranking calc={calc} categories={categories} myName={props.myName} />}
          {subTab === 'graphique' && <Chart calc={calc} />}
        </>
      )}

      <ActionSheet
        open={plusMenu}
        title="Ajouter au budget"
        onClose={() => setPlusMenu(false)}
        actions={[
          {
            label: 'Une ligne à payer',
            hint: 'Ex : Loyer, Eau, Maman — dans une rubrique',
            onClick: () => {
              setPlusMenu(false);
              props.onAddLine();
            },
          },
          {
            label: 'Une rubrique',
            hint: 'Un groupe de lignes, ex : Logement, Santé',
            onClick: () => {
              setPlusMenu(false);
              props.onAddRubric();
            },
          },
          {
            label: 'Une entrée prévue',
            hint: 'Ex : Salaire, Vacation',
            onClick: () => {
              setPlusMenu(false);
              props.onAddIncome();
            },
          },
        ]}
      />

      {showInfo && <FreeInfo calc={calc} monthKey={monthKey} onClose={() => setShowInfo(false)} />}
    </div>
  );
};

const HELP_STEPS: Array<[string, string]> = [
  ['Sortie', 'Vous avez payé quelque chose ? Touchez « Sortie », tapez le montant, choisissez pour quoi, enregistrez.'],
  ['Entrée', 'Vous avez reçu de l’argent ? Touchez « Entrée ».'],
  ['Historique', 'Toutes vos opérations, jour par jour, sont dans l’onglet « Historique » en bas.'],
  ['Budget', 'Plus bas, « Mon budget » compare ce que vous aviez prévu et ce que vous avez déjà payé.'],
];

const HelpCard: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <section className="rounded-2xl border border-[var(--color-info)]/30 bg-[var(--color-info-soft)] p-3.5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <h2 className="m-0 text-sm font-heading font-extrabold text-[var(--color-text)]">Comment ça marche</h2>
      <button type="button" onClick={onDismiss} className="h-8 px-2.5 rounded-full text-[11px] font-bold text-[var(--color-info)]">
        J’ai compris
      </button>
    </div>
    <ol className="m-0 pl-0 list-none flex flex-col gap-1.5">
      {HELP_STEPS.map(([k, v], i) => (
        <li key={k} className="flex gap-2 text-xs text-[var(--color-text)] leading-snug">
          <span className="w-5 h-5 rounded-full bg-[var(--color-info)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span>{v}</span>
        </li>
      ))}
    </ol>
  </section>
);

const RecentOps: React.FC<{ calc: MonthCalc; categories: Category[]; wallets: Wallet[]; onOpenHistory: () => void }> = ({
  calc,
  categories,
  wallets,
  onOpenHistory,
}) => {
  const cats = new Map(categories.map((c) => [c.id, c]));
  const list = [...calc.month.entries]
    .filter((e) => e.status !== 'declined')
    .sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.ts - a.ts))
    .slice(0, 5);
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 text-sm font-heading font-extrabold text-[var(--color-text)]">Dernières opérations</h2>
        {calc.month.entries.length > 0 && (
          <button type="button" onClick={onOpenHistory} className="h-8 px-2 text-xs font-heading font-bold text-[var(--color-primary)]">
            Tout voir →
          </button>
        )}
      </div>
      {!list.length ? (
        <p className="m-0 px-1 py-2 text-xs text-[var(--color-text-muted)]">
          Rien encore ce mois-ci. Touchez « Sortie » ou « Entrée » pour noter votre première opération.
        </p>
      ) : (
        list.map((e) => {
          const d = describeEntry(e, cats, calc.month);
          const k = effectiveKind(e, d.category?.kind);
          const wallet = wallets.find((w) => w.id === e.w)?.name;
          return (
            <div key={e.id} className="min-h-12 px-1 flex items-center justify-between gap-2 border-t border-[var(--color-border)]/50 first-of-type:border-t-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <RubricBadge icon={d.category?.icon} color={d.category?.color} size="sm" />
                <div className="min-w-0 leading-tight">
                  <span className="block text-xs font-semibold truncate">{d.label || d.category?.name || 'Opération'}</span>
                  <span className="block text-[10px] text-[var(--color-text-muted)] truncate">
                    {e.d.slice(8, 10)}/{e.d.slice(5, 7)}
                    {d.category ? ` · ${d.category.name}` : ''}
                    {wallet ? ` · ${wallet}` : ''}
                  </span>
                </div>
              </div>
              <b
                className={`text-sm font-heading num whitespace-nowrap ${
                  k === 'in' ? 'text-[var(--color-income)]' : k === 'out' ? 'text-[var(--color-expense)]' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {k === 'in' ? '+' : k === 'out' ? '−' : ''}
                {fmt(e.amt)} F
              </b>
            </div>
          );
        })
      )}
    </section>
  );
};

/* --------------------------------- balance --------------------------------- */

function daysLeftIn(monthKey: string): number {
  if (monthKey !== currentMonthKey()) return 0;
  return Math.max(1, daysInMonth(monthKey) - parseInt(todayStr().slice(8, 10), 10) + 1);
}

const SummaryCard: React.FC<{ calc: MonthCalc; monthKey: string; onInfo: () => void }> = ({ calc, monthKey, onInfo }) => {
  const inHand = calc.inc - calc.out - calc.saved;
  const free = calc.free;
  const daysLeft = daysLeftIn(monthKey);
  return (
    <section className="rounded-3xl p-4 text-white shadow-md flex flex-col gap-3" style={{ background: 'linear-gradient(145deg, #0B6E4F 0%, #084C38 100%)' }} aria-label="Résumé du mois">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/10 p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-emerald-100 font-semibold">
            <ArrowDownLeft size={13} /> Entrées
          </span>
          <b className="block text-xl font-heading font-extrabold num leading-tight">{fmt(calc.inc)} F</b>
          <span className="block text-[10px] text-emerald-200/80">argent reçu ce mois</span>
        </div>
        <div className="rounded-2xl bg-white/10 p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-rose-100 font-semibold">
            <ArrowUpRight size={13} /> Sorties
          </span>
          <b className="block text-xl font-heading font-extrabold num leading-tight">{fmt(calc.out)} F</b>
          <span className="block text-[10px] text-emerald-200/80">argent dépensé ce mois</span>
        </div>
      </div>

      <div>
        <span className="block text-[11px] text-emerald-100 font-semibold">Reste en main</span>
        <b className={`block text-3xl font-heading font-extrabold num leading-tight ${inHand < 0 ? 'text-rose-200' : ''}`}>
          {inHand < 0 ? '−' : ''}
          {fmt(Math.abs(inHand))} F
        </b>
        <span className="block text-[10px] text-emerald-200/80">
          entrées − sorties{calc.saved > 0 ? ` − ${fmt(calc.saved)} F mis de côté` : ''}
        </span>
      </div>

      {free !== null && (calc.pOut > 0 || calc.pSave > 0) && (
        <button type="button" onClick={onInfo} className="text-left rounded-2xl bg-black/15 px-3 py-2 flex items-start gap-2">
          <Info size={15} className="shrink-0 mt-0.5 text-emerald-200" />
          <span className="text-[12px] leading-snug text-emerald-50">
            {free >= 0 ? (
              <>
                Après avoir payé tout ce qui est prévu ce mois, il vous restera <b className="num">{fmt(free)} F</b>
                {daysLeft > 0 && free > 0 ? <> (environ {fmt(free / daysLeft)} F par jour)</> : null}.
              </>
            ) : (
              <>
                Pour payer tout ce qui est prévu ce mois, il vous manque <b className="num text-rose-200">{fmt(-free)} F</b>.
              </>
            )}
            {calc.freeBasis === 'planned' ? ' (calcul fait avec les entrées prévues, pas encore reçues)' : ''}
          </span>
        </button>
      )}
    </section>
  );
};

const FreeInfo: React.FC<{ calc: MonthCalc; monthKey: string; onClose: () => void }> = ({ calc, monthKey, onClose }) => {
  const basis = calc.freeBasis === 'planned' ? calc.pIn : calc.inc;
  const daysLeft = daysLeftIn(monthKey);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xs bg-[var(--color-surface)] p-5 rounded-2xl shadow-xl flex flex-col gap-2.5 text-xs text-[var(--color-text)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Calcul du montant libre"
      >
        <h4 className="m-0 text-sm font-heading font-bold">Comment ce montant est calculé</h4>
        <div className="bg-[var(--color-surface-subtle)] p-2.5 rounded-xl flex flex-col gap-1 text-[11px]">
          <Row label={calc.freeBasis === 'planned' ? 'Revenus prévus' : 'Revenus reçus'} value={`+${fmt(basis)} F`} />
          <Row label="Déjà dépensé" value={`−${fmt(calc.out)} F`} />
          {calc.saved > 0 && <Row label="Déjà épargné" value={`−${fmt(calc.saved)} F`} />}
          <Row label="Paiements prévus restants" value={`−${fmt(calc.toPay)} F`} />
          <div className="border-t border-[var(--color-border)] pt-1 font-bold text-[var(--color-primary)]">
            <Row label="Libre après les paiements prévus" value={`${fmtS(calc.free || 0)} F`} />
          </div>
        </div>
        {(calc.free || 0) > 0 && daysLeft > 0 && (
          <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
            Environ <b>{fmt((calc.free || 0) / daysLeft)} F par jour</b> pour les {daysLeft} jours restants.
          </p>
        )}
        <PrimaryButton onClick={onClose}>Compris</PrimaryButton>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-2">
    <span>{label}</span>
    <b className="num whitespace-nowrap">{value}</b>
  </div>
);

/* --------------------------------- income --------------------------------- */

const IncomeSection: React.FC<{
  calc: MonthCalc;
  onAddIncome: () => void;
  onEditLine: (l: MonthLine) => void;
  onPayLine: (l: MonthLine) => void;
}> = ({ calc, onAddIncome, onEditLine, onPayLine }) => {
  const lines = calc.income.flatMap((c) => c.lines.map((l) => ({ l, c })));
  const unlined = calc.income.reduce((s, c) => s + c.unplanned, 0) + calc.uncategorizedIn;
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2.5 shadow-2xs flex flex-col gap-1" aria-label="Entrées prévues">
      <div className="flex items-center justify-between px-1">
        <h3 className="m-0 text-sm font-heading font-extrabold text-[var(--color-text)]">Entrées prévues</h3>
        <button
          type="button"
          onClick={onAddIncome}
          className="h-7 px-2 rounded-full text-[11px] font-heading font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] flex items-center gap-0.5"
        >
          <Plus size={13} /> Ajouter
        </button>
      </div>
      {!lines.length && !unlined && (
        <p className="m-0 px-1 pb-1 text-[11px] text-[var(--color-text-muted)]">Aucune entrée prévue. Ajoutez par exemple votre salaire pour savoir ce qu’il vous restera.</p>
      )}
      {lines.map(({ l, c }) => (
        <LineRow key={l.line.id} lc={l} cat={c.category} income onEdit={onEditLine} onPay={onPayLine} />
      ))}
      {unlined > 0 && (
        <div className="h-9 px-3 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Autres revenus reçus</span>
          <b className="num text-[var(--color-text)]">{fmt(unlined)} F</b>
        </div>
      )}
    </section>
  );
};

/* --------------------------------- rubrics --------------------------------- */

const RubricList: React.FC<Props & { reorder: boolean }> = (props) => {
  const { calc, reorder } = props;
  const rubrics = calc.expense.filter((c) => !c.category.archived || c.actual > 0);
  const ids = rubrics.map((r) => r.id);
  const drag = useDragReorder(ids, props.onReorderCategories);
  const byId = new Map(rubrics.map((r) => [r.id, r]));

  if (!rubrics.length) {
    return (
      <p className="m-0 px-1 text-xs text-[var(--color-text-muted)]">
        Aucune rubrique de dépense. Ajoutez-en une avec le bouton ci-dessous.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-1.5" aria-label="Rubriques">
      {drag.order.map((id) => {
        const cc = byId.get(id)!;
        return (
          <div key={id} ref={drag.register(id)} style={drag.rowStyle(id)}>
            <RubricRow
              cc={cc}
              open={!reorder && props.openRubric === id}
              reorder={reorder}
              handle={drag.handleProps(id)}
              onToggle={() => props.onToggleRubric(props.openRubric === id ? null : id)}
              onMenu={() => props.onRubricMenu(cc.category)}
              onAddLine={() => props.onAddLine(id)}
              onEditLine={props.onEditLine}
              onPayLine={props.onPayLine}
              onEditEnvelope={() => props.onEditEnvelope(cc.category)}
              onReorderLines={props.onReorderLines}
            />
          </div>
        );
      })}
    </section>
  );
};

const RubricRow: React.FC<{
  cc: CategoryCalc;
  open: boolean;
  reorder: boolean;
  handle: ReturnType<ReturnType<typeof useDragReorder>['handleProps']>;
  onToggle: () => void;
  onMenu: () => void;
  onAddLine: () => void;
  onEditLine: (l: MonthLine) => void;
  onPayLine: (l: MonthLine) => void;
  onEditEnvelope: () => void;
  onReorderLines: (ids: string[]) => void;
}> = ({ cc, open, reorder, handle, onToggle, onMenu, onAddLine, onEditLine, onPayLine, onEditEnvelope, onReorderLines }) => {
  const g = useRowGestures({
    onTap: reorder ? undefined : () => {
      triggerHaptic('light');
      onToggle();
    },
    onLongPress: reorder ? undefined : onMenu,
    onSwipeLeft: reorder ? undefined : onMenu,
  });
  const cat = cc.category;
  const pct = cc.planned > 0 ? Math.min(100, (cc.actual / cc.planned) * 100) : 0;
  const over = cc.planned > 0 && cc.actual > cc.planned;
  const done = cc.planned > 0 && cc.remaining === 0 && !over;

  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xs ${
        done && !open && !reorder ? 'opacity-70' : ''
      }`}
    >
      <div className="relative">
        {g.dx < 0 && (
          <div className="absolute inset-0 flex items-center justify-end pr-4 bg-[var(--color-surface-subtle)] text-[11px] font-bold text-[var(--color-text-muted)]">
            Options
          </div>
        )}
        <div
          {...g.handlers}
          style={g.style}
          className="relative h-14 pl-2 pr-1 flex items-center gap-2 bg-[var(--color-surface)] cursor-pointer select-none"
          aria-expanded={open}
        >
          {reorder && (
            <span {...handle} className="w-8 h-10 flex items-center justify-center text-[var(--color-text-muted)]" aria-label={`Déplacer ${cat.name}`}>
              <GripVertical size={18} />
            </span>
          )}
          <RubricBadge icon={cat.icon} color={cat.color} size="sm" className={reorder ? '' : 'ml-1.5'} />
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block font-heading font-bold text-xs text-[var(--color-text)] truncate">{cat.name}</span>
            <span className="block text-[10px] text-[var(--color-text-muted)] truncate">
              {cat.archived
                ? 'Archivée'
                : !cc.planned
                ? cc.mode === 'envelope'
                  ? 'Pas de montant prévu'
                  : `${cc.lines.length} ligne${cc.lines.length > 1 ? 's' : ''}`
                : cc.actual > cc.planned
                ? `Dépassé de ${fmt(cc.actual - cc.planned)} F`
                : cc.remaining > 0
                ? `Reste ${fmt(cc.remaining)} F ${cat.kind === 'save' ? 'à mettre de côté' : 'à payer'}`
                : 'Tout est payé'}
              {cat.linkedTo === 'debts' ? ' · dettes' : ''}
            </span>
          </div>
          {!reorder && (
            <div className="text-right leading-tight text-xs shrink-0">
              <b className="font-heading font-bold text-[var(--color-text)] num">{fmt(cc.actual)}</b>
              <span className="text-[10px] text-[var(--color-text-muted)] num"> / {cc.planned ? fmt(cc.planned) : '–'} F</span>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenu();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-9 h-10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0"
            aria-label={`Options de ${cat.name}`}
          >
            <MoreHorizontal size={18} />
          </button>
          {!reorder && <span className="text-[var(--color-text-muted)] pr-1">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>}
        </div>
      </div>

      {!reorder && (
        <div className="w-full h-1 bg-[var(--color-border)]/40" aria-hidden="true">
          <div
            className={`h-full ${over ? 'bg-[var(--color-expense)]' : ''}`}
            style={{ width: `${pct}%`, backgroundColor: over ? undefined : cat.color }}
          />
        </div>
      )}

      {open && (
        <div className="p-2 bg-[var(--color-surface-subtle)]/40 border-t border-[var(--color-border)]/50 flex flex-col gap-1">
          {cc.mode === 'envelope' ? (
            <button
              type="button"
              onClick={onEditEnvelope}
              className="h-11 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/60 flex items-center justify-between text-xs"
            >
              <span className="font-medium text-[var(--color-text)]">Prévu pour le mois (touchez pour changer)</span>
              <span className="num">
                {cc.envelope === null ? (
                  <span className="text-[var(--color-text-muted)]">Sans montant</span>
                ) : (
                  <>
                    <b>{fmt(cc.actual)}</b>
                    <span className="text-[var(--color-text-muted)]"> / {fmt(cc.envelope)} F · reste {fmt(cc.remaining)} F</span>
                  </>
                )}
              </span>
            </button>
          ) : (
            <LineList cc={cc} onEditLine={onEditLine} onPayLine={onPayLine} onReorderLines={onReorderLines} />
          )}
          {cc.mode === 'lines' && cc.unplanned > 0 && (
            <div className="h-9 px-3 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <span>Dépenses hors lignes</span>
              <b className="num text-[var(--color-text)]">{fmt(cc.unplanned)} F</b>
            </div>
          )}
          {!cat.archived && (
            <button
              type="button"
              onClick={onAddLine}
              className="h-9 rounded-xl text-[11px] font-heading font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] flex items-center justify-center gap-1"
            >
              <Plus size={13} /> Ajouter une ligne
            </button>
          )}
          <span className="text-[10px] text-center text-[var(--color-text-muted)]">
            Touchez une ligne pour la modifier. Glissez-la vers la droite pour noter un paiement.
          </span>
        </div>
      )}
    </div>
  );
};

const LineList: React.FC<{
  cc: CategoryCalc;
  onEditLine: (l: MonthLine) => void;
  onPayLine: (l: MonthLine) => void;
  onReorderLines: (ids: string[]) => void;
}> = ({ cc, onEditLine, onPayLine, onReorderLines }) => {
  const [sorting, setSorting] = useState(false);
  const ids = cc.lines.map((l) => l.line.id);
  const drag = useDragReorder(ids, onReorderLines);
  const byId = new Map(cc.lines.map((l) => [l.line.id, l]));
  if (!cc.lines.length) {
    return <p className="m-0 px-2 py-1 text-[11px] text-[var(--color-text-muted)]">Aucune ligne ce mois-ci.</p>;
  }
  return (
    <>
      {drag.order.map((id) => (
        <div key={id} ref={drag.register(id)} style={drag.rowStyle(id)} className="flex items-center gap-1">
          {sorting && (
            <span {...drag.handleProps(id)} className="w-7 h-10 flex items-center justify-center text-[var(--color-text-muted)]" aria-label="Déplacer">
              <GripVertical size={16} />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <LineRow lc={byId.get(id)!} cat={cc.category} onEdit={onEditLine} onPay={onPayLine} />
          </div>
        </div>
      ))}
      {cc.lines.length > 1 && (
        <button
          type="button"
          onClick={() => setSorting((s) => !s)}
          className="self-end h-7 px-2 text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {sorting ? 'Terminé' : 'Réorganiser les lignes'}
        </button>
      )}
    </>
  );
};

function lineStatus(lc: LineCalc, income: boolean): { dot: string; label: string } {
  const a = lc.line.amount;
  if (a === null) {
    return lc.line.remind
      ? { dot: 'bg-[var(--color-warning)]', label: 'À fixer' }
      : { dot: 'bg-[var(--color-border)]', label: 'Sans montant' };
  }
  if (income) {
    if (lc.paid >= a && a > 0) return { dot: 'bg-[var(--color-income)]', label: lc.paid > a ? `Reçu, ${fmt(lc.paid - a)} F de plus que prévu` : 'Reçu' };
    return { dot: 'bg-[var(--color-info)]', label: lc.paid ? `Encore ${fmt(a - lc.paid)} F à recevoir` : 'Pas encore reçu' };
  }
  if (lc.paid > a) return { dot: 'bg-[var(--color-expense)]', label: `Dépassé de ${fmt(lc.paid - a)} F` };
  if (lc.paid >= a && a > 0) return { dot: 'bg-[var(--color-income)]', label: 'Payé' };
  return { dot: 'bg-[var(--color-info)]', label: lc.paid ? `Reste ${fmt(a - lc.paid)} F à payer` : 'Pas encore payé' };
}

const LineRow: React.FC<{
  lc: LineCalc;
  cat: Category;
  income?: boolean;
  onEdit: (l: MonthLine) => void;
  onPay: (l: MonthLine) => void;
}> = ({ lc, income = false, onEdit, onPay }) => {
  const g = useRowGestures({
    onTap: () => {
      triggerHaptic('light');
      onEdit(lc.line);
    },
    onSwipeRight: () => onPay(lc.line),
  });
  const st = lineStatus(lc, income);
  const a = lc.line.amount;
  return (
    <div className="relative rounded-xl overflow-hidden">
      {g.dx > 0 && (
        <div className="absolute inset-0 flex items-center pl-3 gap-1 bg-[var(--color-income)] text-white text-[11px] font-bold">
          <HandCoins size={14} /> {income ? 'Marquer reçu' : 'Payer'}
        </div>
      )}
      <div
        {...g.handlers}
        style={g.style}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onEdit(lc.line)}
        className="relative min-h-12 py-1.5 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/60 flex items-center justify-between gap-2 cursor-pointer active:bg-[var(--color-surface-subtle)]"
        aria-label={`${lc.line.label}, ${st.label}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
          <span className="min-w-0 leading-tight">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-[13px] text-[var(--color-text)] truncate">{lc.line.label}</span>
              {lc.line.origin === 'oneoff' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] shrink-0">
                  ce mois seulement
                </span>
              )}
            </span>
            <span className="block text-[10px] text-[var(--color-text-muted)] truncate">{st.label}</span>
          </span>
        </div>
        <div className="text-right whitespace-nowrap text-xs">
          {a === null ? (
            <span className={`text-[11px] ${lc.line.remind ? 'text-[var(--color-warning)] font-bold' : 'text-[var(--color-text-muted)]'}`}>
              {lc.paid ? `${fmt(lc.paid)} F · ` : ''}
              {lc.line.remind ? 'À fixer' : 'Sans montant'}
            </span>
          ) : (
            <>
              <b className="font-heading font-bold text-[var(--color-text)] num">{fmt(lc.paid)}</b>
              <span className="text-[11px] text-[var(--color-text-muted)] num"> / {fmt(a)} F</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ ranking & chart ------------------------------ */

const Ranking: React.FC<{ calc: MonthCalc; categories: Category[]; myName: string }> = ({ calc, categories, myName }) => {
  const items = rankExpenses([{ categories, month: calc.month, name: myName }]);
  const max = items[0]?.amt || 1;
  const total = items.reduce((s, i) => s + i.amt, 0);
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-heading font-bold">Mes plus grandes dépenses</span>
        <span className="text-[11px] text-[var(--color-text-muted)] num">Total {fmt(calc.out)} F</span>
      </div>
      {!items.length ? (
        <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">Aucune dépense enregistrée ce mois-ci.</p>
      ) : (
        items.slice(0, 10).map((it, i) => (
          <div key={it.key} className="py-1.5 border-t border-[var(--color-border)]/50 first:border-t-0 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-center text-xs font-heading font-bold text-[var(--color-primary)]">{i + 1}</span>
                <RubricBadge icon={it.category?.icon} color={it.category?.color} size="sm" />
                <span className="font-semibold text-xs truncate">{it.label}</span>
                <small className="text-[10px] text-[var(--color-text-muted)] shrink-0">{Math.round((it.amt / total) * 100)} %</small>
              </div>
              <span className="font-heading font-bold text-xs num whitespace-nowrap">{fmt(it.amt)} F</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(it.amt / max) * 100}%`, backgroundColor: it.category?.color || NO_RUBRIC_STYLE.color }} />
            </div>
          </div>
        ))
      )}
    </section>
  );
};

const Chart: React.FC<{ calc: MonthCalc }> = ({ calc }) => {
  const data = calc.expense
    .filter((c) => c.kind === 'out' && c.actual > 0)
    .map((c) => ({ name: c.category.name, value: c.actual, color: c.category.color }));
  if (calc.uncategorizedOut > 0) data.push({ name: 'Sans rubrique', value: calc.uncategorizedOut, color: NO_RUBRIC_STYLE.color });
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-heading font-bold">Dépenses par rubrique</span>
        <span className="text-xs font-semibold text-[var(--color-text-muted)] num">Total {fmt(total)} F</span>
      </div>
      {!data.length ? (
        <p className="m-0 py-6 text-xs text-[var(--color-text-muted)] text-center">Aucune dépense pour l’instant ce mois-ci.</p>
      ) : (
        <>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={3} dataKey="value">
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`${fmt(Number(v))} F`, 'Dépensé']}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.map((d) => (
              <span key={d.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} <b className="num text-[var(--color-text-muted)]">{Math.round((d.value / total) * 100)} %</b>
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
