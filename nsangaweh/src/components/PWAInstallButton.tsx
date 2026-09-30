import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWA';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        type="button"
        className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition inline-flex items-center gap-1 shadow-xs"
        aria-label="Installer l'application NSANGAWEH"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Installer
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          type="button"
          className="text-xs font-medium px-2 py-1 rounded border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink-2)] hover:border-[var(--accent)] transition"
        >
          Installer sur iPhone
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Installer sur iPhone"
          >
            <div className="w-full max-w-sm rounded bg-[var(--sheet)] border border-[var(--line)] p-6 shadow-xl text-[var(--ink)]">
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--f-display)' }}
              >
                Installer sur iPhone / iPad
              </h3>
              <p className="mt-3 text-sm text-[var(--ink-2)] leading-relaxed">
                1. Touchez l&apos;icône <strong>Partager</strong> en bas de Safari (carré avec une flèche).
                <br />
                2. Faites défiler et touchez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
                <br />
                3. Touchez <strong>Ajouter</strong> en haut à droite.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded bg-[var(--accent)] py-2 text-sm font-bold text-[var(--accent-ink)]"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
