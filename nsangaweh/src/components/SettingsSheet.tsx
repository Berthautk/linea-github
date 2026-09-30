import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  Eye,
  FileText,
  Gauge,
  Globe,
  Info,
  LogOut,
  Moon,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { exportLedgerToCSV } from '../lib/csv-export';
import { getQuotaTracker } from '../lib/firebase';
import { triggerHaptic } from '../lib/haptics';
import { RubricBadge } from '../lib/icons';
import { TEMPLATES } from '../lib/templates';
import { Category, HouseholdSettings, MemberBudget } from '../lib/types';
import { SmsTesterModal } from './SmsTesterModal';
import { ActionSheet, Toggle } from './ui';

interface SettingsSheetProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  householdId: string;
  budget: MemberBudget;
  rollover: boolean;
  onToggleRollover: (v: boolean) => void;
  onRestoreCategory: (id: string) => void;
  onMoveEntries: (fromId: string, toId: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onOpenSetup: (step: 'pick' | 'import') => void;
  onPrepareMonth: () => void;
  householdSettings?: HouseholdSettings;
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateSettings?: (settings: Partial<HouseholdSettings>) => void;
  onSignOut: () => void;
  onLeaveHousehold: () => void;
  onDeleteAccount: () => Promise<void>;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  userName,
  userEmail,
  householdId,
  budget,
  rollover,
  onToggleRollover,
  onRestoreCategory,
  onMoveEntries,
  onApplyTemplate,
  onOpenSetup,
  onPrepareMonth,
  householdSettings,
  onClose,
  onUpdateName,
  onUpdateSettings,
  onSignOut,
  onLeaveHousehold,
  onDeleteAccount,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [moving, setMoving] = useState<Category | null>(null);
  const [moveTarget, setMoveTarget] = useState<Category | null>(null);
  const [templateAsk, setTemplateAsk] = useState<string | null>(null);
  React.useEffect(() => {
    if (isOpen) setNameInput(userName);
  }, [isOpen, userName]);
  const archived = budget.categories.filter((c) => c.archived);
  const activeCats = budget.categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  const entriesOf = (id: string) =>
    Object.values(budget.months).reduce((s, m) => s + m.entries.filter((e) => e.categoryId === id).length, 0);
  const [copied, setCopied] = useState(false);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('nsangaweh-theme') as any) || 'system';
  });

  // Mode économe
  const [ecoMode, setEcoMode] = useState<boolean>(() => {
    return localStorage.getItem('nsangaweh-ecomode') === 'true';
  });

  // Reminders
  const [eveningReminder, setEveningReminder] = useState<boolean>(() => {
    return localStorage.getItem('nsangaweh-reminder') === 'true';
  });

  // Settings
  const monthStartDay = householdSettings?.monthStartDay || 1;
  const approvalThreshold = householdSettings?.approvalThreshold || 50000;
  const approvalEnabled = householdSettings?.approvalEnabled ?? true;

  // Modals
  const [activeModal, setActiveModal] = useState<
    'privacy' | 'terms' | 'delete' | 'smsTest' | 'quota' | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!isOpen) return null;

  // Quota usage
  const quota = getQuotaTracker();
  const readsLimit = 50000;
  const writesLimit = 20000;
  const readsPct = Math.round((quota.readsToday / readsLimit) * 100);
  const writesPct = Math.round((quota.writesToday / writesLimit) * 100);
  const isNearQuotaLimit = readsPct >= 80 || writesPct >= 80;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    triggerHaptic('success');
    onUpdateName(nameInput.trim());
  };

  const handleCopyCode = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(householdId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon foyer NSANGAWEH',
          text: `Rejoins notre budget familial sur NSANGAWEH avec ce code : ${householdId}`,
        });
      } catch {}
    } else {
      handleCopyCode();
    }
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    triggerHaptic('light');
    setThemeMode(newTheme);
    localStorage.setItem('nsangaweh-theme', newTheme);

    const root = document.documentElement;
    if (newTheme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  const handleEcoModeToggle = () => {
    triggerHaptic('light');
    const nextVal = !ecoMode;
    setEcoMode(nextVal);
    localStorage.setItem('nsangaweh-ecomode', String(nextVal));
    if (nextVal) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
    }
  };

  const handleReminderToggle = () => {
    triggerHaptic('light');
    const nextVal = !eveningReminder;
    setEveningReminder(nextVal);
    localStorage.setItem('nsangaweh-reminder', String(nextVal));

    if (nextVal && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleExportCSV = () => {
    triggerHaptic('success');
    exportLedgerToCSV(budget, userName || 'Utilisateur', householdId || 'Local');
  };

  const executeDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'supprimer') return;
    triggerHaptic('warning');
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Réglages"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-3 pb-2.5 px-5 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Réglages & Compte
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

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 no-scrollbar">
          {/* 1. Profile section */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[var(--color-text)]">
              <User size={15} className="text-[var(--color-primary)]" />
              <span>Profil personnel</span>
            </div>

            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Votre prénom"
                className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] font-semibold"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-2xs hover:bg-[var(--color-primary-dark)]"
              >
                Enregistrer
              </button>
            </form>

            <span className="text-[11px] text-[var(--color-text-muted)] truncate block">
              Compte : <b>{userEmail || 'Mode local'}</b>
            </span>
          </div>

          {/* Budget structure */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">Mon budget</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button type="button" onClick={onPrepareMonth} className="min-h-10 px-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-bold">
                Préparer le mois
              </button>
              <button type="button" onClick={() => onOpenSetup('pick')} className="min-h-10 px-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-bold">
                Choisir des rubriques
              </button>
              <button type="button" onClick={() => onOpenSetup('import')} className="min-h-10 px-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-bold">
                Importer ma fiche
              </button>
            </div>
            <Toggle
              checked={rollover}
              onChange={onToggleRollover}
              label="Reporter automatiquement le solde non dépensé d’une rubrique au mois suivant"
              hint="Pour les enveloppes : ce qui reste s’ajoute au mois suivant."
            />
          </div>

          {/* Archived rubrics */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">Rubriques archivées</span>
            {!archived.length ? (
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Aucune. Une rubrique supprimée qui a des opérations est archivée ici, avec son historique.
              </span>
            ) : (
              archived.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <RubricBadge icon={c.icon} color={c.color} size="sm" />
                  <span className="flex-1 min-w-0 leading-tight">
                    <span className="block text-xs font-semibold truncate">{c.name}</span>
                    <span className="block text-[10px] text-[var(--color-text-muted)]">{entriesOf(c.id)} opération(s)</span>
                  </span>
                  <button type="button" onClick={() => onRestoreCategory(c.id)} className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-[var(--color-primary)]">
                    Restaurer
                  </button>
                  <button type="button" onClick={() => setMoving(c)} className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-[var(--color-text-muted)]">
                    Déplacer
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Templates */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">Modèles</span>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateAsk(t.id)}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-left"
              >
                <span className="block text-xs font-bold">{t.name}</span>
                <span className="block text-[10px] text-[var(--color-text-muted)]">{t.description}</span>
              </button>
            ))}
          </div>

          {/* 2. Household code */}
          {householdId && (
            <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  <Users size={15} className="text-[var(--color-primary)]" />
                  Code du foyer
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">À partager à 2</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-extrabold tracking-wider text-[var(--color-primary)] truncate">
                  {householdId}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareCode}
                    className="p-1.5 rounded-lg text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Cycle & Accord à deux (Couple settings) */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-3">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">
              Paramètres du foyer
            </span>

            {/* Month start day (1 to 28) */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-[var(--color-text)] block">
                  Début du mois budgétaire
                </span>
                <small className="text-[10px] text-[var(--color-text-muted)]">
                  Jour de versement du salaire
                </small>
              </div>

              <select
                value={monthStartDay}
                onChange={(e) =>
                  onUpdateSettings?.({ monthStartDay: parseInt(e.target.value, 10) })
                }
                className="px-2.5 py-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-xs"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Le {d} du mois
                  </option>
                ))}
              </select>
            </div>

            {/* Approval threshold */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-border)]/60">
              <div>
                <span className="font-medium text-[var(--color-text)] block">
                  Seuil d'accord à deux
                </span>
                <small className="text-[10px] text-[var(--color-text-muted)]">
                  Notification si dépense ≥ ce montant
                </small>
              </div>

              <select
                value={approvalThreshold}
                onChange={(e) =>
                  onUpdateSettings?.({ approvalThreshold: parseInt(e.target.value, 10) })
                }
                className="px-2.5 py-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-xs"
              >
                <option value={20000}>20 000 FCFA</option>
                <option value={30000}>30 000 FCFA</option>
                <option value={50000}>50 000 FCFA</option>
                <option value={100000}>100 000 FCFA</option>
              </select>
            </div>
          </div>

          {/* 4. Apparence & Mode Économe */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-3">
            <span className="text-xs font-heading font-bold text-[var(--color-text)]">
              Affichage & Données
            </span>

            {/* Theme switcher */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text)]">Thème</span>
              <div className="flex p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleThemeChange(mode)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                      themeMode === mode
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {mode === 'system' ? 'Auto' : mode === 'light' ? 'Clair' : 'Sombre'}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode économe */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-border)]/60">
              <div>
                <span className="font-medium text-[var(--color-text)] flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" /> Mode économe (Faible réseau)
                </span>
                <small className="text-[10px] text-[var(--color-text-muted)]">
                  Police système, écritures groupées toutes les 20s
                </small>
              </div>
              <input
                type="checkbox"
                checked={ecoMode}
                onChange={handleEcoModeToggle}
                className="w-4 h-4 rounded-xs text-[var(--color-primary)] cursor-pointer"
              />
            </div>

            {/* Daily reminder */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-border)]/60">
              <div>
                <span className="font-medium text-[var(--color-text)] flex items-center gap-1.5">
                  <Bell size={14} className="text-[var(--color-primary)]" /> Rappel du soir (20h)
                </span>
                <small className="text-[10px] text-[var(--color-text-muted)]">
                  Pour ne pas oublier de noter les dépenses
                </small>
              </div>
              <input
                type="checkbox"
                checked={eveningReminder}
                onChange={handleReminderToggle}
                className="w-4 h-4 rounded-xs text-[var(--color-primary)] cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Avancé & Quota Spark */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col gap-2.5">
            <span className="text-xs font-heading font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <Gauge size={14} className="text-[var(--color-primary)]" />
              Utilisation de la synchronisation (Spark Gratuit)
            </span>

            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Lectures aujourd'hui :</span>
                <b className="num">
                  {quota.readsToday} / {readsLimit} ({readsPct}%)
                </b>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min(100, readsPct)}%` }}
                />
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-[var(--color-text-muted)]">Écritures aujourd'hui :</span>
                <b className="num">
                  {quota.writesToday} / {writesLimit} ({writesPct}%)
                </b>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min(100, writesPct)}%` }}
                />
              </div>
            </div>

            {isNearQuotaLimit && (
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-[10px] text-amber-800 dark:text-amber-200">
                Vous approchez de 80% du quota journalier gratuit. L'application continue de
                fonctionner hors-ligne normalement et se synchronisera dès le renouvellement.
              </div>
            )}

            {/* Test SMS Parser link */}
            <button
              type="button"
              onClick={() => setActiveModal('smsTest')}
              className="mt-1 w-full py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex items-center justify-center gap-1.5 hover:border-[var(--color-primary)]"
            >
              <Smartphone size={13} />
              Test du lecteur SMS Mobile Money (Avancé)
            </button>
          </div>

          {/* 6. Export and Policy links */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] flex items-center justify-between hover:bg-[var(--color-surface-subtle)]"
            >
              <span className="flex items-center gap-2">
                <Download size={14} className="text-[var(--color-primary)]" />
                Exporter mon budget au format CSV
              </span>
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="w-full py-2.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] flex items-center justify-between hover:bg-[var(--color-surface-subtle)]"
            >
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-[var(--color-primary)]" />
                Politique de confidentialité (SMS & données)
              </span>
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="w-full py-2.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] flex items-center justify-between hover:bg-[var(--color-surface-subtle)]"
            >
              <span className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--color-primary)]" />
                Conditions d'utilisation
              </span>
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* 7. Sign out, leave, delete account */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex items-center justify-center gap-1.5 hover:bg-[var(--color-surface-subtle)]"
            >
              <LogOut size={14} /> Se déconnecter
            </button>

            {householdId && (
              <button
                type="button"
                onClick={onLeaveHousehold}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                Quitter ce foyer
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal('delete')}
              className="w-full py-2 rounded-xl text-xs font-bold text-[var(--color-expense)] hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-1.5"
            >
              <Trash2 size={13} /> Supprimer mon compte et toutes mes données
            </button>

            <small className="text-[10px] text-center text-[var(--color-text-muted)] pt-1">
              NSANGAWEH v1.2.0 · Conçu pour les familles d'Afrique Centrale
            </small>
          </div>
        </div>
      </div>

      <ActionSheet
        open={!!moving && !moveTarget}
        title={`Déplacer les opérations de « ${moving?.name || ''} »`}
        message="Choisissez la rubrique qui recevra toutes ses opérations. La rubrique archivée sera ensuite supprimée."
        onClose={() => setMoving(null)}
        actions={activeCats
          .filter((c) => c.kind === moving?.kind)
          .map((c) => ({ label: c.name, onClick: () => setMoveTarget(c) }))}
      />
      <ActionSheet
        open={!!moving && !!moveTarget}
        title="Confirmer le déplacement"
        message={`${moving ? entriesOf(moving.id) : 0} opération(s) de « ${moving?.name} » iront dans « ${moveTarget?.name} ». Les montants et les dates ne changent pas.`}
        onClose={() => setMoveTarget(null)}
        actions={[
          {
            label: 'Déplacer les opérations',
            onClick: () => {
              if (moving && moveTarget) onMoveEntries(moving.id, moveTarget.id);
              setMoving(null);
              setMoveTarget(null);
            },
          },
          { label: 'Annuler', onClick: () => setMoveTarget(null) },
        ]}
      />
      <ActionSheet
        open={!!templateAsk}
        title="Appliquer le modèle"
        message="Les rubriques et lignes du modèle sont ajoutées au mois affiché. Vos rubriques existantes du même nom sont réutilisées. Vous pourrez annuler."
        onClose={() => setTemplateAsk(null)}
        actions={[
          {
            label: 'Ajouter au mois affiché',
            onClick: () => {
              if (templateAsk) onApplyTemplate(templateAsk);
              setTemplateAsk(null);
            },
          },
          { label: 'Annuler', onClick: () => setTemplateAsk(null) },
        ]}
      />

      {/* Modals: SMS Tester */}
      <SmsTesterModal
        isOpen={activeModal === 'smsTest'}
        onClose={() => setActiveModal(null)}
      />

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 text-sm font-heading font-bold text-[var(--color-text)]">
              Politique de confidentialité
            </h3>
            <p className="m-0 leading-relaxed text-[var(--color-text-muted)] text-[11px]">
              <b>1. Analyse des SMS Mobile Money :</b> L’analyse des SMS s'effectue à 100% sur votre
              appareil (on-device). Le texte brut du SMS n’est JAMAIS envoyé vers nos serveurs ni
              enregistré. Seules les données financières que vous validez (montant, motif, date)
              sont enregistrées.
            </p>
            <p className="m-0 leading-relaxed text-[var(--color-text-muted)] text-[11px]">
              <b>2. Partage avec votre partenaire :</b> Les données de budget du foyer sont
              partagées uniquement entre les deux partenaires du même code foyer. Vos dettes et
              tontines privées restent confidentielles sauf si vous activez le partage.
            </p>
            <p className="m-0 leading-relaxed text-[var(--color-text-muted)] text-[11px]">
              <b>3. Suppression complète :</b> Conformément aux règles de Google Play et au RGPD,
              vous pouvez supprimer l'intégralité de vos comptes et données à tout moment depuis
              cette page.
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-2 w-full py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === 'terms' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 text-sm font-heading font-bold text-[var(--color-text)]">
              Conditions d'utilisation
            </h3>
            <p className="m-0 leading-relaxed text-[var(--color-text-muted)] text-[11px]">
              NSANGAWEH est un outil de gestion budgétaire personnelle et familiale. L'application
              n'octroie aucun prêt, ne réalise aucun investissement et ne se connecte à aucune API
              bancaire automatisée.
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-2 w-full py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>

            <h3 className="m-0 text-sm font-heading font-bold text-center text-rose-600">
              Supprimer mon compte et toutes mes données ?
            </h3>

            <p className="m-0 text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed">
              Cette action est irréversible. Votre compte, vos mois de budget, vos opérations et vos
              paramètres seront définitivement effacés de Firestore.
            </p>

            <p className="m-0 text-[11px] font-semibold text-[var(--color-text)] text-center">
              Tapez <b>supprimer</b> pour confirmer :
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="supprimer"
              className="px-3 py-2 rounded-xl border border-rose-300 text-center font-bold text-xs"
            />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 rounded-xl border border-[var(--color-border)] font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.toLowerCase() !== 'supprimer' || isDeleting}
                onClick={executeDeleteAccount}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs disabled:opacity-40"
              >
                {isDeleting ? 'Suppression…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
