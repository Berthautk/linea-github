import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { fmt, getEntryLabel, GROUPS, todayStr } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { RubricIconBadge } from '../lib/rubrics';
import { Entry, MonthCalculation } from '../lib/types';
import { EntryEditSheet } from './EntryEditSheet';

interface JournalScreenProps {
  currentMonth: string;
  calc: MonthCalculation;
  onUpdateEntry: (updated: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenQuickAdd: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  currentMonth,
  calc,
  onUpdateEntry,
  onDeleteEntry,
  onOpenQuickAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'out' | 'in'>('all');
  const [rubricFilter, setRubricFilter] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedOlderDays, setExpandedOlderDays] = useState<Record<string, boolean>>({});
  const [visibleLimit, setVisibleLimit] = useState<number>(30);

  const mData = calc.monthData;
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
        const el = getEntryLabel(mData, e);
        if (rubricFilter !== 'all' && el.g !== rubricFilter) return false;
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
  }, [mData, typeFilter, rubricFilter, searchTerm]);

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

  return (
    <div className="flex flex-col gap-2.5 pb-24">
      {/* Compact Search and Filters in a single top row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher…"
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
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
            <option value="Hors plan">Hors plan</option>
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
              .filter((x) => x.t === 'out')
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
                      ({dayEntries.length})
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
                      const el = getEntryLabel(mData, e);
                      const isIncome = e.t === 'in';

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
                            <RubricIconBadge groupName={el.g} size="sm" />
                            <div className="min-w-0 leading-tight">
                              <span className="font-semibold text-xs text-[var(--color-text)] block truncate">
                                {el.l}
                              </span>
                              <small className="text-[10px] text-[var(--color-text-muted)] truncate block">
                                {el.g}
                              </small>
                            </div>
                          </div>

                          <span
                            className={`font-heading font-bold text-xs num whitespace-nowrap ${
                              isIncome ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'
                            }`}
                          >
                            {isIncome ? '+' : '−'}
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
        calc={calc}
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
