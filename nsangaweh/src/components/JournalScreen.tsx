import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { fmt, todayStr } from '../lib/budget-math';
import { describeEntry, effectiveKind, MonthCalc, sortCategories } from '../lib/calc';
import { triggerHaptic } from '../lib/haptics';
import { NO_RUBRIC_STYLE, RubricBadge } from '../lib/icons';
import { Category, Entry, HouseholdMember, Wallet } from '../lib/types';
import { EntryEditSheet } from './EntryEditSheet';

interface JournalScreenProps {
  currentMonth: string;
  calc: MonthCalc;
  categories: Category[];
  onUpdateEntry: (updated: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenQuickAdd: () => void;
  wallets?: Wallet[];
  people?: HouseholdMember[];
  myUid?: string;
  onOpenMove?: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  currentMonth,
  calc,
  categories,
  onUpdateEntry,
  onDeleteEntry,
  onOpenQuickAdd,
  wallets = [],
  people = [],
  myUid = '',
  onOpenMove,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'out' | 'in'>('all');
  const [rubricFilter, setRubricFilter] = useState<string>('all');
  // Personal by default: my own history. "Nous deux" is the household's combined history.
  const [whoFilter, setWhoFilter] = useState<string>('me');
  const byWho = (e: Entry) => (whoFilter === 'all' ? true : whoFilter === 'me' ? !e.by || e.by === myUid : e.by === whoFilter);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedOlderDays, setExpandedOlderDays] = useState<Record<string, boolean>>({});
  const [visibleLimit, setVisibleLimit] = useState<number>(30);

