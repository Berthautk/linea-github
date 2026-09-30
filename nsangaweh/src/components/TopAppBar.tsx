import React from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonth, monthLabel } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';

interface TopAppBarProps {
  userName: string;
  currentMonth: string;
  syncStatus: 'cloud' | 'saving' | 'local' | 'load';
  unreadAlertsCount?: number;
  onMonthChange: (month: string) => void;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  userName,
  currentMonth,
  syncStatus,
  unreadAlertsCount = 0,
  onMonthChange,
  onOpenAlerts,
  onOpenSettings,
}) => {
  const hour = new Date().getHours();
  const greeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
  const displayName = userName ? userName : 'vous';
  const initial = displayName.charAt(0).toUpperCase();

  const syncDotColor =
    syncStatus === 'cloud'
      ? 'bg-[var(--color-income)]'
      : syncStatus === 'saving'
      ? 'bg-[var(--color-warning)] animate-ping'
      : 'bg-[var(--color-warning)]';

  const syncTitle =
    syncStatus === 'cloud'
      ? 'Synchronisé avec le foyer'
      : syncStatus === 'saving'
      ? 'Enregistrement en cours…'
      : syncStatus === 'load'
      ? 'Chargement…'
      : 'Mode local (cet appareil)';

  return (
    <header className="sticky top-0 z-30 px-3.5 pt-2.5 pb-2 bg-[var(--color-background)]/90 backdrop-blur-md transition-colors min-h-[56px] flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50">
      {/* Left: Greeting & Sync dot */}
      <div className="min-w-0 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white font-heading font-bold text-xs flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Ouvrir les paramètres"
          >
            {initial}
          </button>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-surface)] ${syncDotColor}`}
            title={syncTitle}
          />
        </div>

        <div className="min-w-0 leading-tight">
          <p className="m-0 text-[11px] font-medium text-[var(--color-text-muted)] truncate">
            {greeting}
          </p>
          <h2 className="m-0 text-sm font-heading font-bold text-[var(--color-text)] truncate">
            {displayName}
          </h2>
        </div>
      </div>

      {/* Center: Month Selector Pill */}
      <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-2xs px-1 py-0.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onMonthChange(addMonth(currentMonth, -1));
          }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-90 transition cursor-pointer"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={14} />
        </button>

        <span className="px-1.5 text-xs font-heading font-bold text-[var(--color-text)] whitespace-nowrap select-none capitalize">
          {monthLabel(currentMonth)}
        </span>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onMonthChange(addMonth(currentMonth, 1));
          }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-90 transition cursor-pointer"
          aria-label="Mois suivant"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Right: Bell inbox button with unread badge */}
      <div className="shrink-0 flex items-center">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenAlerts();
          }}
          className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] relative shadow-2xs active:scale-95 transition cursor-pointer"
          aria-label="Alertes et notifications"
        >
          <Bell size={17} />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-[var(--color-surface)]">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
