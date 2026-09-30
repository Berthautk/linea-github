import React from 'react';
import { useOnlineStatus } from '../lib/usePWA';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[var(--warn)] text-white text-xs font-semibold px-3 py-1.5 shadow-md"
    >
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      Mode hors-ligne — Vos modifications seront synchronisées au retour de la connexion
    </div>
  );
};
