import React from 'react';
import { addMonth, monthLabel } from '../lib/budget-math';

interface MonthNavProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
}

export const MonthNav: React.FC<MonthNavProps> = ({ currentMonth, onMonthChange }) => {
  return (
    <div className="flex items-center justify-between gap-2 bg-[var(--sheet)] border border-[var(--line)] rounded p-1.5 shadow-2xs">
      <button
        type="button"
        className="w-10 h-10 border border-[var(--line)] bg-transparent rounded flex items-center justify-center text-xl text-[var(--ink-2)] hover:bg-[var(--accent-soft)] transition"
        onClick={() => onMonthChange(addMonth(currentMonth, -1))}
        aria-label="Mois précédent"
      >
        ‹
      </button>

      <h2
        className="m-0 text-3xl font-semibold leading-none text-center flex-1 min-w-0 tracking-wide select-none"
        style={{ fontFamily: 'var(--f-hand)' }}
      >
        {monthLabel(currentMonth)}
      </h2>

      <button
        type="button"
        className="w-10 h-10 border border-[var(--line)] bg-transparent rounded flex items-center justify-center text-xl text-[var(--ink-2)] hover:bg-[var(--accent-soft)] transition"
        onClick={() => onMonthChange(addMonth(currentMonth, 1))}
        aria-label="Mois suivant"
      >
        ›
      </button>
    </div>
  );
};
