import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Copy, Share2, Users } from 'lucide-react';
import { fmt, fmtS } from '../lib/budget-math';
import { describeEntry, effectiveKind, MonthCalc, rankExpenses } from '../lib/calc';
import { triggerHaptic } from '../lib/haptics';
import { RubricBadge } from '../lib/icons';
import { Category, Entry, HouseholdMember } from '../lib/types';

interface Props {
  currentMonth: string;
  isCloudMode: boolean;
  householdId: string;
  householdName?: string;
  people: HouseholdMember[];
  calc: MonthCalc;
  categories: Category[];
  onShowSetup: () => void;
}

interface PersonTotals {
  inc: number;
  out: number;
  saved: number;
}

export const FamilleScreen: React.FC<Props> = ({ isCloudMode, householdId, householdName, people, calc, categories, onShowSetup }) => {
  const [tab, setTab] = useState<'personnes' | 'rubriques' | 'classement' | 'journal'>('personnes');
  const [copied, setCopied] = useState(false);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const month = calc.month;

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

  const nameOf = (uid?: string) => people.find((p) => p.uid === uid)?.name || (people.length > 1 ? 'Inconnu' : people[0]?.name || '');

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

  const journal = useMemo(
    () => [...month.entries].sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.ts - a.ts)).slice(0, 60),
    [month.entries]
  );

  if (!isCloudMode) {
    return (
      <section className="mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <Users size={24} />
        </div>
        <h3 className="m-0 text-base font-heading font-extrabold">Partagez votre budget à deux</h3>
        <p className="m-0 text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
          Vous et votre partenaire utilisez le même budget : mêmes rubriques, mêmes montants prévus, mêmes totaux. Chacun note ses propres
          entrées et sorties sur son téléphone.
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

      <div className="grid grid-cols-4 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
        {(
          [
            ['personnes', 'Qui a fait quoi'],
            ['rubriques', 'Par rubrique'],
            ['classement', 'Grosses sorties'],
            ['journal', 'Historique'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`py-2 px-0.5 rounded-lg text-[11px] font-heading font-bold leading-tight ${tab === id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'personnes' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
          <p className="m-0 text-[11px] text-[var(--color-text-muted)] leading-snug">
            Le budget est commun. Ici, vous voyez ce que chacun a noté ce mois-ci : par exemple 10 000 F d’entrée pour l’un et 5 000 F pour l’autre font
            15 000 F d’entrées pour le foyer.
          </p>
          {people.map((p) => {
            const t = perPerson.get(p.uid) || { inc: 0, out: 0, saved: 0 };
            const share = totalOut > 0 ? Math.round((t.out / totalOut) * 100) : 0;
            return (
              <div key={p.uid} className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white shrink-0" style={{ backgroundColor: p.color || '#0B6E4F' }}>
                      {(p.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <b className="text-xs font-heading truncate">{p.name}</b>
                    {p.me && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">moi</span>}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] num whitespace-nowrap">{share} % des sorties</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-muted)]">
                  <span>
                    A noté en entrée
                    <b className="block text-sm num text-[var(--color-income)]">{fmt(t.inc)} F</b>
                  </span>
                  <span>
                    A noté en sortie
                    <b className="block text-sm num text-[var(--color-expense)]">{fmt(t.out)} F</b>
                  </span>
                </div>
              </div>
            );
          })}
          {totalOut > 0 && people.length > 1 && (
            <div className="h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden flex" aria-hidden="true">
              {people.map((p, i) => (
                <div key={p.uid} style={{ width: `${((perPerson.get(p.uid)?.out || 0) / totalOut) * 100}%`, backgroundColor: p.color || (i ? '#7C3AED' : '#0B6E4F') }} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'rubriques' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-3">
          {calc.expense.filter((c) => !c.category.archived || c.actual > 0).map((cc) => {
            const bySomeone = new Map<string, number>();
            month.entries.forEach((e) => {
              if (e.categoryId !== cc.id || effectiveKind(e, cc.kind) === null || effectiveKind(e, cc.kind) === 'in') return;
              bySomeone.set(e.by || '', (bySomeone.get(e.by || '') || 0) + e.amt);
            });
            const over = cc.planned > 0 && cc.actual > cc.planned;
            return (
              <div key={cc.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <RubricBadge icon={cc.category.icon} color={cc.category.color} size="sm" />
                    <span className="text-xs font-semibold leading-tight">{cc.category.name}</span>
                  </span>
                  <span className="text-xs font-heading num whitespace-nowrap">
                    <b>{fmt(cc.actual)}</b>
                    <span className="text-[var(--color-text-muted)]"> / {cc.planned ? fmt(cc.planned) : '–'} F</span>
                  </span>
                </div>
                {bySomeone.size > 0 && people.length > 1 && (
                  <span className="text-[10px] text-[var(--color-text-muted)] pl-9">
                    {[...bySomeone.entries()].map(([uid, amt]) => `${nameOf(uid)} ${fmt(amt)} F`).join(' · ')}
                  </span>
                )}
                {over && <span className="text-[10px] font-bold text-[var(--color-expense)] pl-9">Dépassé de {fmt(cc.actual - cc.planned)} F</span>}
              </div>
            );
          })}
          {!calc.expense.length && <p className="m-0 text-xs text-[var(--color-text-muted)]">Aucune rubrique pour l’instant.</p>}
        </section>
      )}

      {tab === 'classement' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col">
          {!ranked.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">Aucune sortie enregistrée ce mois-ci.</p>
          ) : (
            ranked.slice(0, 10).map((it, i) => (
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
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${(it.amt / maxRank) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'journal' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col divide-y divide-[var(--color-border)]/50">
          {!journal.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">Aucune opération ce mois-ci.</p>
          ) : (
            journal.map((e: Entry) => {
              const d = describeEntry(e, catMap, month);
              const k = effectiveKind(e, d.category?.kind);
              return (
                <div key={e.id} className="py-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <RubricBadge icon={d.category?.icon} color={d.category?.color} size="sm" />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-xs font-semibold truncate">{d.label || d.category?.name || 'Opération'}</span>
                      <small className="block text-[10px] text-[var(--color-text-muted)] truncate">
                        <b>{nameOf(e.by)}</b> · {e.d.slice(8, 10)}/{e.d.slice(5, 7)}
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
        </section>
      )}
    </div>
  );
};
