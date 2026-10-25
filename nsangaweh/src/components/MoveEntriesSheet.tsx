import React, { useEffect, useMemo, useState } from 'react';
import { addMonth, fmt, monthLabel } from '../lib/budget-math';
import { Entry, HouseholdMember } from '../lib/types';
import { FieldLabel, inputClass, PrimaryButton, Sheet } from './ui';

export const MoveEntriesSheet: React.FC<{
  open: boolean;
  monthKey: string;
  entries: Entry[];
  people: HouseholdMember[];
  myUid: string;
  onMove: (ids: string[], toMonth: string) => void;
  onClose: () => void;
}> = ({ open, monthKey, entries, people, myUid, onMove, onClose }) => {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState(addMonth(monthKey, 1));
  const [fromDate, setFromDate] = useState('');

  const list = useMemo(
    () => entries.filter((e) => e.t !== 'transfer').sort((a, b) => (b.d + String(b.ts || 0)).localeCompare(a.d + String(a.ts || 0))),
    [entries]
  );

  useEffect(() => {
    if (!open) return;
    setPicked(new Set(list.filter((e) => !e.by || e.by === myUid).map((e) => e.id)));
    setTarget(addMonth(monthKey, 1));
    setFromDate('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, monthKey]);

  const months = [-2, -1, 1, 2, 3].map((d) => addMonth(monthKey, d));
  const nameOf = (uid?: string) => (!uid || uid === myUid ? 'moi' : people.find((p) => p.uid === uid)?.name || 'partenaire');
  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <Sheet
      open={open}
      title="Déplacer vers un autre mois"
      onClose={onClose}
      footer={
        <PrimaryButton disabled={!picked.size} onClick={() => onMove([...picked], target)}>
          Déplacer {picked.size} opération{picked.size > 1 ? 's' : ''} vers {monthLabel(target)}
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <p className="m-0 text-[12px] text-[var(--color-text-muted)]">
          Cochez les opérations de {monthLabel(monthKey)} qui sont dans le mauvais mois. Elles gardent leur date et leur montant : seul le mois change.
        </p>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="move-target">Déplacer vers</FieldLabel>
          <select id="move-target" className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="move-from">Cocher celles à partir du</FieldLabel>
            <input
              id="move-from"
              type="date"
              className={inputClass}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                if (e.target.value) setPicked(new Set(list.filter((x) => x.d >= e.target.value).map((x) => x.id)));
              }}
            />
          </div>
          <button type="button" className="min-h-10 px-3 rounded-xl border border-[var(--color-border)] text-[12px] font-bold" onClick={() => setPicked(new Set(list.map((e) => e.id)))}>
            Tout cocher
          </button>
          <button type="button" className="min-h-10 px-3 rounded-xl border border-[var(--color-border)] text-[12px] font-bold" onClick={() => setPicked(new Set())}>
            Tout décocher
          </button>
        </div>
        {!list.length && <p className="m-0 text-center py-4 text-[12px] text-[var(--color-text-muted)]">Aucune opération dans ce mois.</p>}
        <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]">
          {list.map((e) => (
            <li key={e.id}>
              <label className="flex items-center gap-3 px-3 py-2.5 min-h-12 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-primary)]" checked={picked.has(e.id)} onChange={() => toggle(e.id)} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold truncate">{e.label}</span>
                  <span className="block text-[11px] text-[var(--color-text-muted)]">
                    {e.d.split('-').reverse().join('/')} · {nameOf(e.by)}
                  </span>
                </span>
                <b className={`text-[13px] num ${e.t === 'in' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
                  {e.t === 'in' ? '+' : '−'}
                  {fmt(e.amt)} F
                </b>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
};
