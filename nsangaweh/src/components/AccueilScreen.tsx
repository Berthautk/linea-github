import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Edit3,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  daysInMonth,
  fmt,
  fmtS,
  GROUPS,
  monthName,
  rankExpenses,
  todayStr,
} from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { getRubricConfig, RubricIconBadge } from '../lib/rubrics';
import { EntryType, MonthCalculation, PlanLine } from '../lib/types';

interface AccueilScreenProps {
  currentMonth: string;
  calc: MonthCalculation;
  myName: string;
  previousMonthWithPlan: string | null;
  onOpenQuickAdd: (type?: EntryType) => void;
  onOpenPlanEditor: () => void;
  onCopyPreviousPlan: (fromMonthKey: string) => void;
  onStartBlankPlan: () => void;
}

export const AccueilScreen: React.FC<AccueilScreenProps> = ({
  currentMonth,
  calc,
  myName,
  previousMonthWithPlan,
  onOpenPlanEditor,
  onCopyPreviousPlan,
  onStartBlankPlan,
}) => {
  // Navigation inside Accueil: Plan (default) | Classement | Graphique
  const [subTab, setSubTab] = useState<'plan' | 'classement' | 'graphique'>('plan');

  // Accordion: only one rubric open at a time, collapsed by default
  const [openRubric, setOpenRubric] = useState<string | null>(null);

  // Slim seed banner dismissed state
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Info modal for "Libre après paiements prévus"
  const [showFreeInfoModal, setShowFreeInfoModal] = useState(false);

  const mData = calc.monthData;
  const isCurrentMonth = currentMonth === new Date().toISOString().slice(0, 7);

  // Toggle rubric accordion (single open at a time)
  const toggleRubric = (groupName: string) => {
    triggerHaptic('light');
    setOpenRubric((prev) => (prev === groupName ? null : groupName));
  };

  // If month is completely empty
  if (!mData.plan.length && !mData.entries.length) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
            <Sparkles size={24} />
          </div>

          <h3 className="m-0 text-base font-heading font-extrabold text-[var(--color-text)]">
            Commencer {monthName(currentMonth)}
          </h3>

          <p className="m-0 text-xs text-[var(--color-text-muted)] max-w-xs">
            {previousMonthWithPlan
              ? `Reprenez le plan de ${monthName(previousMonthWithPlan)} ou créez un plan vide.`
              : 'Créez votre plan prévisionnel ligne par ligne.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-1">
            {previousMonthWithPlan && (
              <button
                type="button"
                onClick={() => onCopyPreviousPlan(previousMonthWithPlan)}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-xs shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition"
              >
                Reprendre {monthName(previousMonthWithPlan)}
              </button>
            )}
            <button
              type="button"
              onClick={onStartBlankPlan}
              className="w-full py-2.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-semibold text-xs hover:border-[var(--color-primary)] active:scale-95 transition"
            >
              Plan vide
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Balance & calculations
  const solde = calc.inc - calc.out;
  const free = solde - calc.toPay;
  const progressPct = calc.pOut > 0 ? Math.min(100, (calc.out / calc.pOut) * 100) : 0;
  const isOverBudget = calc.pOut > 0 && calc.out > calc.pOut;

  // Remaining days in month
  const totalDays = daysInMonth(currentMonth);
  const currentDay = isCurrentMonth ? parseInt(todayStr().slice(8, 10), 10) : 1;
  const daysLeft = isCurrentMonth ? Math.max(1, totalDays - currentDay + 1) : 0;

  // Donut chart data
  const pieData: Array<{ name: string; value: number; color: string }> = GROUPS.filter(
    (g) => g !== 'Revenus'
  )
    .map((g) => ({
      name: g as string,
      value: calc.byGroup[g] || 0,
      color: getRubricConfig(g).color,
    }))
    .filter((d) => d.value > 0);

  if ((calc.offOut || 0) > 0) {
    pieData.push({
      name: 'Hors plan',
      value: calc.offOut,
      color: getRubricConfig('Hors plan').color,
    });
  }

  const rankedItems = rankExpenses([{ monthData: mData, name: myName }]);
  const maxRankAmt = rankedItems[0]?.amt || 1;
  const totalRankAmt = rankedItems.reduce((acc, i) => acc + i.amt, 0);

  // Group sorting: active rubrics with pending remaining first, completed/empty dimmed at bottom
  const allRubricsWithData = GROUPS.filter(
    (g) => mData.plan.some((p) => p.g === g) || (calc.byGroup[g] || 0) > 0
  );

  const activeWithRemaining: string[] = [];
  const activeCompleted: string[] = [];

  allRubricsWithData.forEach((g) => {
    const lines = mData.plan.filter((p) => p.g === g);
    const planned = lines.reduce((acc, p) => acc + (p.a || 0), 0);
    const actual = lines.reduce((acc, p) => acc + (calc.byPlan[p.id] || 0), 0);
    const hasUnset = lines.some((p) => !p.a);
    const rem = planned - actual;

    if (g === 'Revenus') {
      activeWithRemaining.push(g);
    } else if (rem > 0 || hasUnset) {
      activeWithRemaining.push(g);
    } else {
      activeCompleted.push(g);
    }
  });

  const sortedRubrics = [...activeWithRemaining, ...activeCompleted];

  return (
    <div className="flex flex-col gap-2.5 pb-20">
      {/* 1. Slim dismissible notification line (40px) */}
      {!isBannerDismissed && mData.seeded && calc.unset > 0 && (
        <div className="h-10 px-3 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/30 flex items-center justify-between text-xs text-[var(--color-text)] shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles size={14} className="text-[var(--color-warning)] shrink-0" />
            <span className="truncate font-medium">
              Fiche pré-remplie · <b>{calc.unset} montant{calc.unset > 1 ? 's' : ''} à fixer</b>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenPlanEditor}
              className="text-[var(--color-primary)] font-heading font-bold text-xs hover:underline cursor-pointer"
            >
              Voir
            </button>
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5 cursor-pointer"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Compact Balance Card (max 150px tall) */}
      <section
        className="rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden flex flex-col justify-between max-h-[150px]"
        style={{
          background: 'linear-gradient(145deg, #0B6E4F 0%, #084C38 100%)',
        }}
        aria-label="Solde et prévisions"
      >
        {/* Top: Net balance + edit plan link */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="m-0 text-3xl font-heading font-extrabold tracking-tight num leading-none text-white">
              {fmtS(solde)}
            </h1>
            <span className="text-xs font-heading font-bold text-emerald-300">
              FCFA
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenPlanEditor}
            className="text-[11px] font-heading font-bold px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-emerald-100 flex items-center gap-1 transition"
          >
            <Edit3 size={12} />
            Modifier le plan
          </button>
        </div>

        {/* Middle: Entrées and Sorties on a single row */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5">
            <ArrowDownLeft size={14} className="text-emerald-300" />
            <span className="text-emerald-100 font-medium">Entrées:</span>
            <b className="num text-white">{fmt(calc.inc)} F</b>
            <span className="text-[10px] text-emerald-200/70 num">({fmt(calc.pIn)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-rose-300" />
            <span className="text-rose-100 font-medium">Sorties:</span>
            <b className="num text-white">{fmt(calc.out)} F</b>
            <span className="text-[10px] text-rose-200/70 num">({fmt(calc.pOut)})</span>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden my-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-400' : 'bg-emerald-300'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Single-line "Libre après paiements prévus" with info icon */}
        <div className="flex items-center justify-between text-[11px] text-emerald-100 truncate pt-0.5">
          <div className="flex items-center gap-1 truncate">
            <span>Libre après prévus :</span>
            <b className={`num font-bold ${free < 0 ? 'text-rose-300' : 'text-emerald-200'}`}>
              {fmtS(free)} F
            </b>
            {daysLeft > 0 && free > 0 && (
              <span className="text-emerald-200/80 num truncate">
                · {fmt(free / daysLeft)} F/j
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFreeInfoModal(true)}
            className="text-emerald-200 hover:text-white p-0.5 shrink-0"
            aria-label="Détail du reste à vivre"
          >
            <Info size={13} />
          </button>
        </div>
      </section>

      {/* 5. Segmented Control inside Accueil: Plan | Classement | Graphique */}
      <div className="grid grid-cols-3 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
        {[
          { id: 'plan', label: 'Plan' },
          { id: 'classement', label: 'Classement' },
          { id: 'graphique', label: 'Graphique' },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSubTab(tab.id as any);
              }}
              className={`py-1.5 rounded-lg text-xs font-heading font-bold transition ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT 1: Accordion Rubrics List (56px rows, single open at a time) */}
      {subTab === 'plan' && (
        <section className="flex flex-col gap-1.5" aria-label="Rubriques budgétaires">
          {sortedRubrics.map((group) => {
            const linesInGroup = mData.plan.filter((p) => p.g === group);
            const totalActual = linesInGroup.reduce(
              (acc, p) => acc + (calc.byPlan[p.id] || 0),
              0
            );
            const totalPlanned = linesInGroup.reduce((acc, p) => acc + (p.a || 0), 0);
            const unsetCount = linesInGroup.filter((p) => !p.a).length;
            const isOpen = openRubric === group;

            const isDone =
              group !== 'Revenus' &&
              totalPlanned > 0 &&
              totalActual === totalPlanned &&
              unsetCount === 0;

            const rubricPct =
              totalPlanned > 0
                ? Math.min(100, (totalActual / totalPlanned) * 100)
                : totalActual > 0
                ? 100
                : 0;

            return (
              <div
                key={group}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xs transition-all ${
                  isDone && !isOpen ? 'opacity-65' : ''
                }`}
              >
                {/* 56px Header Row */}
                <div
                  onClick={() => toggleRubric(group)}
                  className="h-14 px-3.5 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-[var(--color-surface-subtle)]/50 active:bg-[var(--color-surface-subtle)] transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RubricIconBadge groupName={group} size="sm" />
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="font-heading font-bold text-xs text-[var(--color-text)] truncate">
                        {group}
                      </span>
                      {unsetCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-[10px] font-bold shrink-0">
                          {unsetCount} à fixer
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right leading-tight text-xs">
                      <b className="font-heading font-bold text-[var(--color-text)] num">
                        {fmt(totalActual)}
                      </b>
                      <span className="text-[10px] text-[var(--color-text-muted)] num">
                        {' '}
                        / {totalPlanned ? fmt(totalPlanned) : '–'} F
                      </span>
                    </div>

                    <div className="text-[var(--color-text-muted)]">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Thin progress line under row */}
                <div className="w-full h-1 bg-[var(--color-border)]/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      totalPlanned > 0 && totalActual > totalPlanned
                        ? 'bg-[var(--color-expense)]'
                        : 'bg-[var(--color-primary)]'
                    }`}
                    style={{ width: `${rubricPct}%` }}
                  />
                </div>

                {/* Expanded Lines (44px each with status dots) */}
                {isOpen && (
                  <div className="p-2 bg-[var(--color-surface-subtle)]/40 border-t border-[var(--color-border)]/50 flex flex-col gap-1 animate-in slide-in-from-top-1 duration-150">
                    {linesInGroup.map((p) => {
                      const act = calc.byPlan[p.id] || 0;
                      const a = p.a || 0;
                      const dotColor = getStatusDotColor(p, act);

                      return (
                        <div
                          key={p.id}
                          className="h-11 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/60 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${dotColor.bg}`}
                              title={dotColor.title}
                            />
                            <span className="font-medium text-xs text-[var(--color-text)] truncate">
                              {p.l}
                            </span>
                          </div>

                          <div className="text-right whitespace-nowrap text-xs">
                            <b className="font-heading font-bold text-[var(--color-text)] num">
                              {fmt(act)}
                            </b>
                            <span className="text-[11px] text-[var(--color-text-muted)] num">
                              {' '}
                              / {a ? fmt(a) : '–'} F
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* CONTENT 2: Classement (Mes plus grandes dépenses) */}
      {subTab === 'classement' && (
        <section
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2"
          aria-label="Classement des dépenses"
        >
          <div className="flex justify-between items-center pb-1">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">
              Mes plus grandes sorties
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] num">
              Total {fmt(calc.out)} F
            </span>
          </div>

          {!rankedItems.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Aucune dépense enregistrée ce mois-ci.
            </p>
          ) : (
            <div className="flex flex-col">
              {rankedItems.slice(0, 10).map((item, idx) => {
                const pctOfTot = totalRankAmt > 0 ? Math.round((item.amt / totalRankAmt) * 100) : 0;
                const barWidth = maxRankAmt > 0 ? (item.amt / maxRankAmt) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="py-2 border-t border-[var(--color-border)]/50 first:border-t-0 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 text-center text-xs font-heading font-bold text-[var(--color-primary)]">
                          {idx + 1}
                        </span>
                        <RubricIconBadge groupName={item.group} size="sm" />
                        <span className="font-semibold text-xs text-[var(--color-text)] truncate">
                          {item.label}
                        </span>
                        <small className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                          {pctOfTot}%
                        </small>
                      </div>

                      <span className="font-heading font-bold text-xs text-[var(--color-text)] num whitespace-nowrap">
                        {fmt(item.amt)} F
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden pl-6">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* CONTENT 3: Graphique (Donut Chart des sorties) */}
      {subTab === 'graphique' && (
        <section
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-3"
          aria-label="Graphique des dépenses"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">
              Répartition par rubrique
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)] num">
              Total {fmt(calc.out)} F
            </span>
          </div>

          {!pieData.length ? (
            <p className="m-0 py-6 text-xs text-[var(--color-text-muted)] text-center">
              Aucune dépense pour l’instant ce mois-ci.
            </p>
          ) : (
            <>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${fmt(Number(value))} FCFA`, 'Dépensé']}
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {pieData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[10px] font-medium text-[var(--color-text)]"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                    <b className="num text-[var(--color-text-muted)]">
                      {Math.round((item.value / calc.out) * 100)}%
                    </b>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Info Modal for "Libre après paiements prévus" */}
      {showFreeInfoModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowFreeInfoModal(false)}
        >
          <div
            className="w-full max-w-xs bg-[var(--color-surface)] p-5 rounded-2xl shadow-xl flex flex-col gap-2.5 text-xs text-[var(--color-text)] leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="m-0 text-sm font-heading font-bold">Reste à vivre calculé</h4>
              <button
                type="button"
                onClick={() => setShowFreeInfoModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
              Le montant libre correspond à votre solde actuel moins les paiements encore à
              effectuer ce mois-ci :
            </p>

            <div className="bg-[var(--color-surface-subtle)] p-2.5 rounded-xl flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between">
                <span>Solde actuel :</span>
                <b className="num">{fmtS(solde)} F</b>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Factures prévues restantes :</span>
                <b className="num">−{fmt(calc.toPay)} F</b>
              </div>
              <div className="border-t border-[var(--color-border)] pt-1 flex justify-between font-bold text-[var(--color-primary)]">
                <span>Libre après prévus :</span>
                <b className="num">{fmtS(free)} F</b>
              </div>
            </div>

            {daysLeft > 0 && free > 0 && (
              <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
                Soit environ <b>{fmt(free / daysLeft)} F par jour</b> pour les {daysLeft} jours
                restants de ce mois.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowFreeInfoModal(false)}
              className="mt-1 w-full py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact status dot helper (green = payé, blue = reste, red = dépassé, orange = à fixer)
function getStatusDotColor(p: PlanLine, act: number): { bg: string; title: string } {
  const a = p.a || 0;
  if (!a) {
    return { bg: 'bg-[var(--color-warning)]', title: 'À fixer' };
  }
  if (act > a) {
    return { bg: 'bg-[var(--color-expense)]', title: `Dépassé (+${fmt(act - a)})` };
  }
  if (act === a) {
    return { bg: 'bg-[var(--color-income)]', title: 'Payé' };
  }
  return { bg: 'bg-[var(--color-info)]', title: `Reste ${fmt(a - act)}` };
}
