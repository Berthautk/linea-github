import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Share2,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface OnboardingFlowProps {
  authStep: 'intro' | 'auth' | 'household';
  authMode: 'signin' | 'signup';
  busy: boolean;
  error: string;
  userEmail: string;
  createdCode?: string;
  onSetAuthMode: (mode: 'signin' | 'signup') => void;
  onSignIn: (email: string, pass: string) => void;
  onSignUp: (email: string, pass: string, name: string, color: string) => void;
  onResetPassword: (email: string) => Promise<void>;
  onContinueOffline: () => void;
  onCreateHousehold: (name: string, color: string) => void;
  onJoinHousehold: (code: string, name: string, color: string) => void;
  onSignOut: () => void;
}

const AVATAR_COLORS = [
  '#0B6E4F', // Emerald
  '#F5B700', // Gold
  '#2563EB', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EA580C', // Orange
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  authStep,
  authMode,
  busy,
  error,
  userEmail,
  createdCode,
  onSetAuthMode,
  onSignIn,
  onSignUp,
  onResetPassword,
  onContinueOffline,
  onCreateHousehold,
  onJoinHousehold,
  onSignOut,
}) => {
  // Intro slides
  const [slideIndex, setSlideIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('nsangaweh-intro-seen') !== 'true';
  });

  // Auth inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  // Forgot password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Household step
  const [householdMode, setHouseholdMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [codeBoxes, setCodeBoxes] = useState<string[]>(Array(10).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Finish intro slides
  const handleFinishIntro = () => {
    triggerHaptic('medium');
    localStorage.setItem('nsangaweh-intro-seen', 'true');
    setShowIntro(false);
  };

  const slides = [
    {
      title: 'Un budget de couple clair et apaisé',
      desc: 'Planifiez vos revenus, dépenses et soutiens en FCFA ensemble, en toute confiance et transparence.',
      svg: (
        <svg viewBox="0 0 240 180" className="w-full h-44 drop-shadow-sm">
          <circle cx="120" cy="90" r="70" fill="var(--color-primary-light)" />
          <circle cx="90" cy="70" r="18" fill="var(--color-primary)" />
          <path d="M65 125 C65 98, 115 98, 115 125 Z" fill="var(--color-primary)" />
          <circle cx="150" cy="70" r="18" fill="#F5B700" />
          <path d="M125 125 C125 98, 175 98, 175 125 Z" fill="#F5B700" />
          <path
            d="M108 55 Q120 40 132 55"
            stroke="var(--color-primary)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      ),
    },
    {
      title: 'Chaque dépense notée en 2 secondes',
      desc: 'Clavier instantané, lecture SMS Mobile Money ou saisie vocale en français. Vos comptes toujours à jour.',
      svg: (
        <svg viewBox="0 0 240 180" className="w-full h-44 drop-shadow-sm">
          <rect
            x="50"
            y="30"
            width="140"
            height="120"
            rx="20"
            fill="var(--color-surface)"
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          <rect x="70" y="55" width="100" height="24" rx="6" fill="var(--color-primary-light)" />
          <circle cx="85" cy="67" r="5" fill="var(--color-primary)" />
          <line
            x1="100"
            y1="67"
            x2="155"
            y2="67"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="85" cy="105" r="12" fill="var(--color-income-soft)" />
          <circle cx="120" cy="105" r="12" fill="var(--color-surface-subtle)" />
          <circle cx="155" cy="105" r="12" fill="var(--color-expense-soft)" />
          <polygon points="120,40 130,22 110,22" fill="#F5B700" />
        </svg>
      ),
    },
    {
      title: 'Épargner ensemble pour l’avenir',
      desc: 'Provisions rentrée scolaire, fêtes, santé et projets partagés : bâtissez la sérénité de votre famille.',
      svg: (
        <svg viewBox="0 0 240 180" className="w-full h-44 drop-shadow-sm">
          <circle cx="120" cy="90" r="70" fill="var(--color-income-soft)" />
          <path
            d="M70 130 L105 100 L140 115 L175 65"
            fill="none"
            stroke="var(--color-income)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="175" cy="65" r="8" fill="#F5B700" />
          <circle cx="105" cy="100" r="5" fill="var(--color-income)" />
          <circle cx="140" cy="115" r="5" fill="var(--color-income)" />
        </svg>
      ),
    },
  ];

  // Copy code helper
  const handleCopyCode = (val: string) => {
    triggerHaptic('success');
    navigator.clipboard.writeText(val);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Share code helper
  const handleShareCode = async (val: string) => {
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoindre mon foyer NSANGAWEH',
          text: `Rejoins notre budget familial sur NSANGAWEH avec ce code : ${val}`,
        });
      } catch {}
    } else {
      handleCopyCode(val);
    }
  };

  // 10-char box change handler
  const handleBoxChange = (idx: number, val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 1) {
      // Paste handling
      const chars = clean.slice(0, 10).split('');
      const newBoxes = [...codeBoxes];
      chars.forEach((c, i) => {
        if (i < 10) newBoxes[i] = c;
      });
      setCodeBoxes(newBoxes);
      const nextIdx = Math.min(chars.length, 9);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newBoxes = [...codeBoxes];
    newBoxes[idx] = clean;
    setCodeBoxes(newBoxes);

    if (clean && idx < 9) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleBoxKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeBoxes[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // 1. Intro Slide Show
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-6 bg-[var(--color-background)] text-center animate-in fade-in">
        <div className="pt-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
            N
          </div>
          <span className="block mt-2 font-heading font-bold text-base text-[var(--color-primary)] tracking-wider">
            NSANGAWEH
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 my-auto py-6">
          {slides[slideIndex].svg}

          <div className="max-w-xs">
            <h1 className="m-0 text-xl font-heading font-extrabold text-[var(--color-text)]">
              {slides[slideIndex].title}
            </h1>
            <p className="m-0 text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
              {slides[slideIndex].desc}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-6 max-w-xs mx-auto w-full">
          <div className="flex justify-center gap-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  slideIndex === idx ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {slideIndex < slides.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleFinishIntro}
                  className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Passer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSlideIndex((prev) => prev + 1);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-[var(--shadow-fab)] flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  Suivant
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFinishIntro}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-[var(--shadow-fab)] flex items-center justify-center gap-2 active:scale-95 transition"
              >
                Commencer
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Household Setup Step
  if (authStep === 'household') {
    return (
      <div className="min-h-screen p-5 flex flex-col justify-center max-w-md mx-auto">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[28px] p-6 shadow-[var(--shadow-raised)] flex flex-col gap-5">
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-2">
              <Users size={24} />
            </div>
            <h2 className="m-0 text-xl font-heading font-extrabold text-[var(--color-text)]">
              Bienvenue sur NSANGAWEH
            </h2>
            <p className="m-0 text-xs text-[var(--color-text-muted)] mt-1 max-w-xs leading-relaxed">
              Pour synchroniser vos comptes à deux, créez votre foyer ou rejoignez celui de votre
              partenaire.
            </p>
          </div>

          {/* First Name & Avatar Color */}
          <div className="flex flex-col gap-2.5 bg-[var(--color-surface-subtle)] p-3.5 rounded-2xl border border-[var(--color-border)]">
            <label className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5">
              <User size={14} className="text-[var(--color-primary)]" />
              Votre prénom
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex : Christian, Danielle"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden font-medium"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[var(--color-text-muted)]">Couleur d'avatar :</span>
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedColor(c);
                    }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-600' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Choice or Created code */}
          {createdCode ? (
            <div className="flex flex-col gap-3 text-center py-2 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/40 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-primary)]">
                  Code de votre foyer à donner à votre partenaire :
                </span>
                <span className="text-2xl font-mono font-extrabold tracking-widest text-[var(--color-primary)] select-all">
                  {createdCode}
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(createdCode)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 shadow-2xs"
                  >
                    {copiedCode ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copiedCode ? 'Copié !' : 'Copier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareCode(createdCode)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Share2 size={14} />
                    Partager
                  </button>
                </div>
              </div>
              <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
                Votre foyer est prêt. Vous pouvez commencer à noter vos dépenses.
              </p>
            </div>
          ) : householdMode === 'choose' ? (
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                disabled={busy || !firstName.trim()}
                onClick={() => {
                  triggerHaptic('success');
                  onCreateHousehold(firstName.trim(), selectedColor);
                }}
                className="p-4 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition disabled:opacity-50 text-left flex items-center justify-between"
              >
                <div>
                  <span className="block text-base">Créer notre foyer</span>
                  <small className="block text-xs font-normal text-emerald-100 opacity-90 mt-0.5">
                    Je reçois un code à partager avec mon/ma partenaire
                  </small>
                </div>
                <ArrowRight size={20} className="shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setHouseholdMode('join');
                }}
                className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-heading font-bold text-sm hover:border-[var(--color-primary)] active:scale-95 transition text-left flex items-center justify-between"
              >
                <div>
                  <span className="block text-base">Rejoindre mon foyer</span>
                  <small className="block text-xs font-normal text-[var(--color-text-muted)] mt-0.5">
                    Mon partenaire m'a déjà donné le code à 10 caractères
                  </small>
                </div>
                <ArrowRight size={20} className="shrink-0 text-[var(--color-text-muted)]" />
              </button>
            </div>
          ) : (
            /* 10 Separate Character Boxes for Joining */
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setHouseholdMode('choose')}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft size={16} /> Retour
                </button>
                <span className="text-xs font-bold text-[var(--color-text)]">Entrez le code</span>
              </div>

              <div className="flex justify-between gap-1 sm:gap-1.5">
                {codeBoxes.map((char, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={10}
                    value={char}
                    onChange={(e) => handleBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBoxKeyDown(idx, e)}
                    className="w-8 h-11 sm:w-9 sm:h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-center font-mono font-extrabold text-base uppercase text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-hidden transition"
                  />
                ))}
              </div>

              {error && (
                <p className="m-0 text-xs font-semibold text-[var(--color-expense)] text-center">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={busy || codeBoxes.join('').length < 10 || !firstName.trim()}
                onClick={() => {
                  triggerHaptic('medium');
                  onJoinHousehold(codeBoxes.join(''), firstName.trim(), selectedColor);
                }}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition disabled:opacity-40"
              >
                {busy ? 'Vérification du code…' : 'Valider et rejoindre'}
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="truncate max-w-[200px]">{userEmail}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="text-[var(--color-primary)] font-bold hover:underline"
            >
              Changer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Auth (Sign In / Sign Up)
  return (
    <div className="min-h-screen p-5 flex flex-col justify-center max-w-md mx-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[28px] p-6 shadow-[var(--shadow-raised)] flex flex-col gap-5">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-extrabold text-xl flex items-center justify-center shadow-md mb-2">
            N
          </div>
          <h2 className="m-0 text-xl font-heading font-extrabold text-[var(--color-text)]">
            {authMode === 'signin' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="m-0 text-xs text-[var(--color-text-muted)] mt-1 max-w-xs leading-relaxed">
            {authMode === 'signin'
              ? 'Connectez-vous pour retrouver le budget de votre foyer.'
              : 'Chaque partenaire crée son propre compte sécurisé.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => onSetAuthMode('signin')}
            className={`py-2 rounded-lg text-xs font-heading font-bold transition ${
              authMode === 'signin'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => onSetAuthMode('signup')}
            className={`py-2 rounded-lg text-xs font-heading font-bold transition ${
              authMode === 'signup'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerHaptic('light');
            if (authMode === 'signin') {
              onSignIn(email.trim(), password);
            } else {
              onSignUp(email.trim(), password, firstName.trim(), selectedColor);
            }
          }}
          className="flex flex-col gap-3.5"
        >
          {/* Sign up extra: First name */}
          {authMode === 'signup' && (
            <div className="flex flex-col gap-1 animate-in fade-in">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">
                Votre prénom
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex : Christian, Danielle"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nom@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">
                Mot de passe
              </label>
              {authMode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[var(--color-primary)] font-semibold hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="Au moins 6 caractères"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="m-0 text-xs font-semibold text-[var(--color-expense)] text-center leading-tight">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-[var(--shadow-fab)] hover:bg-[var(--color-primary-dark)] active:scale-95 transition disabled:opacity-50 mt-1 cursor-pointer"
          >
            {busy
              ? 'Traitement en cours…'
              : authMode === 'signin'
              ? 'Se connecter'
              : 'Créer mon compte'}
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--color-border)] text-center">
          <button
            type="button"
            onClick={onContinueOffline}
            className="text-xs text-[var(--color-primary)] font-semibold hover:underline"
          >
            Continuer sans synchronisation (mode local)
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[var(--color-surface)] p-6 rounded-3xl shadow-xl flex flex-col gap-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Réinitialiser mon mot de passe
            </h3>

            {forgotSent ? (
              <div className="flex flex-col gap-3 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-[var(--color-income-soft)] text-[var(--color-income)] flex items-center justify-center mx-auto">
                  <Check size={20} />
                </div>
                <p className="m-0 text-xs text-[var(--color-text)]">
                  Un e-mail de réinitialisation a été envoyé à <b>{forgotEmail}</b>. Vérifiez votre
                  boîte de réception.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-2 py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  setForgotLoading(true);
                  try {
                    await onResetPassword(forgotEmail.trim());
                    setForgotSent(true);
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <p className="m-0 text-xs text-[var(--color-text-muted)]">
                  Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé :
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl border border-[var(--color-border)] font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs disabled:opacity-50"
                  >
                    {forgotLoading ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
