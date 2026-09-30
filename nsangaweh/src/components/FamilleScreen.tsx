import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Copy, Merge, Share2, Sparkles, Split, Users } from 'lucide-react';
import { fmt, fmtS } from '../lib/budget-math';
import { describeEntry, effectiveKind, rankExpenses } from '../lib/calc';
import { aggregateFamily, FamilyRubric, MergeSuggestion, pairId, suggestMerges } from '../lib/family';
import { triggerHaptic } from '../lib/haptics';
import { NO_RUBRIC_STYLE, RubricBadge } from '../lib/icons';
import { MemberData } from '../lib/types';
import { nameKey } from '../lib/validation';

interface Props {
  currentMonth: string;
  isCloudMode: boolean;
  householdId: string;
  members: MemberData[];
  merges: Record<string, string>;
  dismissedMerges: string[];
  onAcceptMerge: (s: MergeSuggestion) => void;
  onDismissMerge: (id: string) => void;
  onRemoveMerge: (mergedKey: string) => void;
  onShowSetup: () => void;
}

export const FamilleScreen: React.FC<Props> = ({
  currentMonth,
  isCloudMode,
  householdId,
  members,
  merges,
  dismissedMerges,
  onAcceptMerge,
  onDismissMerge,
  onRemoveMerge,
  onShowSetup,
}) => {
  const [tab, setTab] = useState<'personnes' | 'postes' | 'classement' | 'journal'>('personnes');
  const [copied, setCopied] = useState(false);

  const fam = useMemo(() => aggregateFamily(members, currentMonth, merges), [members, currentMonth, merges]);
  const suggestions = useMemo(() => suggestMerges(members, merges, dismissedMerges), [members, merges, dismissedMerges]);

  if (!isCloudMode) {
    return (
      <section className="mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <Users size={24} />
        </div>
        <h3 className="m-0 text-base font-heading font-extrabold">Partagez votre budget à deux</h3>
        <p className="m-0 text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
          Chaque partenaire note ses opérations sur son téléphone ; la vue Famille rassemble les deux budgets.
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
        await navigator.share({ title: 'Rejoindre mon foyer NSANGAWEH', text: `Rejoins notre budget familial sur NSANGAWEH avec ce code : ${householdId}` });
      } catch {
        /* cancelled */
      }
    } else copy();
  };

  const pct = fam.pOut > 0 ? Math.min(100, (fam.out / fam.pOut) * 100) : 0;
  const expenseShared = fam.shared.filter((r) => r.kind !== 'in');
  const expenseUnmatched = fam.unmatched.filter((r) => r.kind !== 'in');
  const mergedPairs = Object.entries(merges);
  const allCats = members.flatMap((m) => m.categories);
  const nameForKey = (k: string) => allCats.find((c) => nameKey(c.name) === k)?.name || k;
  const ranked = rankExpenses(members.map((m) => ({ categories: m.categories, month: m.months[currentMonth], name: m.name })));
  const maxRank = ranked[0]?.amt || 1;

  const journal = members
    .flatMap((m) => {
      const month = m.months[currentMonth];
      const cats = new Map(m.categories.map((c) => [c.id, c]));
      return (month?.entries || []).map((e) => ({ e, m, d: describeEntry(e, cats, month) }));
    })
    .sort((a, b) => (a.e.d < b.e.d ? 1 : a.e.d > b.e.d ? -1 : b.e.ts - a.e.ts));

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      {members.length < 2 && (
        <div className="p-3 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 flex items-center justify-between gap-2">
          <span className="text-xs truncate">
            Code foyer : <b className="font-mono text-[var(--color-primary)]">{householdId}</b>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={copy} className="p-2 rounded-lg bg-[var(--color-surface)]" aria-label="Copier le code">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button type="button" onClick={share} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1">
              <Share2 size={12} /> Partager
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-3.5 text-white shadow-md flex flex-col gap-1.5" style={{ background: 'linear-gradient(145deg, #0B6E4F 0%, #084C38 100%)' }} aria-label="Budget du foyer">
        <div className="flex items-start justify-between gap-2">
          {fam.free !== null ? (
            <div>
              <span className="block text-[11px] text-emerald-100">
                Libre après les paiements prévus{fam.freeBasis === 'planned' ? ', sur revenus prévus' : ''}
              </span>
              <b className={`text-3xl font-heading font-extrabold num ${fam.free < 0 ? 'text-rose-200' : ''}`}>{fmtS(fam.free)}</b>{' '}
              <span className="text-xs font-heading font-bold text-emerald-300">F</span>
            </div>
          ) : (
            <span className="text-[11px] text-emerald-100">Ajoutez vos revenus pour voir ce qu’il reste au foyer.</span>
          )}
          <div className="flex -space-x-1.5">
            {fam.per.map((p, i) => (
              <span key={p.uid} className="w-6 h-6 rounded-full border border-white/40 bg-white text-[var(--color-primary)] font-heading font-bold text-[10px] flex items-center justify-center" style={{ zIndex: 10 - i }} title={p.name}>
                {(p.name || '?').charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 text-[11px] pt-1 border-t border-white/10 text-emerald-100">
          <span className="flex items-center gap-1.5">
            <ArrowDownLeft size={13} className="text-emerald-300" /> Reçu <b className="num text-white">{fmt(fam.inc)} F</b> · prévu{' '}
            <b className="num text-white">{fmt(fam.pIn)} F</b>
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowUpRight size={13} className="text-rose-300" /> Dépensé <b className="num text-white">{fmt(fam.out)} F</b> · prévu{' '}
            <b className="num text-white">{fmt(fam.pOut)} F</b>
          </span>
        </div>
        {fam.pOut > 0 && (
          <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden" aria-hidden="true">
            <div className={`h-full rounded-full ${fam.out > fam.pOut ? 'bg-rose-400' : 'bg-emerald-300'}`} style={{ width: `${pct}%` }} />
          </div>
        )}
      </section>

      <div className="grid grid-cols-4 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
        {(['personnes', 'postes', 'classement', 'journal'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-1.5 rounded-lg text-xs font-heading font-bold truncate ${tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'}`}
          >
            {t === 'personnes' ? 'Personnes' : t === 'postes' ? 'Postes' : t === 'classement' ? 'Classement' : 'Journal'}
          </button>
        ))}
      </div>

      {tab === 'personnes' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
          {fam.per.map((p) => {
            const share = fam.out > 0 ? Math.round((p.calc.out / fam.out) * 100) : 0;
            return (
              <div key={p.uid} className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white shrink-0" style={{ backgroundColor: p.color || '#0B6E4F' }}>
                      {(p.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <b className="text-xs font-heading truncate">{p.name}</b>
                    {p.me && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">moi</span>}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] num">{share} % des dépenses du foyer</span>
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] flex flex-col">
                  <span>
                    Reçu <b className="num text-[var(--color-income)]">{fmt(p.calc.inc)} F</b> · prévu <b className="num">{fmt(p.calc.pIn)} F</b>
                  </span>
                  <span>
                    Dépensé <b className="num text-[var(--color-expense)]">{fmt(p.calc.out)} F</b> · prévu <b className="num">{fmt(p.calc.pOut)} F</b>
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === 'postes' && (
        <>
          {suggestions.slice(0, 2).map((s) => (
            <div key={pairId(s.keep, s.merge)} className="p-3 rounded-2xl bg-[var(--color-info-soft)] border border-[var(--color-info)]/30 flex flex-col gap-2">
              <span className="text-xs text-[var(--color-text)] flex items-start gap-1.5">
                <Sparkles size={14} className="text-[var(--color-info)] shrink-0 mt-0.5" />
                <span>
                  « {s.keepName} » ({s.keepOwner}) et « {s.mergeName} » ({s.mergeOwner}) désignent peut-être la même chose.
                </span>
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => onAcceptMerge(s)} className="flex-1 min-h-10 rounded-xl bg-[var(--color-info)] text-white text-xs font-bold flex items-center justify-center gap-1">
                  <Merge size={14} /> Fusionner ces rubriques dans la vue Famille
                </button>
                <button type="button" onClick={() => onDismissMerge(pairId(s.keep, s.merge))} className="px-3 min-h-10 rounded-xl border border-[var(--color-border)] text-xs font-semibold">
                  Non
                </button>
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">Les budgets de chacun ne changent pas. Vous pourrez séparer à tout moment.</span>
            </div>
          ))}

          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5">
            <span className="text-xs font-heading font-bold">Prévu et dépensé ce mois-ci</span>
            {!expenseShared.length ? (
              <p className="m-0 text-xs text-[var(--color-text-muted)]">Aucune rubrique commune pour l’instant.</p>
            ) : (
              expenseShared.map((r) => <FamilyRubricRow key={r.key} r={r} members={members} />)
            )}
            {fam.uncategorizedOut > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <RubricBadge {...NO_RUBRIC_STYLE} size="sm" /> Sans rubrique
                </span>
                <b className="num">{fmt(fam.uncategorizedOut)} F</b>
              </div>
            )}
          </section>

          {expenseUnmatched.length > 0 && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5">
              <span className="text-xs font-heading font-bold">Seulement chez l’un de vous</span>
              {expenseUnmatched.map((r) => (
                <FamilyRubricRow key={r.key} r={r} members={members} showOwner />
              ))}
            </section>
          )}

          {mergedPairs.length > 0 && (
            <section className="px-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Rubriques fusionnées dans la vue Famille</span>
              {mergedPairs.map(([from, to]) => (
                <div key={from} className="flex items-center justify-between text-[11px]">
                  <span className="truncate">
                    « {nameForKey(from)} » regroupé avec « {nameForKey(to)} »
                  </span>
                  <button type="button" onClick={() => onRemoveMerge(from)} className="px-2 py-1 rounded-lg text-[var(--color-primary)] font-bold flex items-center gap-1">
                    <Split size={12} /> Séparer
                  </button>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {tab === 'classement' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-2xs flex flex-col">
          {!ranked.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">Aucune dépense enregistrée ce mois-ci.</p>
          ) : (
            ranked.slice(0, 10).map((it, i) => (
              <div key={it.key} className="py-2 border-t border-[var(--color-border)]/50 first:border-t-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-center text-xs font-heading font-bold text-[var(--color-primary)]">{i + 1}</span>
                    <RubricBadge icon={it.category?.icon} color={it.category?.color} size="sm" />
                    <span className="text-xs font-semibold truncate">{it.label}</span>
                    <small className="text-[10px] text-[var(--color-text-muted)] truncate">{it.who}</small>
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
            journal.slice(0, 40).map(({ e, m, d }) => {
              const k = effectiveKind(e, d.category?.kind);
              return (
                <div key={`${m.uid}-${e.id}`} className="py-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <RubricBadge icon={d.category?.icon} color={d.category?.color} size="sm" />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-xs font-semibold truncate">{d.label || 'Opération'}</span>
                      <small className="block text-[10px] text-[var(--color-text-muted)] truncate">
                        <b>{m.name}</b> · {e.d.slice(8, 10)}/{e.d.slice(5, 7)} · {d.category?.name || (e.t === 'transfer' ? 'Virement' : 'Sans rubrique')}
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

const FamilyRubricRow: React.FC<{ r: FamilyRubric; members: MemberData[]; showOwner?: boolean }> = ({ r, members, showOwner }) => {
  const pct = r.planned > 0 ? Math.min(100, (r.actual / r.planned) * 100) : r.actual > 0 ? 100 : 0;
  const nameOf = (uid: string) => members.find((m) => m.uid === uid)?.name || '';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <RubricBadge icon={r.icon} color={r.color} size="sm" />
          <span className="min-w-0 leading-tight">
            <span className="block text-xs font-semibold truncate">{r.name}</span>
            {(showOwner || r.per.length > 1) && (
              <small className="block text-[10px] text-[var(--color-text-muted)] truncate">
                {r.per.map((p) => `${nameOf(p.uid)} ${fmt(p.actual)} F`).join(' · ')}
              </small>
            )}
          </span>
        </span>
        <span className="text-xs font-heading font-bold num whitespace-nowrap">
          {fmt(r.actual)} <span className="font-normal text-[var(--color-text-muted)]">/ {r.planned ? fmt(r.planned) : '–'} F</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
        <div className={`h-full rounded-full ${r.planned && r.actual > r.planned ? 'bg-[var(--color-expense)]' : ''}`} style={{ width: `${pct}%`, backgroundColor: r.planned && r.actual > r.planned ? undefined : r.color }} />
      </div>
    </div>
  );
};
