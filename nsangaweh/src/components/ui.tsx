import React, { useEffect } from 'react';
import { Delete, X } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

/**
 * Bottom sheet. The body scrolls, the footer (primary actions) stays at the
 * bottom within thumb reach, and 100dvh keeps it above the keyboard.
 */
export const Sheet: React.FC<{
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  full?: boolean;
  z?: number;
  headerRight?: React.ReactNode;
  label?: string;
}> = ({ open, title, onClose, footer, children, full, z = 50, headerRight, label }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/60 animate-in fade-in duration-150"
      style={{ zIndex: z }}
      role="dialog"
      aria-modal="true"
      aria-label={label || (typeof title === 'string' ? title : undefined)}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[480px] bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col overflow-hidden ${
          full ? 'h-[100dvh] rounded-none' : 'max-h-[92dvh] rounded-t-[28px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative pt-4 pb-2.5 px-4 flex items-center justify-between gap-2 border-b border-[var(--color-border)] shrink-0">
          {!full && (
            <span className="w-9 h-1 rounded-full bg-[var(--color-border)] absolute left-1/2 -translate-x-1/2 top-1.5" />
          )}
          <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)] truncate">{title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3 no-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="px-4 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-[var(--color-border)] shrink-0 flex flex-col gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface SheetAction {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

/** Short list of actions, for "⋯" menus and "Seulement ce mois / ..." questions. */
export const ActionSheet: React.FC<{
  open: boolean;
  title: React.ReactNode;
  message?: React.ReactNode;
  actions: SheetAction[];
  onClose: () => void;
  z?: number;
}> = ({ open, title, message, actions, onClose, z = 60 }) => (
  <Sheet open={open} title={title} onClose={onClose} z={z}>
    {message && <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">{message}</p>}
    <div className="flex flex-col gap-1.5 pb-1">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={() => {
            triggerHaptic(a.danger ? 'medium' : 'light');
            a.onClick();
          }}
          className={`w-full min-h-12 px-3.5 py-2.5 rounded-2xl border text-left flex items-center gap-3 transition active:scale-[0.99] ${
            a.danger
              ? 'border-[var(--color-expense)]/30 text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)]'
              : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
          }`}
        >
          {a.icon && <span className="shrink-0 opacity-80">{a.icon}</span>}
          <span className="min-w-0">
            <span className="block text-sm font-heading font-bold">{a.label}</span>
            {a.hint && <span className="block text-[11px] text-[var(--color-text-muted)] font-normal">{a.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  </Sheet>
);

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className="grid p-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => {
            triggerHaptic('light');
            onChange(o.value);
          }}
          className={`rounded-lg font-heading font-bold transition text-center leading-tight ${
            size === 'sm' ? 'py-1 text-[10px]' : 'py-1.5 text-[11px]'
          } ${
            value === o.value
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  hint?: React.ReactNode;
}> = ({ checked, onChange, label, hint }) => (
  <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
    <span className="min-w-0">
      <span className="block text-xs font-semibold text-[var(--color-text)]">{label}</span>
      {hint && <span className="block text-[10px] text-[var(--color-text-muted)]">{hint}</span>}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        triggerHaptic('light');
        onChange(!checked);
      }}
      className={`relative w-10 h-6 rounded-full shrink-0 transition ${
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
      />
    </button>
  </label>
);

/** Compact numeric keypad for amounts (no system keyboard, nothing hidden). */
export const Keypad: React.FC<{ value: string; onChange: (v: string) => void; maxDigits?: number }> = ({
  value,
  onChange,
  maxDigits = 9,
}) => {
  const press = (k: string) => {
    triggerHaptic('light');
    if (k === 'del') return onChange(value.slice(0, -1));
    if (!value && (k === '0' || k === '000')) return;
    const next = (value + k).slice(0, maxDigits);
    onChange(next);
  };
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => press(k)}
          onContextMenu={(e) => {
            if (k !== 'del') return;
            e.preventDefault();
            onChange('');
          }}
          className="h-11 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-heading font-bold text-base hover:bg-[var(--color-border)] active:scale-95 transition flex items-center justify-center"
          aria-label={k === 'del' ? 'Effacer' : k}
        >
          {k === 'del' ? <Delete size={18} /> : k}
        </button>
      ))}
    </div>
  );
};

export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'ghost' | 'danger' }
> = ({ tone = 'primary', className = '', children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={`w-full min-h-12 py-3 rounded-2xl font-heading font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-40 ${
      tone === 'primary'
        ? 'bg-[var(--color-primary)] text-white shadow-xs hover:bg-[var(--color-primary-dark)]'
        : tone === 'danger'
        ? 'border border-[var(--color-expense)]/40 text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)]'
        : 'border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)]'
    } ${className}`}
  >
    {children}
  </button>
);

export const FieldLabel: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-[11px] font-semibold text-[var(--color-text-muted)] px-0.5">
    {children}
  </label>
);

export const ErrorText: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  children ? (
    <p role="alert" className="m-0 text-[11px] font-semibold text-[var(--color-expense)]">
      {children}
    </p>
  ) : null;

export const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden';