  const mData = calc.month;
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const labelOf = (e: Entry) => {
    const d = describeEntry(e, catMap, mData);
    const fallback = e.t === 'transfer' ? 'Virement entre comptes' : 'Sans rubrique';
    return { l: d.label || fallback, g: d.category?.name || fallback, c: d.category };
  };
  const today = todayStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => (n < 10 ? '0' : '') + n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    return mData.entries
      .filter((e) => {
        if (typeFilter !== 'all' && e.t !== typeFilter) return false;
        if (!byWho(e)) return false;
        const el = labelOf(e);
        if (rubricFilter !== 'all' && (el.c?.id || 'none') !== rubricFilter) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchLabel = el.l.toLowerCase().includes(term);
          const matchGroup = el.g.toLowerCase().includes(term);
          const matchAmt = String(e.amt).includes(term);
          if (!matchLabel && !matchGroup && !matchAmt) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.d < b.d) return 1;
        if (a.d > b.d) return -1;
        return b.ts - a.ts;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mData, typeFilter, rubricFilter, whoFilter, searchTerm, catMap, myUid]);

  // Paginated visible entries
  const visibleEntries = useMemo(() => {
    return filteredEntries.slice(0, visibleLimit);
  }, [filteredEntries, visibleLimit]);

  // Group visible entries by day
  const groupedByDay = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    visibleEntries.forEach((e) => {
      if (!groups[e.d]) groups[e.d] = [];
      groups[e.d].push(e);
    });
    return groups;
  }, [visibleEntries]);

  const daysSorted = Object.keys(groupedByDay).sort().reverse();

  const toggleDayAccordion = (d: string) => {
    triggerHaptic('light');
    setExpandedOlderDays((prev) => ({
      ...prev,
      [d]: !prev[d],
    }));
  };

  const scopeTotals = useMemo(() => {
    let inc = 0;
    let out = 0;
    mData.entries.forEach((e) => {
      if (!byWho(e)) return;
      const k = effectiveKind(e, e.categoryId ? catMap.get(e.categoryId)?.kind : undefined);
      if (k === 'in') inc += e.amt;
      else if (k === 'out') out += e.amt;
    });
    return { inc, out };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mData, whoFilter, catMap, myUid]);

  const partner = people.find((p) => !p.me);
  const pickedPerson = people.find((p) => p.uid === whoFilter);
  const title =
    people.length < 2 || whoFilter === 'me' ? 'Mon historique' : whoFilter === 'all' ? 'Historique du foyer' : `Historique de ${pickedPerson?.name || ''}`;
  const subtitle =
    people.length < 2
      ? 'Toutes vos entrées et sorties du mois, jour par jour. Touchez une opération pour la corriger ou la supprimer.'
      : whoFilter === 'me'
      ? `Ce que vous avez noté ce mois-ci.${partner ? ` Celui de ${partner.name} et celui du foyer sont à côté, ou dans l’onglet Famille.` : ''}`
      : whoFilter === 'all'
      ? 'Les opérations de vous deux, mises ensemble : c’est ce qui fait bouger le budget du foyer.'
      : `Ce que ${pickedPerson?.name || 'votre partenaire'} a noté ce mois-ci.`;

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      <div className="px-1 pt-1">
        <h1 className="m-0 text-lg font-heading font-extrabold text-[var(--color-text)]">{title}</h1>
        <p className="m-0 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
      {people.length > 1 && (
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Quel historique afficher">
          {[
            { id: 'me', label: 'Moi' },
            ...people.filter((p) => !p.me).map((p) => ({ id: p.uid, label: p.name })),
            { id: 'all', label: 'Nous deux' },
          ]
            .slice(0, 3)
            .map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={whoFilter === o.id}
                onClick={() => {
                  triggerHaptic('light');
                  setWhoFilter(o.id);
                }}
                className={`min-h-11 px-1 rounded-xl text-xs font-heading font-bold truncate transition ${
                  whoFilter === o.id ? 'bg-[var(--color-primary)] text-white shadow-xs' : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                }`}
              >
                {o.label}
              </button>
            ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-2.5 bg-[var(--color-income-soft)]">
          <span className="block text-[11px] font-semibold text-[var(--color-text-muted)]">Entrées du mois</span>
          <b className="text-base font-heading num text-[var(--color-income)]">+{fmt(scopeTotals.inc)} F</b>
        </div>
        <div className="rounded-2xl p-2.5 bg-[var(--color-expense-soft)]">
          <span className="block text-[11px] font-semibold text-[var(--color-text-muted)]">Sorties du mois</span>
          <b className="text-base font-heading num text-[var(--color-expense)]">−{fmt(scopeTotals.out)} F</b>
        </div>
      </div>
      {onOpenMove && (
        <button
          type="button"
          onClick={onOpenMove}
          className="self-start min-h-10 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[12px] font-bold text-[var(--color-primary)] flex items-center gap-1.5"
        >
          <ArrowRightLeft size={14} /> Déplacer des opérations vers un autre mois
        </button>
      )}
      {/* Compact Search and Filters in a single top row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une opération (nom, montant…)"
            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shrink-0">
          {(['all', 'out', 'in'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setTypeFilter(f);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-heading font-bold transition ${
                typeFilter === f
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'out' ? 'Sorties' : 'Entrées'}
            </button>
          ))}
        </div>

        {/* Rubric Dropdown */}
        <div className="relative shrink-0">
          <select
            value={rubricFilter}
            onChange={(e) => setRubricFilter(e.target.value)}
            className="py-1.5 pl-2 pr-5 rounded-xl text-[11px] font-heading font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] appearance-none cursor-pointer max-w-[100px] truncate"
          >
            <option value="all">Rubrique</option>
            {sortCategories(categories)
              .filter((c) => !c.archived || mData.entries.some((e) => e.categoryId === c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            <option value="none">Sans rubrique</option>
          </select>
          <Filter
            size={10}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        </div>
      </div>

      {/* Operations List */}
      {!daysSorted.length ? (
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center flex flex-col items-center gap-2 shadow-2xs">
          <Calendar size={20} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-heading font-bold text-[var(--color-text)]">
            Aucune opération trouvée
          </span>
          <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
            Ajoutez une dépense ou rentrée d’argent avec le bouton « + ».
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {daysSorted.map((dateStr) => {
            const dayEntries = groupedByDay[dateStr];
            const dateObj = new Date(dateStr + 'T12:00:00');
            const dayFormatted = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            // Automatically expand today and yesterday, collapse older days
            const isTodayOrYesterday = dateStr === today || dateStr === yesterday;
            const isDayExpanded =
              isTodayOrYesterday || !!expandedOlderDays[dateStr];

            const dayOutTotal = dayEntries
              .filter((x) => x.t === 'out' && x.status !== 'declined')
              .reduce((acc, x) => acc + x.amt, 0);

            const dayInTotal = dayEntries
              .filter((x) => x.t === 'in')
              .reduce((acc, x) => acc + x.amt, 0);

            return (
              <div
                key={dateStr}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xs"
              >
                {/* Accordion Day Header */}
                <div
                  onClick={() => toggleDayAccordion(dateStr)}
                  className="px-3 py-2 bg-[var(--color-surface-subtle)]/70 flex items-center justify-between text-xs cursor-pointer hover:bg-[var(--color-surface-subtle)] transition"
                >
                  <div className="flex items-center gap-1.5 font-heading font-bold capitalize text-[var(--color-text)]">
                    <span>{dayFormatted}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
                      · {dayEntries.length} opération{dayEntries.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-xs">
                    {dayOutTotal > 0 && (
                      <span className="text-[var(--color-expense)] num">
                        −{fmt(dayOutTotal)} F
                      </span>
                    )}
                    {dayInTotal > 0 && (
                      <span className="text-[var(--color-income)] num">
                        +{fmt(dayInTotal)} F
                      </span>
                    )}
                    <div className="text-[var(--color-text-muted)] ml-0.5">
                      {isDayExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Day Rows (52px each when expanded) */}
                {isDayExpanded && (
                  <div className="divide-y divide-[var(--color-border)]/50">
                    {dayEntries.map((e) => {
                      const el = labelOf(e);
                      const isIncome = e.t === 'in';
                      const isNeutral = e.t === 'transfer' || e.t === 'save';

                      return (
                        <div
                          key={e.id}
                          onClick={() => {
                            triggerHaptic('light');
                            setEditingEntry(e);
                          }}
                          className="h-[52px] px-3.5 flex items-center justify-between gap-2 hover:bg-[var(--color-surface-subtle)]/40 active:bg-[var(--color-surface-subtle)] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <RubricBadge icon={el.c?.icon || NO_RUBRIC_STYLE.icon} color={el.c?.color} size="sm" />
                            <div className="min-w-0 leading-tight">
                              <span className="font-semibold text-xs text-[var(--color-text)] block truncate">
                                {el.l}
                              </span>
                              <small className="text-[10px] text-[var(--color-text-muted)] truncate block">
                                {el.g}
                                {wallets.find((w) => w.id === e.w) ? ` · ${wallets.find((w) => w.id === e.w)!.name}` : ''}
                                {people.length > 1 && e.by ? ` · ${people.find((p) => p.uid === e.by)?.name || ''}` : ''}
                              </small>
                            </div>
                          </div>

                          <span
                            className={`font-heading font-bold text-xs num whitespace-nowrap ${
                              isIncome
                                ? 'text-[var(--color-income)]'
                                : isNeutral
                                ? 'text-[var(--color-text-muted)]'
                                : 'text-[var(--color-expense)]'
                            }`}
                          >
                            {isIncome ? '+' : isNeutral ? '' : '−'}
                            {fmt(e.amt)} F
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* "Voir plus" pagination if > 30 entries */}
          {filteredEntries.length > visibleLimit && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setVisibleLimit((prev) => prev + 30);
              }}
              className="w-full py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-heading font-bold text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] transition shadow-2xs"
            >
              Voir plus ({filteredEntries.length - visibleLimit} restantes)
            </button>
          )}
        </div>
      )}

      {/* Entry Edit / Detail Sheet */}
      <EntryEditSheet
        isOpen={!!editingEntry}
        entry={editingEntry}
        month={mData}
        categories={categories}
        onClose={() => setEditingEntry(null)}
        onSave={(updated) => {
          onUpdateEntry(updated);
          setEditingEntry(null);
        }}
        onDelete={(id) => {
          onDeleteEntry(id);
          setEditingEntry(null);
        }}
      />
    </div>
  );
};
