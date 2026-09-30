import React, { useState } from 'react';
import {
  Flame,
  Percent,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { addMonth, compact, fmt, fmtS, getInsights, MonthInsightData, shortMonth } from '../lib/budget-math';
import { calcMonth } from '../lib/calc';
import { aggregateFamily } from '../lib/family';
import { triggerHaptic } from '../lib/haptics';
import { MemberData } from '../lib/types';

interface EvolutionScreenProps {
  isCloudMode: boolean;
  members: MemberData[];
  currentMonth: string;
  merges: Record<string, string>;
}

/** One row of the per-rubric table: a rubric id (Moi) or a normalised name (Famille). */
interface RubricSeries {
  key: string;
  name: string;
  archived: boolean;
}

export const EvolutionScreen: React.FC<EvolutionScreenProps> = ({ isCloudMode, members, currentMonth, merges }) => {
  const [scope, setScope] = useState<'me' | 'fam'>('me');
  const [periodMonths, setPeriodMonths] = useState<3 | 6 | 12>(6);
  const [viewMode, setViewMode] = useState<'graphique' | 'details'>('graphique');

  const curM = currentMonth;
  const me = members.find((m) => m.me);

  const slots: Array<{
    monthKey: string;
    inc: number;
    out: number;
    solde: number;
    pOut: number;
    byGroup: Record<string, number>;
    byRubric: Record<string, number>;
  }> = [];
  const series = new Map<string, RubricSeries>();

  for (let i = periodMonths - 1; i >= 0; i--) {
    const k = addMonth(curM, -i);
    if (scope === 'me' || !isCloudMode) {
      const c = calcMonth(me?.categories || [], me?.months[k], k);
      const byGroup: Record<string, number> = {};
      const byRubric: Record<string, number> = {};
      c.expense.forEach((cc) => {
        if (cc.kind !== 'out' || !cc.actual) return;
        byGroup[cc.id] = cc.actual;
        byRubric[cc.category.name] = cc.actual;
        series.set(cc.id, { key: cc.id, name: cc.category.name, archived: cc.category.archived });
      });
      if (c.uncategorizedOut) {
        byGroup.__none = c.uncategorizedOut;
        series.set('__none', { key: '__none', name: 'Sans rubrique', archived: false });
      }
      slots.push({ monthKey: k, inc: c.inc, out: c.out, solde: c.inc - c.out - c.saved, pOut: c.pOut, byGroup, byRubric });
    } else {
      const fam = aggregateFamily(members, k, merges);
      const byGroup: Record<string, number> = {};
      const byRubric: Record<string, number> = {};
      [...fam.shared, ...fam.unmatched].forEach((r) => {
        if (r.kind !== 'out' || !r.actual) return;
        byGroup[r.key] = r.actual;
        byRubric[r.name] = r.actual;
        if (!series.has(r.key)) series.set(r.key, { key: r.key, name: r.name, archived: false });
      });
      if (fam.uncategorizedOut) {
        byGroup.__none = fam.uncategorizedOut;
        series.set('__none', { key: '__none', name: 'Sans rubrique', archived: false });
      }
      slots.push({ monthKey: k, inc: fam.inc, out: fam.out, solde: fam.inc - fam.out - fam.saved, pOut: fam.pOut, byGroup, byRubric });
    }
  }

  const chartData = slots.map((s) => ({
    name: shortMonth(s.monthKey),
    monthKey: s.monthKey,
    Revenus: s.inc,
    Dépenses: s.out,
    Solde: s.solde,
  }));

  const withData: MonthInsightData[] = slots
    .filter((s) => s.inc > 0 || s.out > 0)
    .map((s) => ({ monthKey: s.monthKey, inc: s.inc, out: s.out, pOut: s.pOut, byRubric: s.byRubric }));

  const insightsList = getInsights(withData);

  const latestMonth = slots[slots.length - 1];
  const savingsRate =
    latestMonth.inc > 0
      ? Math.max(0, Math.round(((latestMonth.inc - latestMonth.out) / latestMonth.inc) * 100))
      : 0;

  // A rubric created mid-year simply starts then; archived ones stay in history.
  const activeRubrics = [...series.values()].map((s) => s.key);
  const rubricName = (k: string) => {
    const s = series.get(k);
    return s ? `${s.name}${s.archived ? ' (archivée)' : ''}` : k;
  };

  let maxRubricVal = 0;
  slots.forEach((s) => {
    activeRubrics.forEach((g) => {
      maxRubricVal = Math.max(maxRubricVal, s.byGroup[g] || 0);
    });
  });

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      {/* Top Filter Controls */}
      <div className="flex items-center justify-between gap-2">
        {isCloudMode ? (
          <div className="flex p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setScope('me');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition ${
                scope === 'me'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Moi
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setScope('fam');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition ${
                scope === 'fam'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Famille
            </button>
          </div>
        ) : (
          <span className="text-xs font-heading font-bold text-[var(--color-text)]">
            Évolution financière
          </span>
        )}

        {/* Period Selector */}
        <div className="flex p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          {([3, 6, 12] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setPeriodMonths(p);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-heading font-bold transition ${
                periodMonths === p
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {p} mois
            </button>
          ))}
        </div>

        {/* View toggle (Graphique / Détails) */}
        <div className="flex p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('graphique');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-heading font-bold transition ${
              viewMode === 'graphique'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            Graphique
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('details');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-heading font-bold transition ${
              viewMode === 'details'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            Détails
          </button>
        </div>
      </div>

      {viewMode === 'graphique' ? (
        <>
          {/* Chart First (max 220px tall) */}
          <section
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-1 max-h-[220px]"
            aria-label="Graphique d’évolution"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-heading font-bold text-[var(--color-text)]">
                Revenus, dépenses et solde
              </span>
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[var(--color-income)]" /> Revenus reçus
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[var(--color-expense)]" /> Dépenses
                </span>
              </div>
            </div>

            <div className="h-[160px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => compact(v)}
                    tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${fmt(Number(val))} FCFA`, name]}
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="Revenus" fill="#12A150" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Dépenses" fill="#E5484D" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  <Line
                    type="monotone"
                    dataKey="Solde"
                    stroke="#0B6E4F"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#0B6E4F' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Savings rate & key metric mini-row */}
          <section className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] block uppercase">
                  Part des revenus non dépensée
                </span>
                <b className="font-heading font-extrabold text-base text-[var(--color-text)] num">
                  {savingsRate}%
                </b>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                <Percent size={14} />
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] block uppercase">
                  Solde du mois (reçu − dépensé − épargné)
                </span>
                <b
                  className={`font-heading font-extrabold text-base num ${
                    latestMonth.solde < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--color-income)]'
                  }`}
                >
                  {fmtS(latestMonth.solde)} F
                </b>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] flex items-center justify-center font-bold">
                <Flame size={14} />
              </div>
            </div>
          </section>

          {/* Insights as a Horizontal Swipeable Row of Cards */}
          <section className="flex flex-col gap-1.5" aria-label="Points clés swipeables">
            <span className="text-xs font-heading font-bold text-[var(--color-text)] px-1">
              Points clés de votre évolution
            </span>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {insightsList.map((txt: string, idx: number) => (
                <div
                  key={idx}
                  className="shrink-0 w-[240px] p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] leading-snug shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: txt }}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* ViewMode === 'details' (Heatmap table and breakdown) */
        <section
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2.5"
          aria-label="Tableau détaillé des dépenses par poste"
        >
          <span className="text-xs font-heading font-bold text-[var(--color-text)]">
            Dépenses par poste au fil des mois
          </span>

          {!activeRubrics.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Aucune dépense sur cette période.
            </p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs border-collapse min-w-[300px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    <th className="py-1.5 pr-2">Rubrique</th>
                    {slots.map((s) => (
                      <th key={s.monthKey} className="py-1.5 px-1 text-right font-heading">
                        {shortMonth(s.monthKey)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeRubrics.map((group) => (
                    <tr key={group} className="border-b border-[var(--color-border)]/40">
                      <td className="py-1.5 pr-2 font-semibold text-[var(--color-text)] truncate max-w-[120px]">
                        {rubricName(group)}
                      </td>
                      {slots.map((s) => {
                        const v = s.byGroup[group] || 0;
                        const ratio = maxRubricVal > 0 ? (v / maxRubricVal).toFixed(2) : 0;
                        return (
                          <td
                            key={s.monthKey}
                            className="py-1.5 px-1 text-right num font-medium text-[11px]"
                            style={{
                              backgroundColor:
                                v > 0
                                  ? `color-mix(in srgb, var(--color-primary) calc(${ratio} * 28%), transparent)`
                                  : undefined,
                            }}
                          >
                            {v > 0 ? compact(v) : '–'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
