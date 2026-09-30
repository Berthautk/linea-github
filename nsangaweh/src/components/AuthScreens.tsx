import React, { useState } from 'react';
import { clearCustomConfig, parseConfigText, saveCustomConfig } from '../lib/firebase';

interface AuthScreenProps {
  busy: boolean;
  error: string;
  onSignIn: (email: string, pass: string) => void;
  onSignUp: (email: string, pass: string) => void;
  onContinueOffline: () => void;
}

export const AuthCard: React.FC<AuthScreenProps> = ({
  busy,
  error,
  onSignIn,
  onSignUp,
  onContinueOffline,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email.trim(), password);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp(email.trim(), password);
  };

  return (
    <section className="sheet flex flex-col gap-3" aria-label="Connexion utilisateur">
      <h3
        className="m-0 text-xl font-bold text-[var(--ink)]"
        style={{ fontFamily: 'var(--f-display)' }}
      >
        Connexion
      </h3>
      <p className="m-0 text-sm text-[var(--ink-2)]">
        Chaque personne a son propre compte. Connectez-vous pour synchroniser le budget du foyer.
      </p>

      <form onSubmit={handleSignIn} className="flex flex-col gap-3 pt-1">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--ink-2)]">
          Adresse e-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="off"
            required
            className="px-3 py-2 text-sm border border-[var(--line)] rounded bg-[var(--sheet)] text-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--ink-2)]">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="px-3 py-2 text-sm border border-[var(--line)] rounded bg-[var(--sheet)] text-[var(--ink)]"
          />
        </label>

        {error && (
          <p className="m-0 text-sm font-semibold text-[var(--out)]" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 flex-wrap pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm rounded hover:opacity-90 active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={busy}
            className="px-5 py-2.5 bg-transparent border border-[var(--accent)] text-[var(--accent)] font-bold text-sm rounded hover:bg-[var(--accent-soft)] transition cursor-pointer disabled:opacity-60"
          >
            Créer mon compte
          </button>
        </div>
      </form>

      <div className="pt-2 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={onContinueOffline}
          className="text-xs text-[var(--accent)] underline font-medium hover:opacity-80"
        >
          Continuer sans synchronisation (mode local)
        </button>
      </div>
    </section>
  );
};

interface HouseholdScreenProps {
  busy: boolean;
  error: string;
  email: string;
  onCreateHousehold: () => void;
  onJoinHousehold: (code: string) => void;
  onSignOut: () => void;
}

export const HouseholdCard: React.FC<HouseholdScreenProps> = ({
  busy,
  error,
  email,
  onCreateHousehold,
  onJoinHousehold,
  onSignOut,
}) => {
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinHousehold(code.trim().toUpperCase());
  };

  return (
    <section className="sheet flex flex-col gap-3.5" aria-label="Gestion du foyer">
      <h3
        className="m-0 text-xl font-bold text-[var(--ink)]"
        style={{ fontFamily: 'var(--f-display)' }}
      >
        Votre foyer
      </h3>
      <p className="m-0 text-sm text-[var(--ink-2)] leading-relaxed">
        Un foyer réunit les comptes qui partagent le même budget. Le premier crée le foyer et reçoit
        un code. Le second entre ce code.
      </p>

      <div className="pt-1">
        <button
          type="button"
          onClick={onCreateHousehold}
          disabled={busy}
          className="w-full sm:w-auto px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm rounded hover:opacity-90 transition cursor-pointer disabled:opacity-60"
        >
          Créer le foyer
        </button>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="grow border-t border-[var(--line)]" />
        <span className="shrink mx-4 text-xs uppercase font-semibold text-[var(--ink-3)]">
          Ou rejoindre un foyer existant
        </span>
        <div className="grow border-t border-[var(--line)]" />
      </div>

      <form onSubmit={handleJoin} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--ink-2)]">
          Code du foyer (10 caractères)
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={10}
            placeholder="Ex : K9X2M4R7T8"
            className="px-3 py-2 text-base font-mono tracking-widest uppercase border border-[var(--line)] rounded bg-[var(--sheet)] text-[var(--ink)]"
            required
          />
        </label>

        {error && (
          <p className="m-0 text-sm font-semibold text-[var(--out)]" role="alert">
            {error}
          </p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="w-full sm:w-auto px-5 py-2.5 bg-transparent border border-[var(--accent)] text-[var(--accent)] font-bold text-sm rounded hover:bg-[var(--accent-soft)] transition cursor-pointer disabled:opacity-50"
          >
            Rejoindre le foyer
          </button>
        </div>
      </form>

      <div className="pt-3 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--ink-3)]">
        <span>Connecté : {email}</span>
        <button
          type="button"
          onClick={onSignOut}
          className="text-[var(--accent)] underline font-medium hover:opacity-80 cursor-pointer"
        >
          Changer de compte
        </button>
      </div>
    </section>
  );
};

interface FirebaseConfigCardProps {
  error: string;
  onSaveConfig: () => void;
  onClose: () => void;
}

export const FirebaseSetupCard: React.FC<FirebaseConfigCardProps> = ({
  error,
  onSaveConfig,
  onClose,
}) => {
  const [configText, setConfigText] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleSave = () => {
    const parsed = parseConfigText(configText);
    if (!parsed) {
      setLocalErr('Configuration non reconnue. Vérifiez que apiKey et projectId sont bien présents.');
      return;
    }
    saveCustomConfig(parsed);
    onSaveConfig();
  };

  const handleClear = () => {
    clearCustomConfig();
    window.location.reload();
  };

  return (
    <section className="sheet flex flex-col gap-3" aria-label="Configuration Firebase">
      <div className="flex justify-between items-center">
        <h3
          className="m-0 text-lg font-bold text-[var(--ink)]"
          style={{ fontFamily: 'var(--f-display)' }}
        >
          Configuration Firebase pour la synchronisation
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-lg font-bold text-[var(--ink-3)] hover:text-[var(--ink)] px-2"
        >
          ×
        </button>
      </div>

      <p className="m-0 text-sm text-[var(--ink-2)] leading-relaxed">
        Pour activer la synchronisation à deux sans variables d’environnement, collez ici la
        configuration Web fournie par Firebase Console (Paramètres du projet &gt; Vos applications
        &gt; Web) :
      </p>

      <textarea
        value={configText}
        onChange={(e) => {
          setConfigText(e.target.value);
          setLocalErr('');
        }}
        rows={5}
        placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
        className="w-full p-2.5 font-mono text-xs border border-[var(--line)] rounded bg-[var(--sheet)] text-[var(--ink)] resize-y"
      />

      {(localErr || error) && (
        <p className="m-0 text-sm font-semibold text-[var(--out)]" role="alert">
          {localErr || error}
        </p>
      )}

      <div className="flex gap-2 flex-wrap pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm rounded hover:opacity-90 transition"
        >
          Enregistrer la configuration
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 border border-[var(--line)] text-[var(--ink-2)] font-medium text-sm rounded hover:bg-[var(--line)]/50 transition"
        >
          Réinitialiser
        </button>
      </div>
    </section>
  );
};
