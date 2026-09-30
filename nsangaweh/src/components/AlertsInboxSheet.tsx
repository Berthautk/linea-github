import React from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { AlertItem } from '../lib/types';

interface AlertsInboxSheetProps {
  isOpen: boolean;
  alerts: AlertItem[];
  onClose: () => void;
  onSelectAlert: (alert: AlertItem) => void;
  onClearAlerts: () => void;
}

export const AlertsInboxSheet: React.FC<AlertsInboxSheetProps> = ({
  isOpen,
  alerts,
  onClose,
  onSelectAlert,
  onClearAlerts,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-3 pb-2.5 px-5 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[var(--color-primary)]" />
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Notifications & alertes
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 no-scrollbar">
          {alerts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <CheckCircle2 size={32} className="text-emerald-500" />
              <b className="font-heading text-sm text-[var(--color-text)]">Tout est calme</b>
              <p className="m-0 max-w-xs">
                Aucune alerte pour l'instant. Vos budgets et échéances sont sous contrôle.
              </p>
            </div>
          ) : (
            alerts.map((al) => (
              <div
                key={al.id}
                onClick={() => onSelectAlert(al)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 shadow-2xs ${
                  al.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    : al.type === 'action'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {al.type === 'warning' ? (
                    <AlertTriangle size={18} className="text-amber-600" />
                  ) : al.type === 'action' ? (
                    <Sparkles size={18} className="text-blue-600" />
                  ) : (
                    <Info size={18} className="text-[var(--color-primary)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-heading font-bold text-xs text-[var(--color-text)] truncate">
                      {al.title}
                    </span>
                    <small className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                      {al.date}
                    </small>
                  </div>
                  <p className="m-0 text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                    {al.message}
                  </p>
                </div>

                <ChevronRight size={14} className="text-[var(--color-text-muted)] mt-1 shrink-0" />
              </div>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="p-3 border-t border-[var(--color-border)] shrink-0">
            <button
              type="button"
              onClick={onClearAlerts}
              className="w-full py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              Marquer tout comme lu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
