import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Copy, Share2, Users } from 'lucide-react';
import { fmt, fmtS } from '../lib/budget-math';
import { CategoryCalc, describeEntry, effectiveKind, MonthCalc, rankExpenses } from '../lib/calc';
import { triggerHaptic } from '../lib/haptics';
import { RubricBadge } from '../lib/icons';
import { Category, Entry, HouseholdMember, MemberBudget } from '../lib/types';
import { EvolutionScreen } from './EvolutionScreen';

interface Props {
  currentMonth: string;
  isCloudMode: boolean;
  householdId: string;
  householdName?: string;
  people: HouseholdMember[];
  calc: MonthCalc;
  categories: Category[];
  budget: MemberBudget;
  myUid: string;
  onShowSetup: () => void;
}

interface PersonTotals {
  inc: number;
  out: number;
  saved: number;
}

/** Two clearly different colours, whatever avatar colour each partner picked. */
const PERSON_COLORS = ['#0B6E4F', '#7C3AED'];

export const FamilleScreen: React.FC<Props> = ({
  currentMonth,
  isCloudMode,
  householdId,
  householdName,
  people,
  calc,
  categories,
  budget,
  myUid,
  onShowSetup,
}) => {
  const [tab, setTab] = useState<'comparer' | 'budget' | 'historique' | 'evolution'>('comparer');
  const [who, setWho] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const month = calc.month;
  const colorOf = (uid?: string) => PERSON_COLORS[Math.max(0, people.findIndex((p) => p.uid === uid)) % PERSON_COLORS.length];
  const nameOf = (uid?: string) => people.find((p) => p.uid === uid)?.name || (people.length > 1 ? 'Inconnu' : people[0]?.name || '');

  // What each partner noted, computed with the same rules as the household totals.
  const perPerson = useMemo(() => {
    const map = new Map<string, PersonTotals>();
    month.entries.forEach((e) => {
      const kind = effectiveKind(e, e.categoryId ? catMap.get(e.categoryId)?.kind : undefined);
      if (!kind) return;
      const k = e.by || '';
      const t = map.get(k) || { inc: 0, out: 0, saved: 0 };
      if (kind === 'in') t.inc += e.amt;
      else if (kind === 'save') t.saved += e.amt;
      else t.out += e.amt;
      map.set(k, t);
    });
    return map;
  }, [month.entries, catMap]);

  // Where the money comes in: grouped by what it is (line, rubric or the label typed), with who brought it.
  const incomeSources = useMemo(() => {
    const map = new Map<string, { label: string; amt: number; by: Map<string, number> }>();
    month.entries.forEach((e) => {
      const d = describeEntry(e, catMap, month);
      if (effectiveKind(e, d.category?.kind) !== 'in') return;
      const label = d.label || d.category?.name || 'Entrée';
      const key = label.toLowerCase();
      const cur = map.get(key) || { label, amt: 0, by: new Map<string, number>() };
      cur.amt += e.amt;
      cur.by.set(e.by || '', (cur.by.get(e.by || '') || 0) + e.amt);
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.amt - a.amt);
  }, [month, catMap]);

  const ranked = useMemo(
    () =>
      rankExpenses(
        people.map((p) => ({
          categories,
          month: { ...month, entries: month.entries.filter((e) => e.by === p.uid) },
          name: p.name,
        }))
      ),
    [people, categories, month]
  );
  const maxRank = ranked[0]?.amt || 1;

  // Rubrics with the most spending first, each with who spent it.
  const rubricRows = useMemo(() => {
    const rows = calc.expense
      .filter((c) => !c.category.archived || c.actual > 0)
      .map((cc: CategoryCalc) => {
        const by = new Map<string, number>();
        month.entries.forEach((e) => {
          if (e.categoryId !== cc.id) return;
          const k = effectiveKind(e, cc.kind);
          if (k === null || k === 'in') return;
          by.set(e.by || '', (by.get(e.by || '') || 0) + e.amt);
        });
        return { cc, by };
      });
    return rows.sort((a, b) => b.cc.actual - a.cc.actual || a.cc.category.order - b.cc.category.order);
  }, [calc.expense, month.entries]);
  const maxRubric = rubricRows[0]?.cc.actual || 1;
  const totalPlanned = rubricRows.reduce((s, r) => s + r.cc.planned, 0);
  const totalDone = rubricRows.reduce((s, r) => s + r.cc.actual, 0);

  const journal = useMemo(
    () =>
      month.entries
        .filter((e) => who === 'all' || (who === 'me' ? !e.by || e.by === myUid : e.by === who))
        .sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.ts - a.ts)),
    [month.entries, who, myUid]
  );
  const journalTotals = useMemo(() => {
    let inc = 0;
    let out = 0;
    journal.forEach((e) => {
      const k = effectiveKind(e, e.categoryId ? catMap.get(e.categoryId)?.kind : undefined);
      if (k === 'in') inc += e.amt;
      else if (k === 'out') out += e.amt;
    });
    return { inc, out };
  }, [journal, catMap]);

  if (!isCloudMode) {
    return (
      <section className="mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <Users size={24} />
        </div>
        <h3 className="m-0 text-base font-heading font-extrabold">Partagez votre budget à deux</h3>
        <p className="m-0 text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
          Vous et votre partenaire utilisez le même budget : mêmes rubriques, mêmes montants prévus, mêmes totaux. Chacun note ses propres
          entrées et sorties sur son téléphone, garde son historique, et le foyer voit l’ensemble.
        </p>
        <button type="button" onClick={onShowSetup} className="w-full max-w-xs min-h-11 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-xs">
          Activer la synchronisation
        </button>
      </section>
    );
  }

  const copy = () => {
    triggerHaptic('success');
    navigator.clipboard?.writeText(householdId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rejoindre notre foyer NSANGAWEH', text: `Rejoins notre budget sur NSANGAWEH avec ce code : ${householdId}` });
      } catch {
        /* cancelled */
      }
    } else copy();
  };

  const rest = calc.inc - calc.out - calc.saved;
  const totalOut = calc.out || 0;
  const totalIn = calc.inc || 0;
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

  const Legend = (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {people.map((p) => (
        <span key={p.uid} className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorOf(p.uid) }} /> {p.name}
        </span>
      ))}
    </div>
  );

  const StackedBar: React.FC<{ parts: Array<[string, number]>; whole: number; scale?: number }> = ({ parts, whole, scale = 100 }) => (
    <div className="h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden" aria-hidden="true">
      <div className="h-full flex rounded-full overflow-hidden" style={{ width: `${Math.min(100, scale)}%` }}>
        {parts.map(([uid, amt]) => (
          <div key={uid || 'x'} style={{ width: `${whole > 0 ? (amt / whole) * 100 : 0}%`, backgroundColor: colorOf(uid) }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      {people.length < 2 && (
        <div className="p-3 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 flex flex-col gap-2">
          <span className="text-xs leading-snug">
            Pour partager ce budget, donnez ce code à votre partenaire : <b className="font-mono text-[var(--color-primary)] text-sm">{householdId}</b>
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={copy} className="min-h-10 px-3 rounded-lg bg-[var(--color-surface)] text-xs font-bold flex items-center gap-1.5">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copié' : 'Copier'}
            </button>
            <button type="button" onClick={share} className="min-h-10 px-3 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1.5">
              <Share2 size={14} /> Partager
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl p-4 text-white shadow-md flex flex-col gap-2.5" style={{ background: 'linear-gradient(145deg, #0B6E4F 0%, #084C38 100%)' }} aria-label="Budget du foyer">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-sm font-heading font-extrabold">{householdName || 'Notre foyer'}</h2>
          <div className="flex -space-x-1.5">
            {people.map((p, i) => (
              <span key={p.uid} className="w-7 h-7 rounded-full border border-white/40 bg-white text-[var(--color-primary)] font-heading font-bold text-[11px] flex items-center justify-center" style={{ zIndex: 10 - i }} title={p.name}>
                {(p.name || '?').charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/10 p-2.5">
            <span className="flex items-center gap-1 text-[11px] text-emerald-100 font-semibold">
              <ArrowDownLeft size={13} /> Entrées de nous deux
            </span>
            <b className="block text-lg font-heading font-extrabold num leading-tight">{fmt(calc.inc)} F</b>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <span className="flex items-center gap-1 text-[11px] text-rose-100 font-semibold">
              <ArrowUpRight size={13} /> Sorties de nous deux
            </span>
            <b className="block text-lg font-heading font-extrabold num leading-tight">{fmt(calc.out)} F</b>
          </div>
        </div>
        <div className="text-[12px] text-emerald-50">
          Reste en main pour le foyer : <b className={`num ${rest < 0 ? 'text-rose-200' : ''}`}>{fmtS(rest)} F</b>
        </div>
      </section>

      <div className="grid grid-cols-4 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs" role="tablist">
        {(
          [
            ['comparer', 'Comparer'],
            ['budget', 'Budget'],
            ['historique', 'Historique du foyer'],
            ['evolution', 'Évolution'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`py-2 px-0.5 rounded-lg text-[11px] font-heading font-bold leading-tight ${tab === id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'comparer' && (
        <>
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
            <h3 className="m-0 text-sm font-heading font-extrabold">Qui a mis, qui a dépensé</h3>
            <p className="m-0 text-[11px] text-[var(--color-text-muted)] leading-snug">
              Chacun garde son historique ; ici, les deux sont comparés. Les entrées et sorties de vous deux s’additionnent dans le budget du foyer.
            </p>
            {people.map((p) => {
              const t = perPerson.get(p.uid) || { inc: 0, out: 0, saved: 0 };
              return (
                <div key={p.uid} className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white shrink-0" style={{ backgroundColor: colorOf(p.uid) }}>
                      {(p.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <b className="text-xs font-heading truncate">{p.name}</b>
                    {p.me && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">moi</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-muted)]">
                    <span>
                      A noté en entrée
                      <b className="block text-sm num text-[var(--color-income)]">{fmt(t.inc)} F</b>
                      <span className="num">{pct(t.inc, totalIn)} % des entrées du foyer</span>
                    </span>
                    <span>
                      A noté en sortie
                      <b className="block text-sm num text-[var(--color-expense)]">{fmt(t.out)} F</b>
                      <span className="num">{pct(t.out, totalOut)} % des sorties du foyer</span>
                    </span>
                  </div>
                </div>
              );
            })}
            {people.length > 1 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Part de chacun dans les entrées</span>
                <StackedBar parts={people.map((p) => [p.uid, perPerson.get(p.uid)?.inc || 0] as [string, number])} whole={totalIn} />
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Part de chacun dans les sorties</span>
                <StackedBar parts={people.map((p) => [p.uid, perPerson.get(p.uid)?.out || 0] as [string, number])} whole={totalOut} />
                {Legend}
              </div>
            )}
          </section>

          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
            <h3 className="m-0 text-sm font-heading font-extrabold">D’où viennent les entrées</h3>
            {!incomeSources.length ? (
              <p className="m-0 text-xs text-[var(--color-text-muted)]">Aucune entrée notée ce mois-ci.</p>
            ) : (
              incomeSources.slice(0, 6).map((src) => (
                <div key={src.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold leading-tight">{src.label}</span>
                    <span className="num whitespace-nowrap">
                      <b className="text-[var(--color-income)]">{fmt(src.amt)} F</b>
                      <span className="text-[var(--color-text-muted)]"> · {pct(src.amt, totalIn)} %</span>
                    </span>
                  </div>
                  <StackedBar parts={[...src.by.entries()]} whole={src.amt} scale={(src.amt / (incomeSources[0]?.amt || 1)) * 100} />
                  {people.length > 1 && (
                    <span className="text-[10px] text-[var(--color-text-muted)]">{[...src.by.entries()].map(([uid, amt]) => `${nameOf(uid)} ${fmt(amt)} F`).join(' · ')}</span>
                  )}
                </div>
              ))
            )}
          </section>

          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col">
            <h3 className="m-0 mb-1 text-sm font-heading font-extrabold">Ce qui coûte le plus au foyer</h3>
            {!ranked.length ? (
              <p className="m-0 py-2 text-xs text-[var(--color-text-muted)]">Aucune sortie enregistrée ce mois-ci.</p>
            ) : (
              ranked.slice(0, 6).map((it, i) => (
                <div key={it.key} className="py-2 border-t border-[var(--color-border)]/50 first:border-t-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-4 text-center text-xs font-heading font-bold text-[var(--color-primary)]">{i + 1}</span>
                      <RubricBadge icon={it.category?.icon} color={it.category?.color} size="sm" />
                      <span className="min-w-0 leading-tight">
                        <span className="block text-xs font-semibold">{it.label}</span>
                        {people.length > 1 && <small className="block text-[10px] text-[var(--color-text-muted)]">{it.who}</small>}
                      </span>
                    </span>
                    <b className="text-xs num whitespace-nowrap">{fmt(it.amt)} F</b>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(it.amt / maxRank) * 100}%`, backgroundColor: it.category?.color || '#0B6E4F' }} />
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {tab === 'budget' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-3">
          <div>
            <h3 className="m-0 text-sm font-heading font-extrabold">Comment le budget du foyer est touché</h3>
            <p className="m-0 mt-0.5 text-[11px] text-[var(--color-text-muted)] leading-snug">
              Les rubriques qui consomment le plus sont en premier. <b>Prévu</b> : ce que vous avez prévu. <b>Sorti</b> : ce que vous avez déjà dépensé à
              deux. <b>Reste</b> : ce qu’il reste, en rouge avec un « − » si c’est dépassé.
            </p>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-subtle)] px-3 py-2 grid grid-cols-3 gap-1 text-center">
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
              Prévu
              <b className="block text-sm normal-case num text-[var(--color-text)]">{fmt(totalPlanned)} F</b>
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
              Sorti
              <b className="block text-sm normal-case num text-[var(--color-text)]">{fmt(totalDone)} F</b>
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
              Reste
              <b className={`block text-sm normal-case num ${totalPlanned - totalDone < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--color-income)]'}`}>
                {totalPlanned - totalDone < 0 ? '−' : ''}
                {fmt(Math.abs(totalPlanned - totalDone))} F
              </b>
            </span>
          </div>

          {!rubricRows.length && <p className="m-0 text-xs text-[var(--color-text-muted)]">Aucune rubrique pour l’instant.</p>}
          {rubricRows.map(({ cc, by }) => {
            const left = cc.planned > 0 ? cc.planned - cc.actual : null;
            const over = left !== null && left < 0;
            return (
              <div key={cc.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <RubricBadge icon={cc.category.icon} color={cc.category.color} size="sm" />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-xs font-semibold">{cc.category.name}</span>
                      <span className="block text-[10px] text-[var(--color-text-muted)]">{pct(cc.actual, totalOut + calc.saved)} % des sorties du foyer</span>
                    </span>
                  </span>
                  <span className="text-right text-[11px] num leading-tight whitespace-nowrap">
                    <span className="text-[var(--color-text-muted)]">Prévu {cc.planned ? fmt(cc.planned) : '–'}</span>
                    <br />
                    <b>Sorti {fmt(cc.actual)}</b>
                    <br />
                    <b className={over ? 'text-[var(--color-expense)]' : left === 0 ? 'text-[var(--color-income)]' : ''}>
                      Reste {left === null ? '–' : `${over ? '−' : ''}${fmt(Math.abs(left))}`}
                    </b>
                  </span>
                </div>
                <StackedBar parts={[...by.entries()]} whole={cc.actual} scale={(cc.actual / maxRubric) * 100} />
                {people.length > 1 && by.size > 0 && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">{[...by.entries()].map(([uid, amt]) => `${nameOf(uid)} ${fmt(amt)} F`).join(' · ')}</span>
                )}
                {over && <span className="text-[10px] font-bold text-[var(--color-expense)]">Dépassé de {fmt(-left!)} F</span>}
              </div>
            );
          })}
          {people.length > 1 && Legend}
        </section>
      )}

      {tab === 'historique' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
          <div>
            <h3 className="m-0 text-sm font-heading font-extrabold">Historique du foyer</h3>
            <p className="m-0 mt-0.5 text-[11px] text-[var(--color-text-muted)] leading-snug">
              Les opérations de vous deux, mises ensemble : c’est ce qui fait bouger le budget. Votre historique personnel est dans l’onglet « Historique ».
            </p>
          </div>
          {people.length > 1 && (
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Quelles opérations afficher">
              {[{ id: 'all', label: 'Nous deux' }, { id: 'me', label: 'Moi' }, ...people.filter((p) => !p.me).map((p) => ({ id: p.uid, label: p.name }))]
                .slice(0, 3)
                .map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={who === o.id}
                    onClick={() => setWho(o.id)}
                    className={`min-h-10 px-1 rounded-xl text-xs font-heading font-bold truncate ${who === o.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'}`}
                  >
                    {o.label}
                  </button>
                ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2 bg-[var(--color-income-soft)]">
              <span className="block text-[10px] font-semibold text-[var(--color-text-muted)]">Entrées</span>
              <b className="text-sm num text-[var(--color-income)]">+{fmt(journalTotals.inc)} F</b>
            </div>
            <div className="rounded-xl p-2 bg-[var(--color-expense-soft)]">
              <span className="block text-[10px] font-semibold text-[var(--color-text-muted)]">Sorties</span>
              <b className="text-sm num text-[var(--color-expense)]">−{fmt(journalTotals.out)} F</b>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-[var(--color-border)]/50">
            {!journal.length ? (
              <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">Aucune opération ce mois-ci.</p>
            ) : (
              journal.slice(0, 80).map((e: Entry) => {
                const d = describeEntry(e, catMap, month);
                const k = effectiveKind(e, d.category?.kind);
                return (
                  <div key={e.id} className="py-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <RubricBadge icon={d.category?.icon} color={d.category?.color} size="sm" />
                      <span className="min-w-0 leading-tight">
                        <span className="block text-xs font-semibold truncate">{d.label || d.category?.name || 'Opération'}</span>
                        <small className="block text-[10px] text-[var(--color-text-muted)] truncate">
                          <b style={{ color: colorOf(e.by) }}>{nameOf(e.by)}</b> · {e.d.slice(8, 10)}/{e.d.slice(5, 7)}
                          {d.category ? ` · ${d.category.name}` : ''}
                        </small>
                      </span>
                    </span>
                    <b className={`text-xs num whitespace-nowrap ${k === 'in' ? 'text-[var(--color-income)]' : k === 'out' ? 'text-[var(--color-expense)]' : 'text-[var(--color-text-muted)]'}`}>
                      {k === 'in' ? '+' : k === 'out' ? '−' : ''}
                      {fmt(e.amt)} F
                    </b>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {tab === 'evolution' && <EvolutionScreen isCloudMode={isCloudMode} budget={budget} myUid={myUid} currentMonth={currentMonth} />}
    </div>
  );
};
