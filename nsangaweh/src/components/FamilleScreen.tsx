import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  calcFamily,
  fmt,
  fmtS,
  getEntryLabel,
  GROUPS,
  rankExpenses,
} from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { RubricIconBadge } from '../lib/rubrics';
import { MemberData } from '../lib/types';

interface FamilleScreenProps {
  currentMonth: string;
  isCloudMode: boolean;
  householdId: string;
  members: MemberData[];
  onShowSetup: () => void;
}

export const FamilleScreen: React.FC<FamilleScreenProps> = ({
  currentMonth,
  isCloudMode,
  householdId,
  members,
  onShowSetup,
}) => {
  const [subTab, setSubTab] = useState<'personnes' | 'postes' | 'classement' | 'journal'>('personnes');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(householdId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareCode = async () => {
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoindre mon foyer NSANGAWEH',
          text: `Rejoins notre budget familial sur NSANGAWEH avec ce code : ${householdId}`,
        });
      } catch {
        // Cancelled
      }
    } else {
      handleCopyCode();
    }
  };

  if (!isCloudMode) {
    return (
      <div className="py-2 flex flex-col gap-3">
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
            <Users size={24} />
          </div>

          <div>
            <h3 className="m-0 text-base font-heading font-extrabold text-[var(--color-text)]">
              Partagez votre budget à deux
            </h3>
            <p className="m-0 text-xs text-[var(--color-text-muted)] mt-1 max-w-xs leading-relaxed">
              Pour que chaque partenaire note ses opérations sur son téléphone et que la vue du
              couple se synchronise en temps réel, activez la synchronisation.
            </p>
          </div>

          <button
            type="button"
            onClick={onShowSetup}
            className="w-full max-w-xs py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-xs shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition"
          >
            Activer la synchronisation
          </button>
        </section>
      </div>
    );
  }

  const fam = calcFamily(members, currentMonth);
  const solde = fam.inc - fam.out;
  const free = solde - fam.toPay;
  const progressPct = fam.pOut > 0 ? Math.min(100, (fam.out / fam.pOut) * 100) : 0;
  const isOverBudget = fam.pOut > 0 && fam.out > fam.pOut;
  const isAlone = members.length < 2;

  const rankedFamily = rankExpenses(
    fam.per.map((p) => ({ monthData: p.monthData, name: p.name }))
  );
  const maxRankAmt = rankedFamily[0]?.amt || 1;
  const totalRankAmt = rankedFamily.reduce((acc, i) => acc + i.amt, 0);

  const consolidatedJournal: Array<{
    e: any;
    name: string;
    me: boolean;
    monthData: any;
  }> = [];

  fam.per.forEach((p) => {
    p.monthData.entries.forEach((e: any) => {
      consolidatedJournal.push({
        e,
        name: p.name,
        me: p.me,
        monthData: p.monthData,
      });
    });
  });

  consolidatedJournal.sort((a, b) => {
    if (a.e.d < b.e.d) return 1;
    if (a.e.d > b.e.d) return -1;
    return b.e.ts - a.e.ts;
  });

  const activeGroups = GROUPS.filter(
    (g) => g !== 'Revenus' && ((fam.planned[g] || 0) > 0 || (fam.byGroup[g] || 0) > 0)
  );
  if ((fam.byGroup['Hors plan'] || 0) > 0) {
    activeGroups.push('Hors plan' as any);
  }

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      {/* Invitation banner if partner has not joined yet */}
      {isAlone && (
        <div className="p-3 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={16} className="text-[var(--color-primary)] shrink-0" />
            <span className="text-xs text-[var(--color-text)] truncate font-medium">
              Code foyer : <b className="font-mono text-[var(--color-primary)]">{householdId}</b>
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] text-xs font-bold"
              aria-label="Copier le code"
            >
              {copied ? <Check size={13} className="text-[var(--color-income)]" /> : <Copy size={13} />}
            </button>
            <button
              type="button"
              onClick={handleShareCode}
              className="px-2 py-1 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Share2 size={12} />
              Partager
            </button>
          </div>
        </div>
      )}

      {/* 1. Compact Hero Card (max 150px tall) */}
      <section
        className="rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden flex flex-col justify-between max-h-[150px]"
        style={{
          background: 'linear-gradient(145deg, #0B6E4F 0%, #084C38 100%)',
        }}
        aria-label="Budget consolidé du foyer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="m-0 text-3xl font-heading font-extrabold tracking-tight num leading-none text-white">
              {fmtS(solde)}
            </h1>
            <span className="text-xs font-heading font-bold text-emerald-300">
              FCFA
            </span>
          </div>

          {/* Avatars */}
          <div className="flex items-center -space-x-1.5">
            {fam.per.map((p, idx) => (
              <div
                key={p.uid}
                className="w-6 h-6 rounded-full border border-white/40 bg-white text-[var(--color-primary)] font-heading font-bold text-[10px] flex items-center justify-center shadow-xs"
                title={p.name}
                style={{ zIndex: 10 - idx }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Entrées / Sorties single row */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5">
            <ArrowDownLeft size={14} className="text-emerald-300" />
            <span className="text-emerald-100 font-medium">Entrées:</span>
            <b className="num text-white">{fmt(fam.inc)} F</b>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-rose-300" />
            <span className="text-rose-100 font-medium">Sorties:</span>
            <b className="num text-white">{fmt(fam.out)} F</b>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden my-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-400' : 'bg-emerald-300'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Libre après paiements prévus single line */}
        <div className="flex items-center justify-between text-[11px] text-emerald-100 truncate pt-0.5">
          <span className="truncate">
            Libre après prévisions (<b>{fmt(fam.toPay)} F</b> restants) :{' '}
            <b className={`num font-bold ${free < 0 ? 'text-rose-300' : 'text-emerald-200'}`}>
              {fmtS(free)} F
            </b>
          </span>
        </div>
      </section>

      {/* 2. Segmented Control: Personnes | Postes | Classement | Journal */}
      <div className="grid grid-cols-4 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
        {[
          { id: 'personnes', label: 'Personnes' },
          { id: 'postes', label: 'Postes' },
          { id: 'classement', label: 'Classement' },
          { id: 'journal', label: 'Journal' },
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
              className={`py-1.5 rounded-lg text-xs font-heading font-bold transition text-center truncate ${
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

      {/* TAB 1: Personnes (Qui a mis, qui a dépensé) */}
      {subTab === 'personnes' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fam.per.map((p, idx) => {
              const partnerSolde = p.inc - p.out;
              const shareOfOut = fam.out > 0 ? Math.round((p.out / fam.out) * 100) : 0;
              return (
                <div
                  key={p.uid}
                  className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white shrink-0 ${
                          idx === 0 ? 'bg-[var(--color-primary)]' : 'bg-[#7C3AED]'
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-heading font-bold text-xs text-[var(--color-text)] truncate">
                        {p.name}
                        {p.me && (
                          <span className="ml-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">
                            moi
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-[11px] font-heading font-bold text-[var(--color-text-muted)] num">
                      {shareOfOut}% des sorties
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--color-border)]/50">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">Entrées</span>
                      <b className="font-heading font-bold text-[var(--color-income)] num text-xs">
                        {fmt(p.inc)} F
                      </b>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">Sorties</span>
                      <b className="font-heading font-bold text-[var(--color-expense)] num text-xs">
                        {fmt(p.out)} F
                      </b>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[var(--color-border)]/40">
                    <span className="text-[11px] text-[var(--color-text-muted)]">Solde</span>
                    <b
                      className={`font-heading font-bold text-xs num ${
                        partnerSolde < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--color-income)]'
                      }`}
                    >
                      {fmtS(partnerSolde)} F
                    </b>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Split bar */}
          {fam.per.length >= 2 && fam.out > 0 && (
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Partage des dépenses
              </span>
              <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden flex">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all"
                  style={{
                    width: `${Math.round(((fam.per[0]?.out || 0) / fam.out) * 100)}%`,
                  }}
                />
                <div
                  className="h-full bg-[#7C3AED] transition-all"
                  style={{
                    width: `${Math.round(((fam.per[1]?.out || 0) / fam.out) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Postes (Plan contre réel consolidé) */}
      {subTab === 'postes' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2.5">
          {!activeGroups.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Aucun montant prévu ni dépensé ce mois-ci.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeGroups.map((g) => {
                const a = fam.planned[g] || 0;
                const act = fam.byGroup[g] || 0;
                const pct = a > 0 ? Math.min(100, (act / a) * 100) : act > 0 ? 100 : 0;
                const isOver = a > 0 && act > a;

                return (
                  <div key={g} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RubricIconBadge groupName={g} size="sm" />
                        <span className="font-semibold text-xs text-[var(--color-text)]">{g}</span>
                      </div>

                      <div className="text-right whitespace-nowrap text-xs font-heading font-bold num text-[var(--color-text)]">
                        {fmt(act)}{' '}
                        <span className="font-normal text-[var(--color-text-muted)]">
                          / {a ? fmt(a) : '–'} F
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden pl-6">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-[var(--color-expense)]' : 'bg-[var(--color-primary)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Classement (Sorties du foyer) */}
      {subTab === 'classement' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
          {!rankedFamily.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Aucune dépense enregistrée ce mois-ci.
            </p>
          ) : (
            <div className="flex flex-col">
              {rankedFamily.slice(0, 10).map((item, idx) => {
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
                        {item.who && (
                          <small className="text-[10px] text-[var(--color-text-muted)] truncate block">
                            {item.who}
                          </small>
                        )}
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

      {/* TAB 4: Journal (Journal partagé) */}
      {subTab === 'journal' && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
          {!consolidatedJournal.length ? (
            <p className="m-0 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Aucune opération ce mois-ci.
            </p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]/50">
              {consolidatedJournal.slice(0, 30).map((item, idx) => {
                const el = getEntryLabel(item.monthData, item.e);
                const isIncome = item.e.t === 'in';

                return (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RubricIconBadge groupName={el.g} size="sm" />
                      <div className="min-w-0 leading-tight">
                        <span className="font-semibold text-xs text-[var(--color-text)] block truncate">
                          {el.l}
                        </span>
                        <small className="text-[10px] text-[var(--color-text-muted)] truncate block">
                          <b>{item.name}</b> · {item.e.d.slice(5)} · {el.g}
                        </small>
                      </div>
                    </div>

                    <span
                      className={`font-heading font-bold text-xs num whitespace-nowrap ${
                        isIncome ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {fmt(item.e.amt)} F
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
