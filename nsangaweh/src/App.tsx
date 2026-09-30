/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccueilScreen } from './components/AccueilScreen';
import { AlertsInboxSheet } from './components/AlertsInboxSheet';
import { BottomNav, NavTab } from './components/BottomNav';
import { BudgetSetupFlow, CopySource, PickedRubric, SetupStep } from './components/BudgetSetupFlow';
import { CommitmentsSheet } from './components/CommitmentsSheet';
import { DebtsSheet } from './components/DebtsSheet';
import { EnvelopeSheet } from './components/EnvelopeSheet';
import { EvolutionScreen } from './components/EvolutionScreen';
import { FamilleScreen } from './components/FamilleScreen';
import { JournalScreen } from './components/JournalScreen';
import { LineSheet, LineValues } from './components/LineSheet';
import { MonthReviewSheet } from './components/MonthReviewSheet';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PlusHubScreen, PlusModule } from './components/PlusHubScreen';
import { QuickAddDraft, QuickAddPrefill, QuickAddSheet } from './components/QuickAddSheet';
import { RubricDraft, RubricEditorSheet } from './components/RubricEditorSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { TopAppBar } from './components/TopAppBar';
import { ActionSheet, SheetAction } from './components/ui';
import { WalletsSheet } from './components/WalletsSheet';
import {
  addDebt,
  addEntry,
  addLine,
  archiveCategory,
  createCategory,
  deleteCategory,
  deleteEntry,
  deleteLine,
  editLine,
  editNeedsScope,
  ensureCategory,
  LinePatch,
  moveCategoryEntries,
  OpResult,
  recordDebtPayment,
  removeDebt,
  reorderCategories,
  reorderLines,
  restoreCategory,
  setBudgetMode,
  setEnvelopeAmount,
  updateCategory,
  updateEntry,
} from './lib/budget-ops';
import {
  currentMonthKey,
  DEFAULT_WALLETS,
  fmt,
  generateHouseholdCode,
  generateId,
  getBudgetMonthForDate,
  monthLabel,
  monthName,
  todayStr,
} from './lib/budget-math';
import { calcMonth, sortCategories } from './lib/calc';
import { INCOME_RUBRIC_DEFAULT, OTHER_RUBRIC_DEFAULT } from './lib/catalog';
import { addMerge, MergeSuggestion, removeMerge } from './lib/family';
import {
  createUserWithEmailAndPassword,
  deleteDoc,
  deleteUser,
  doc,
  fbSignOut,
  getAuthErrorMessage,
  getDoc,
  getStoredConfig,
  getStoredHouseholdId,
  incrementQuota,
  initFirebase,
  onAuthStateChanged,
  onSnapshot,
  saveStoredHouseholdId,
  sendPasswordResetEmail,
  setDoc,
  signInWithEmailAndPassword,
  updateDoc,
} from './lib/firebase';
import { triggerHaptic } from './lib/haptics';
import { applyImport, ImportRow } from './lib/importer';
import { applyMonthReview, buildMonthReview, copyMonthPlan, debtsCategory, generateMonthDoc, MonthReview, previousPlannedMonth } from './lib/plan';
import { recurrenceChoice, sameRecurrence } from './lib/recurrence';
import { applyTemplate, TEMPLATES } from './lib/templates';
import {
  AlertItem,
  Category,
  CategoryKind,
  Commitment,
  Debt,
  Entry,
  HouseholdSettings,
  MemberBudget,
  MemberData,
  MonthDoc,
  MonthLine,
  RecipientMemory,
  Wallet,
} from './lib/types';
import { useMemberStore } from './lib/useMemberStore';

const DEFAULT_SETTINGS: HouseholdSettings = {
  monthStartDay: 1,
  approvalThreshold: 50000,
  approvalEnabled: true,
  plan: 'free',
  rubricMerges: {},
  rubricMergesDismissed: [],
};

const LOCAL_SETTINGS_KEY = 'nsangaweh-household-settings';
const REVIEW_SKIPPED_KEY = 'nsangaweh-review-skipped';

type Toast = { msg: string; undo?: { before: MemberBudget; paths: string[] } };

type Ask =
  | { kind: 'editScope'; lineId: string; patch: LinePatch }
  | { kind: 'deleteScope'; line: MonthLine };

/** Plan the month with the default choices first, so adding a line never skips the review items. */
function ensurePlanned(b: MemberBudget, monthKey: string, rollover: boolean): MemberBudget {
  if (b.months[monthKey]?.planCreated) return b;
  return { ...b, months: { ...b.months, [monthKey]: generateMonthDoc(b, monthKey, { rollover }) } };
}

function readSkipped(): string[] {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_SKIPPED_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function App() {
  const store = useMemberStore();
  const { budget, profile } = store;

  const [activeTab, setActiveTab] = useState<NavTab>('accueil');
  const [currentMonth, setCurrentMonth] = useState<string>(() => currentMonthKey());
  const [openRubric, setOpenRubric] = useState<string | null>(null);
  const scrollByTab = useRef<Record<string, number>>({});

  // Auth & household
  const [authStatus, setAuthStatus] = useState<'loading' | 'none' | 'signin' | 'household' | 'ready'>('loading');
  const [isCloud, setIsCloud] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [createdHouseholdCode, setCreatedHouseholdCode] = useState<string | undefined>(undefined);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [householdId, setHouseholdId] = useState<string>(() => getStoredHouseholdId());
  const pendingProfile = useRef<{ name: string; color: string }>({ name: '', color: '#0B6E4F' });
  const [householdSettings, setHouseholdSettings] = useState<HouseholdSettings>(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const fbRef = useRef<{ app: any; db: any; auth: any } | null>(null);

  // Local-only lists that are not part of the budget model yet
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [recipientMemories, setRecipientMemories] = useState<RecipientMemory[]>([]);

  // Sheets
  const [quickAdd, setQuickAdd] = useState<{ open: boolean; type: 'in' | 'out' | 'save'; prefill: QuickAddPrefill | null }>({
    open: false,
    type: 'out',
    prefill: null,
  });
  const [lineSheet, setLineSheet] = useState<{ open: boolean; lineId?: string; defaultCategoryId?: string; kindFilter?: CategoryKind }>({
    open: false,
  });
  const [createdCategoryId, setCreatedCategoryId] = useState<string | null>(null);
  const [rubricEditor, setRubricEditor] = useState<{ open: boolean; categoryId?: string; kind: CategoryKind; fromLine?: boolean }>({
    open: false,
    kind: 'out',
  });
  const [rubricMenu, setRubricMenu] = useState<Category | null>(null);
  const [envelopeFor, setEnvelopeFor] = useState<string | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [review, setReview] = useState<MonthReview | null>(null);
  const [setup, setSetup] = useState<{ open: boolean; step?: SetupStep }>({ open: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalletsOpen, setIsWalletsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  const [isCommitmentsOpen, setIsCommitmentsOpen] = useState(false);
  const [activePlusModule, setActivePlusModule] = useState<PlusModule | null>(null);
  const [reviewSkipped, setReviewSkipped] = useState<string[]>(readSkipped);

  // Snackbar with "Annuler" (6 seconds)
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, undo?: Toast['undo']) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const rollover = !!profile.envelopeRollover;
  const monthStartDay = householdSettings.monthStartDay || 1;
  const budgetMonthOf = (date: string) => getBudgetMonthForDate(date, monthStartDay);

  /**
   * Apply an operation to the budget. Returns an error message or null.
   * With `undoable`, the snackbar offers "Annuler" for 6 seconds.
   */
  const run = (
    fn: (b: MemberBudget) => OpResult | MemberBudget,
    message?: string | ((r: OpResult & { ok: true }) => string),
    undoable = false
  ): string | null => {
    const before = store.budgetRef.current;
    const res = fn(before);
    const r: OpResult = 'ok' in res ? res : { ok: true, budget: res };
    if (!r.ok) {
      triggerHaptic('warning');
      return r.error;
    }
    const paths = store.commit(r.budget);
    if (message) showToast(typeof message === 'string' ? message : message(r), undoable && paths.length ? { before, paths } : undefined);
    return null;
  };

  /* ------------------------------- theme ------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem('nsangaweh-theme');
    if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved);
  }, []);

  /* ------------------------------ firebase ------------------------------ */
  const startCloud = (uid: string, hid: string) => {
    const services = fbRef.current!;
    setIsCloud(true);
    setAuthStatus('ready');
    store.startCloud(services.db, hid, uid, pendingProfile.current.name ? pendingProfile.current : {});
    onSnapshot(doc(services.db, `households/${hid}`), (snap: any) => {
      incrementQuota('read', 1);
      if (snap.exists() && snap.data().settings) setHouseholdSettings({ ...DEFAULT_SETTINGS, ...snap.data().settings });
    });
  };

  const loadLocalOnly = () => {
    setIsCloud(false);
    store.startLocal();
    setAuthStatus('ready');
  };

  useEffect(() => {
    const config = getStoredConfig();
    if (!config) {
      loadLocalOnly();
      return;
    }
    try {
      const services = initFirebase(config);
      fbRef.current = services;
      const unsub = onAuthStateChanged(services.auth, (user) => {
        if (!user) {
          setUserUid(null);
          setUserEmail('');
          setAuthStatus('signin');
          return;
        }
        setUserUid(user.uid);
        setUserEmail(user.email || '');
        const hid = getStoredHouseholdId();
        if (!hid) setAuthStatus('household');
        else {
          setHouseholdId(hid);
          startCloud(user.uid, hid);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error('Firebase init error', e);
      loadLocalOnly();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (email: string, pass: string) => {
    if (!fbRef.current) return;
    setIsBusy(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(fbRef.current.auth, email, pass);
    } catch (err: any) {
      setAuthError(getAuthErrorMessage(err));
    }
    setIsBusy(false);
  };

  const handleSignUp = async (email: string, pass: string, name: string, color: string) => {
    if (!fbRef.current) return;
    setIsBusy(true);
    setAuthError('');
    try {
      pendingProfile.current = { name, color };
      await createUserWithEmailAndPassword(fbRef.current.auth, email, pass);
    } catch (err: any) {
      setAuthError(getAuthErrorMessage(err));
    }
    setIsBusy(false);
  };

  const handleSignOut = async () => {
    triggerHaptic('medium');
    if (fbRef.current) await fbSignOut(fbRef.current.auth);
    window.location.reload();
  };

  const handleLeaveHousehold = () => {
    saveStoredHouseholdId('');
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const fb = fbRef.current;
    if (!fb?.auth.currentUser) return;
    try {
      if (householdId && userUid) await deleteDoc(doc(fb.db, `households/${householdId}/members/${userUid}`)).catch(() => {});
      await deleteUser(fb.auth.currentUser);
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      showToast('Reconnectez-vous puis réessayez pour supprimer votre compte.');
      throw e;
    }
  };

  const handleCreateHousehold = async (name: string, color: string) => {
    const code = generateHouseholdCode();
    setCreatedHouseholdCode(code);
    saveStoredHouseholdId(code);
    setHouseholdId(code);
    pendingProfile.current = { name, color };
    if (userUid && fbRef.current) {
      await setDoc(doc(fbRef.current.db, `households/${code}`), {
        joinCode: code,
        members: [userUid],
        createdAt: Date.now(),
        settings: householdSettings,
      });
      incrementQuota('write', 1);
      startCloud(userUid, code);
      showToast(`Code foyer créé : ${code}. Partagez-le avec votre partenaire.`);
    }
  };

  const handleJoinHousehold = async (code: string, name: string, color: string) => {
    if (!fbRef.current) return;
    setIsBusy(true);
    setAuthError('');
    try {
      const clean = code.trim().toUpperCase();
      const ref = doc(fbRef.current.db, `households/${clean}`);
      const snap = await getDoc(ref);
      incrementQuota('read', 1);
      setIsBusy(false);
      if (!snap.exists()) return setAuthError('Code introuvable. Vérifiez-le avec votre partenaire.');
      pendingProfile.current = { name, color };
      saveStoredHouseholdId(clean);
      setHouseholdId(clean);
      const members: string[] = snap.data()?.members || [];
      if (userUid && !members.includes(userUid)) {
        await setDoc(ref, { members: [...members, userUid] }, { merge: true });
        incrementQuota('write', 1);
      }
      if (userUid) startCloud(userUid, clean);
    } catch {
      setIsBusy(false);
      setAuthError('Code introuvable ou accès refusé.');
    }
  };

  const updateHouseholdSettings = async (patch: Partial<HouseholdSettings>, message?: string) => {
    setHouseholdSettings((prev) => {
      const next = { ...prev, ...patch };
      if (!isCloud) localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
    if (isCloud && fbRef.current && householdId) {
      const dotted: Record<string, unknown> = {};
      Object.entries(patch).forEach(([k, v]) => (dotted[`settings.${k}`] = v));
      await updateDoc(doc(fbRef.current.db, `households/${householdId}`), dotted).catch((e: unknown) => console.error(e));
      incrementQuota('write', 1);
    }
    if (message) showToast(message);
  };

  /* ------------------------------ derived ------------------------------ */
  const calc = useMemo(() => calcMonth(budget.categories, budget.months[currentMonth], currentMonth), [budget, currentMonth]);
  const activeCategories = useMemo(() => budget.categories.filter((c) => !c.archived), [budget.categories]);
  const month: MonthDoc | undefined = budget.months[currentMonth];

  const allMembers = useMemo<MemberData[]>(
    () => [
      { ...budget, uid: userUid || 'local-me', name: profile.name || 'Moi', color: profile.color, me: true },
      ...Object.values(store.partners),
    ],
    [budget, userUid, profile.name, profile.color, store.partners]
  );

  const lineInSheet = lineSheet.lineId ? month?.lines.find((l) => l.id === lineSheet.lineId) || null : null;
  const itemInSheet = lineInSheet?.itemId ? budget.items.find((i) => i.id === lineInSheet.itemId) || null : null;

  // Scroll position is kept per tab.
  const changeTab = (tab: NavTab) => {
    scrollByTab.current[activeTab] = window.scrollY;
    setActivePlusModule(null);
    setActiveTab(tab);
    requestAnimationFrame(() => window.scrollTo(0, scrollByTab.current[tab] || 0));
  };

  /* ------------------------ month review & onboarding ------------------------ */
  const needsSetup = store.loaded && authStatus === 'ready' && !profile.budgetSetupDone && !activeCategories.length;
  const needsName = store.loaded && authStatus === 'ready' && !profile.name?.trim();

  useEffect(() => {
    if (!store.loaded || authStatus !== 'ready' || needsSetup || needsName || review || setup.open) return;
    if (!activeCategories.length || month?.planCreated) return;
    if (currentMonth < currentMonthKey() || reviewSkipped.includes(currentMonth)) return;
    setReview(buildMonthReview(budget, currentMonth, { rollover }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.loaded, authStatus, currentMonth, month?.planCreated, activeCategories.length, needsSetup, needsName]);

  const openReview = () => setReview(buildMonthReview(store.budgetRef.current, currentMonth, { rollover }));

  const skipReview = () => {
    const next = [...new Set([...reviewSkipped, currentMonth])].slice(-24);
    setReviewSkipped(next);
    localStorage.setItem(REVIEW_SKIPPED_KEY, JSON.stringify(next));
    setReview(null);
  };

  const createFromReview = (r: MonthReview) => {
    run((b) => ({ ...b, months: { ...b.months, [r.monthKey]: applyMonthReview(r, b.months[r.monthKey]) } }), `Plan de ${monthName(r.monthKey).toLowerCase()} créé.`, true);
    setReview(null);
    triggerHaptic('success');
  };

  const startMonth = () =>
    run((b) => ({ ...b, months: { ...b.months, [currentMonth]: generateMonthDoc(b, currentMonth, { rollover }) } }), `Plan de ${monthName(currentMonth).toLowerCase()} créé.`, true);

  const finishSetup = () => store.updateProfile({ budgetSetupDone: true });

  const setupPick = (rubrics: PickedRubric[]): string | null => {
    const err = run((b) => {
      let next = b;
      for (const r of rubrics) {
        const res = createCategory(next, { name: r.name, icon: r.icon, color: r.color, kind: r.kind, budgetMode: 'envelope', envelopeAmount: r.amount }, currentMonth);
        if (!res.ok) {
          if (/déjà/.test(res.error)) continue; // already there: keep the user's rubric
          return res;
        }
        next = res.budget;
      }
      return ensurePlanned(next, currentMonth, rollover);
    }, 'Vos rubriques sont prêtes.', true);
    if (!err) {
      finishSetup();
      setSetup({ open: false });
    }
    return err;
  };

  const setupImport = (rows: ImportRow[]): string | null => {
    const err = run((b) => applyImport(ensurePlanned(b, currentMonth, rollover), rows, currentMonth), `${rows.length} ligne(s) importée(s).`, true);
    if (!err) {
      finishSetup();
      setSetup({ open: false });
    }
    return err;
  };

  const copySources: CopySource[] = useMemo(() => {
    const own = Object.keys(budget.months)
      .filter((k) => k !== currentMonth && budget.months[k].planCreated && budget.months[k].lines.length)
      .sort()
      .reverse()
      .slice(0, 6)
      .map((k) => ({ id: `me|${k}`, label: `Mon plan de ${monthLabel(k)}` }));
    const partners = Object.values(store.partners).flatMap((p) =>
      Object.keys(p.months)
        .filter((k) => p.months[k].lines?.length)
        .sort()
        .reverse()
        .slice(0, 2)
        .map((k) => ({ id: `${p.uid}|${k}`, label: `Plan de ${p.name} — ${monthLabel(k)}` }))
    );
    return [...own, ...partners];
  }, [budget.months, currentMonth, store.partners]);

  const setupCopy = (sourceId: string): string | null => {
    const [who, key] = sourceId.split('|');
    const err = run((b) => {
      if (who === 'me') return { ...b, months: { ...b.months, [currentMonth]: copyMonthPlan(b.months[key], b.months[currentMonth]) } };
      const partner = store.partners[who];
      const src = partner?.months[key];
      if (!partner || !src) return { ok: false, error: 'Mois introuvable.' };
      let next = ensurePlanned(b, currentMonth, rollover);
      const ids = new Map<string, string>();
      for (const c of sortCategories(partner.categories.filter((c) => !c.archived))) {
        const env = src.envelopes && c.id in src.envelopes;
        const r = ensureCategory(next, { name: c.name, icon: c.icon, color: c.color, kind: c.kind, budgetMode: env ? 'envelope' : 'lines', envelopeAmount: env ? src.envelopes![c.id] : null }, currentMonth);
        if (!r.ok) return r;
        next = r.budget;
        ids.set(c.id, r.id!);
      }
      for (const l of src.lines.filter((x) => !x.archived && x.origin !== 'debt')) {
        const item = l.itemId ? partner.items.find((i) => i.id === l.itemId) : undefined;
        const r = addLine(next, currentMonth, {
          categoryId: ids.get(l.categoryId)!,
          label: l.label,
          amount: l.amount,
          recurrence: item && item.recurrence.kind !== 'once' ? { ...item.recurrence, startMonth: currentMonth } : { kind: 'once', month: currentMonth },
        });
        if (!r.ok) return r;
        next = r.budget;
      }
      return next;
    }, 'Plan copié.', true);
    if (!err) {
      finishSetup();
      setSetup({ open: false });
    }
    return err;
  };

  /* ------------------------------ entries ------------------------------ */
  const saveQuickAdd = (d: QuickAddDraft) => {
    const monthKey = budgetMonthOf(d.date);
    if (d.saveMemory) {
      setRecipientMemories((prev) => [
        ...prev.filter((m) => m.name.toLowerCase() !== d.saveMemory!.name.toLowerCase()),
        { id: generateId(), name: d.saveMemory!.name, categoryId: d.saveMemory!.categoryId },
      ]);
    }
    run(
      (b) => {
        let next = b;
        let categoryId = d.categoryId;
        let lineId = d.lineId;
        if (d.createOneoff) {
          next = ensurePlanned(next, monthKey, rollover);
          if (!categoryId) {
            const r = ensureCategory(next, { ...OTHER_RUBRIC_DEFAULT, kind: d.type === 'save' ? 'save' : 'out' }, monthKey);
            if (!r.ok) return r;
            next = r.budget;
            categoryId = r.id!;
          }
          const r = addLine(next, monthKey, { categoryId, label: d.label, amount: d.amt, recurrence: { kind: 'once', month: monthKey } });
          if (!r.ok) return r;
          next = r.budget;
          lineId = r.id!;
        }
        if (lineId && !next.months[monthKey]?.lines.some((l) => l.id === lineId)) lineId = null;
        const entry: Entry = {
          id: generateId(),
          d: d.date,
          ts: Date.now(),
          t: d.type,
          amt: d.amt,
          categoryId,
          lineId,
          label: d.label,
          w: d.walletId,
          src: d.src || 'manual',
        };
        if (d.ref) entry.ref = d.ref;
        if (d.who) entry.who = d.who;
        next = addEntry(next, monthKey, entry);
        if (d.fee && d.fee > 0) {
          next = addEntry(next, monthKey, {
            id: generateId(),
            d: d.date,
            ts: Date.now() + 1,
            t: 'out',
            amt: d.fee,
            categoryId: null,
            lineId: null,
            label: `Frais ${d.who || d.label}`.slice(0, 40),
            w: d.walletId,
            src: d.src,
          });
        }
        return next;
      },
      `${d.type === 'in' ? 'Revenu' : d.type === 'save' ? 'Épargne' : 'Dépense'} ajoutée : ${fmt(d.amt)} F · ${d.label}${
        monthKey !== currentMonth ? ` (${monthLabel(monthKey)})` : ''
      }`,
      true
    );
  };

  /* ------------------------------ lines ------------------------------ */
  const openNewLine = (categoryId?: string, kindFilter?: CategoryKind) => {
    setCreatedCategoryId(null);
    setLineSheet({ open: true, defaultCategoryId: categoryId, kindFilter });
  };

  const addIncome = () => {
    const income = sortCategories(activeCategories.filter((c) => c.kind === 'in'))[0];
    if (income) return openNewLine(income.id, 'in');
    const err = run((b) => ensureCategory(b, { ...INCOME_RUBRIC_DEFAULT, kind: 'in' }, currentMonth));
    if (err) return showToast(err);
    const created = store.budgetRef.current.categories.find((c) => c.kind === 'in' && !c.archived);
    openNewLine(created?.id, 'in');
  };

  const saveLine = (v: LineValues): string | null => {
    if (!lineInSheet) {
      const err = run(
        (b) => addLine(ensurePlanned(b, currentMonth, rollover), currentMonth, v),
        `Ligne « ${v.label} » ajoutée.`,
        true
      );
      if (!err) {
        setLineSheet({ open: false });
        if (v.categoryId) setOpenRubric(v.categoryId);
      }
      return err;
    }
    const patch: LinePatch = {};
    if (v.label !== lineInSheet.label) patch.label = v.label;
    if (v.amount !== lineInSheet.amount) patch.amount = v.amount;
    if (v.categoryId !== lineInSheet.categoryId) patch.categoryId = v.categoryId;
    if ((v.note || '') !== (lineInSheet.note || '')) patch.note = v.note;
    if (!!v.remind !== !!lineInSheet.remind) patch.remind = v.remind;
    const origRec = itemInSheet?.recurrence || { kind: 'once' as const, month: currentMonth };
    const recChanged =
      recurrenceChoice(v.recurrence) !== recurrenceChoice(origRec) || (!sameRecurrence(v.recurrence, origRec) && !!itemInSheet);
    if (recChanged) patch.recurrence = v.recurrence;
    if (!Object.keys(patch).length) {
      setLineSheet({ open: false });
      return null;
    }
    if (editNeedsScope(store.budgetRef.current, currentMonth, lineInSheet.id, patch)) {
      setAsk({ kind: 'editScope', lineId: lineInSheet.id, patch });
      return null;
    }
    const err = run((b) => editLine(b, currentMonth, lineInSheet.id, patch, 'month'), 'Ligne mise à jour.', true);
    if (!err) setLineSheet({ open: false });
    return err;
  };

  const confirmEdit = (scope: 'month' | 'following') => {
    if (ask?.kind !== 'editScope') return;
    const err = run(
      (b) => editLine(b, currentMonth, ask.lineId, ask.patch, scope),
      scope === 'month' ? 'Ligne modifiée pour ce mois seulement.' : 'Ligne modifiée pour ce mois et les suivants.',
      true
    );
    setAsk(null);
    if (err) showToast(err);
    else setLineSheet({ open: false });
  };

  const requestDeleteLine = (line: MonthLine) => {
    const item = line.itemId ? budget.items.find((i) => i.id === line.itemId) : undefined;
    if (item && item.active && !item.archived && item.recurrence.kind !== 'once') {
      setAsk({ kind: 'deleteScope', line });
      return;
    }
    doDeleteLine(line, 'month');
  };

  const doDeleteLine = (line: MonthLine, scope: 'month' | 'never') => {
    const err = run(
      (b) => deleteLine(b, currentMonth, line.id, scope),
      (r) =>
        scope === 'never'
          ? `« ${line.label} » ne sera plus reporté${r.archived ? ' (historique conservé)' : ''}.`
          : `« ${line.label} » retiré de ce mois${r.archived ? ' (ses opérations restent)' : ''}.`,
      true
    );
    setAsk(null);
    if (err) showToast(err);
    else setLineSheet({ open: false });
  };

  const payLine = (line: MonthLine) => {
    const paid = calc.byLine[line.id] || 0;
    const rest = Math.max(0, (line.amount || 0) - paid);
    setLineSheet({ open: false });
    setQuickAdd({ open: true, type: 'out', prefill: { lineId: line.id, amount: rest || undefined } });
  };

  /* ------------------------------ rubrics ------------------------------ */
  const saveRubric = (draft: RubricDraft): string | null => {
    if (rubricEditor.categoryId) {
      const err = run(
        (b) => updateCategory(b, rubricEditor.categoryId!, { name: draft.name, icon: draft.icon, color: draft.color, kind: draft.kind }),
        'Rubrique mise à jour.',
        true
      );
      if (!err) setRubricEditor({ open: false, kind: 'out' });
      return err;
    }
    let newId: string | undefined;
    const err = run((b) => {
      const r = createCategory(ensurePlanned(b, currentMonth, rollover), draft, currentMonth);
      if (r.ok) newId = r.id;
      return r;
    }, `Rubrique « ${draft.name} » créée.`, true);
    if (err) return err;
    if (rubricEditor.fromLine && newId) setCreatedCategoryId(newId);
    else if (newId) setOpenRubric(newId);
    setRubricEditor({ open: false, kind: 'out' });
    return null;
  };

  const rubricActions = (c: Category): SheetAction[] => {
    const close = () => setRubricMenu(null);
    const list: SheetAction[] = [
      { label: 'Renommer', onClick: () => (close(), setRubricEditor({ open: true, categoryId: c.id, kind: c.kind })) },
      { label: 'Changer l’icône et la couleur', onClick: () => (close(), setRubricEditor({ open: true, categoryId: c.id, kind: c.kind })) },
      { label: 'Ajouter une ligne', onClick: () => (close(), openNewLine(c.id)) },
    ];
    if (c.kind !== 'in') {
      list.push(
        c.budgetMode === 'lines'
          ? {
              label: 'Passer en enveloppe',
              hint: 'Un seul montant pour la rubrique, sans lignes',
              onClick: () => {
                close();
                run((b) => setBudgetMode(ensurePlanned(b, currentMonth, rollover), c.id, 'envelope', currentMonth), `« ${c.name} » est une enveloppe.`, true);
              },
            }
          : {
              label: 'Passer en lignes',
              hint: 'L’enveloppe devient la première ligne',
              onClick: () => {
                close();
                run((b) => setBudgetMode(ensurePlanned(b, currentMonth, rollover), c.id, 'lines', currentMonth), `« ${c.name} » est détaillée par lignes.`, true);
              },
            }
      );
    }
    list.push(
      {
        label: 'Archiver',
        hint: 'Cachée des nouveaux mois, historique conservé',
        onClick: () => {
          close();
          run((b) => archiveCategory(b, c.id), `« ${c.name} » archivée. Retrouvez-la dans Réglages.`, true);
        },
      },
      {
        label: 'Supprimer',
        danger: true,
        hint: 'Archivée à la place si elle a des opérations',
        onClick: () => {
          close();
          run(
            (b) => deleteCategory(b, c.id),
            (r) => (r.archived ? `« ${c.name} » a des opérations : elle est archivée (Réglages).` : `« ${c.name} » supprimée.`),
            true
          );
        },
      }
    );
    return list;
  };

  /* ------------------------------ debts & commitments ------------------------------ */
  const debtsCat = debtsCategory(budget.categories);

  const payDebt = (d: Debt, amount: number) => {
    const payId = generateId();
    run(
      (b) => {
        if (d.direction !== 'i_owe') return recordDebtPayment(b, d.id, { id: payId, date: todayStr(), amt: amount });
        const line = b.months[currentMonth]?.lines.find((l) => l.debtId === d.id && !l.archived);
        const cat = debtsCategory(b.categories);
        const entry: Entry = {
          id: payId,
          d: currentMonth === currentMonthKey() ? todayStr() : `${currentMonth}-01`,
          ts: Date.now(),
          t: 'out',
          amt: amount,
          categoryId: line?.categoryId || cat?.id || null,
          lineId: line?.id || null,
          label: d.person,
          w: wallets[0]?.id || '',
          debtId: d.id,
          who: d.person,
        };
        const next = addEntry(b, currentMonth, entry);
        return line ? next : recordDebtPayment(next, d.id, { id: payId, date: entry.d, amt: amount });
      },
      `Paiement de ${fmt(amount)} F noté pour ${d.person}.`,
      true
    );
  };

  const updateCommitments = (list: Commitment[]) =>
    run((b) => {
      let next: MemberBudget = { ...b, commitments: list };
      for (const c of list) {
        if (c.itemId || !c.categoryId) continue;
        next = ensurePlanned(next, currentMonth, rollover);
        const r = addLine(next, currentMonth, {
          categoryId: c.categoryId,
          label: c.recipient,
          amount: c.amount,
          recurrence: { kind: 'monthly', startMonth: currentMonth },
          note: c.label,
        });
        if (!r.ok) return r;
        next = r.budget;
        const itemId = next.months[currentMonth].lines.find((l) => l.id === r.id)?.itemId;
        next = { ...next, commitments: next.commitments.map((x) => (x.id === c.id ? { ...x, itemId } : x)) };
      }
      return next;
    }, 'Engagements mis à jour.');

  const recordCommitment = (c: Commitment, walletId: string, ref?: string) => {
    const line = month?.lines.find((l) => l.itemId && l.itemId === c.itemId && !l.archived);
    saveQuickAdd({
      type: 'out',
      amt: c.amount,
      label: line?.label || c.recipient,
      date: currentMonth === currentMonthKey() ? todayStr() : `${currentMonth}-01`,
      categoryId: line?.categoryId || c.categoryId || null,
      lineId: line?.id || null,
      walletId,
      ref,
      who: c.recipient,
    });
  };

  /* ------------------------------ transfers ------------------------------ */
  const internalTransfer = ({ fromWalletId, toWalletId, amount, fee, date }: { fromWalletId: string; toWalletId: string; amount: number; fee: number; date: string }) => {
    const from = wallets.find((w) => w.id === fromWalletId)?.name || 'compte';
    const to = wallets.find((w) => w.id === toWalletId)?.name || 'compte';
    const monthKey = budgetMonthOf(date);
    run(
      (b) => {
        let next = addEntry(b, monthKey, {
          id: generateId(),
          d: date,
          ts: Date.now(),
          t: 'transfer',
          amt: amount,
          categoryId: null,
          lineId: null,
          label: `Virement ${from} → ${to}`.slice(0, 40),
          w: fromWalletId,
          toW: toWalletId,
        });
        if (fee > 0) {
          next = addEntry(next, monthKey, {
            id: generateId(),
            d: date,
            ts: Date.now() + 1,
            t: 'out',
            amt: fee,
            categoryId: null,
            lineId: null,
            label: `Frais de virement ${from}`.slice(0, 40),
            w: fromWalletId,
          });
        }
        return next;
      },
      `Virement de ${fmt(amount)} F enregistré (${from} → ${to}). Il ne compte pas comme une dépense.`,
      true
    );
  };

  /* ------------------------------ alerts ------------------------------ */
  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    calc.expense.forEach((cc) => {
      if (cc.kind !== 'out' || cc.category.archived || !cc.planned || cc.actual < cc.planned) return;
      list.push({
        id: `alert-rubric-${cc.id}`,
        title: `${cc.category.name} : montant prévu atteint`,
        message: `Dépensé ${fmt(cc.actual)} F sur ${fmt(cc.planned)} F prévus ce mois-ci.`,
        date: todayStr(),
        type: 'warning',
        read: false,
      });
    });
    calc.expense.forEach((cc) =>
      cc.lines
        .filter((l) => l.line.remind && l.line.amount === null)
        .forEach((l) =>
          list.push({
            id: `alert-remind-${l.line.id}`,
            title: `Montant à fixer : ${l.line.label}`,
            message: `Vous avez demandé un rappel pour fixer le montant de « ${l.line.label} » (${cc.category.name}).`,
            date: todayStr(),
            type: 'info',
            read: false,
          })
        )
    );
    budget.commitments
      .filter((c) => c.active)
      .forEach((c) =>
        list.push({
          id: `alert-com-${c.id}`,
          title: `Engagement : ${c.recipient}`,
          message: `${c.label} (${fmt(c.amount)} F) prévu le ${c.dayOfMonth} du mois.`,
          date: todayStr(),
          type: 'info',
          read: false,
        })
      );
    return list;
  }, [calc, budget.commitments]);

  const openPlusModule = (mod: PlusModule) => {
    triggerHaptic('light');
    if (mod === 'portefeuilles') setIsWalletsOpen(true);
    else if (mod === 'reglages') setIsSettingsOpen(true);
    else if (mod === 'dettes') setIsDebtsOpen(true);
    else if (mod === 'engagements') setIsCommitmentsOpen(true);
    else if (mod === 'evolution') setActivePlusModule(mod);
    else showToast('Ce module arrive dans la prochaine étape.');
  };

  /* ------------------------------ render ------------------------------ */
  if (authStatus === 'signin' || authStatus === 'household') {
    return (
      <OnboardingFlow
        authStep={authStatus === 'signin' ? 'auth' : 'household'}
        authMode={authMode}
        busy={isBusy}
        error={authError}
        userEmail={userEmail}
        createdCode={createdHouseholdCode}
        onSetAuthMode={setAuthMode}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onResetPassword={async (email) => {
          if (fbRef.current) await sendPasswordResetEmail(fbRef.current.auth, email);
        }}
        onContinueOffline={loadLocalOnly}
        onCreateHousehold={handleCreateHousehold}
        onJoinHousehold={handleJoinHousehold}
        onSignOut={handleSignOut}
      />
    );
  }

  if (authStatus === 'loading' || !store.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-xs text-[var(--color-text-muted)]">
        Chargement de votre budget…
      </div>
    );
  }

  const setupFlow = (needsSetup || needsName || setup.open) && (
    <BudgetSetupFlow
      key={needsSetup ? 'first' : setup.step || 'name'}
      needName={needsName}
      nameOnly={needsName && !needsSetup && !setup.open}
      initialStep={setup.open ? setup.step : undefined}
      monthKey={currentMonth}
      existingRubrics={budget.categories.map((c) => c.name)}
      copySources={copySources}
      onSaveName={(name) => store.updateProfile({ name })}
      onZero={() => {
        finishSetup();
        setSetup({ open: false });
      }}
      onPick={setupPick}
      onCopy={setupCopy}
      onImport={setupImport}
      onClose={setup.open ? () => setSetup({ open: false }) : undefined}
    />
  );

  const envelopeCat = envelopeFor ? budget.categories.find((c) => c.id === envelopeFor) || null : null;
  const envelopeCalc = envelopeFor ? calc.byCategory[envelopeFor] : undefined;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col relative bg-[var(--color-surface)] shadow-lg">
        <OfflineIndicator />
        <TopAppBar
          userName={profile.name}
          currentMonth={currentMonth}
          syncStatus={store.syncStatus}
          unreadAlertsCount={alerts.length}
          onMonthChange={(m) => {
            setCurrentMonth(m);
            setOpenRubric(null);
          }}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 px-3.5 pt-2">
          {activeTab === 'accueil' && (
            <AccueilScreen
              monthKey={currentMonth}
              calc={calc}
              categories={budget.categories}
              myName={profile.name}
              showTemplateStrip={!!month?.fromTemplate && !profile.templateStripDismissed}
              previousPlanned={previousPlannedMonth(budget.months, currentMonth)}
              openRubric={openRubric}
              onToggleRubric={setOpenRubric}
              onDismissStrip={() => store.updateProfile({ templateStripDismissed: true })}
              onAddIncome={addIncome}
              onAddRubric={() => setRubricEditor({ open: true, kind: 'out' })}
              onAddLine={(id) => openNewLine(id)}
              onEditLine={(l) => {
                setCreatedCategoryId(null);
                setLineSheet({ open: true, lineId: l.id });
              }}
              onPayLine={payLine}
              onRubricMenu={setRubricMenu}
              onEditEnvelope={(c) => setEnvelopeFor(c.id)}
              onReorderCategories={(ids) => run((b) => reorderCategories(b, ids))}
              onReorderLines={(ids) => run((b) => reorderLines(b, currentMonth, ids))}
              onStartMonth={startMonth}
              onPrepareMonth={openReview}
              onChooseRubrics={() => setSetup({ open: true, step: 'pick' })}
              onImport={() => setSetup({ open: true, step: 'import' })}
            />
          )}

          {activeTab === 'journal' && (
            <JournalScreen
              currentMonth={currentMonth}
              calc={calc}
              categories={budget.categories}
              onUpdateEntry={(e) => run((b) => updateEntry(b, currentMonth, budgetMonthOf(e.d), e), 'Opération mise à jour.', true)}
              onDeleteEntry={(id) => run((b) => deleteEntry(b, currentMonth, id), 'Opération supprimée.', true)}
              onOpenQuickAdd={() => setQuickAdd({ open: true, type: 'out', prefill: null })}
            />
          )}

          {activeTab === 'famille' && (
            <FamilleScreen
              currentMonth={currentMonth}
              isCloudMode={isCloud}
              householdId={householdId}
              members={allMembers}
              merges={householdSettings.rubricMerges || {}}
              dismissedMerges={householdSettings.rubricMergesDismissed || []}
              onAcceptMerge={(s: MergeSuggestion) =>
                updateHouseholdSettings(
                  { rubricMerges: addMerge(householdSettings.rubricMerges || {}, s.keep, s.merge) },
                  `« ${s.mergeName} » est regroupée avec « ${s.keepName} » dans la vue Famille.`
                )
              }
              onDismissMerge={(id) =>
                updateHouseholdSettings({ rubricMergesDismissed: [...(householdSettings.rubricMergesDismissed || []), id] })
              }
              onRemoveMerge={(k) =>
                updateHouseholdSettings({ rubricMerges: removeMerge(householdSettings.rubricMerges || {}, k) }, 'Rubriques séparées dans la vue Famille.')
              }
              onShowSetup={() => setAuthStatus('signin')}
            />
          )}

          {activeTab === 'plus' &&
            (activePlusModule === 'evolution' ? (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setActivePlusModule(null)} className="self-start text-xs font-bold text-[var(--color-primary)] py-1">
                  ← Retour aux outils
                </button>
                <EvolutionScreen isCloudMode={isCloud} members={allMembers} currentMonth={currentMonth} merges={householdSettings.rubricMerges || {}} />
              </div>
            ) : (
              <PlusHubScreen
                debts={budget.debts}
                commitments={budget.commitments}
                provisions={[]}
                goals={[]}
                tontines={[]}
                wallets={wallets}
                onOpenModule={openPlusModule}
              />
            ))}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={changeTab}
          onOpenQuickAdd={() => setQuickAdd({ open: true, type: 'out', prefill: null })}
        />

        <QuickAddSheet
          isOpen={quickAdd.open}
          currentMonth={currentMonth}
          calc={calc}
          categories={budget.categories}
          wallets={wallets}
          recipientMemories={recipientMemories}
          initialType={quickAdd.type}
          prefill={quickAdd.prefill}
          onClose={() => setQuickAdd((q) => ({ ...q, open: false, prefill: null }))}
          onSave={saveQuickAdd}
        />

        <LineSheet
          open={lineSheet.open}
          monthKey={currentMonth}
          categories={budget.categories}
          line={lineInSheet}
          item={itemInSheet}
          paid={lineInSheet ? calc.byLine[lineInSheet.id] || 0 : 0}
          defaultCategoryId={lineSheet.defaultCategoryId}
          kindFilter={lineSheet.kindFilter}
          createdCategoryId={createdCategoryId}
          onSave={saveLine}
          onPayNow={payLine}
          onDelete={requestDeleteLine}
          onNewRubric={() => setRubricEditor({ open: true, kind: lineSheet.kindFilter || 'out', fromLine: true })}
          onClose={() => setLineSheet({ open: false })}
        />

        <RubricEditorSheet
          open={rubricEditor.open}
          category={rubricEditor.categoryId ? budget.categories.find((c) => c.id === rubricEditor.categoryId) : null}
          categories={budget.categories}
          defaultKind={rubricEditor.kind}
          onSubmit={saveRubric}
          onClose={() => setRubricEditor({ open: false, kind: 'out' })}
        />

        <ActionSheet
          open={!!rubricMenu}
          title={rubricMenu?.name || ''}
          actions={rubricMenu ? rubricActions(rubricMenu) : []}
          onClose={() => setRubricMenu(null)}
        />

        <ActionSheet
          open={ask?.kind === 'editScope'}
          title="Appliquer la modification"
          message="Cette ligne revient chaque mois."
          onClose={() => setAsk(null)}
          z={70}
          actions={[
            { label: 'Seulement ce mois', hint: 'Les autres mois ne changent pas', onClick: () => confirmEdit('month') },
            { label: 'Ce mois et les suivants', hint: 'Met aussi à jour le modèle de la ligne', onClick: () => confirmEdit('following') },
          ]}
        />

        <ActionSheet
          open={ask?.kind === 'deleteScope'}
          title={ask?.kind === 'deleteScope' ? `Supprimer « ${ask.line.label} »` : ''}
          message="Cette ligne revient chaque mois."
          onClose={() => setAsk(null)}
          z={70}
          actions={
            ask?.kind === 'deleteScope'
              ? [
                  { label: 'Seulement ce mois', hint: 'Elle reviendra le mois prochain', onClick: () => doDeleteLine(ask.line, 'month') },
                  {
                    label: 'Ne plus jamais reporter',
                    hint: 'L’historique des mois passés est conservé',
                    danger: true,
                    onClick: () => doDeleteLine(ask.line, 'never'),
                  },
                ]
              : []
          }
        />

        <EnvelopeSheet
          open={!!envelopeFor}
          category={envelopeCat}
          amount={envelopeCalc?.envelope ?? null}
          spent={envelopeCalc?.actual || 0}
          onSave={(amount, scope) => {
            const err = run((b) => setEnvelopeAmount(b, envelopeFor!, currentMonth, amount, scope), 'Enveloppe mise à jour.', true);
            if (!err) setEnvelopeFor(null);
            return err;
          }}
          onClose={() => setEnvelopeFor(null)}
        />

        <MonthReviewSheet open={!!review} review={review} categories={budget.categories} onCreate={createFromReview} onSkip={skipReview} />

        <DebtsSheet
          open={isDebtsOpen}
          debts={budget.debts}
          debtsRubricName={debtsCat?.name}
          onAdd={(d) =>
            run(
              (b) => addDebt(b, d, currentMonth),
              d.direction === 'i_owe' ? `Dette ajoutée : une ligne « ${d.person} » est dans la rubrique des dettes.` : 'Dette ajoutée au carnet.',
              true
            )
          }
          onPay={payDebt}
          onDelete={(d) => run((b) => removeDebt(b, d.id), `Dette « ${d.person} » supprimée.`, true)}
          onClose={() => setIsDebtsOpen(false)}
        />

        <CommitmentsSheet
          isOpen={isCommitmentsOpen}
          commitments={budget.commitments}
          entries={Object.values(budget.months).flatMap((m) => m.entries)}
          wallets={wallets}
          categories={budget.categories}
          currentMonth={currentMonth}
          onClose={() => setIsCommitmentsOpen(false)}
          onUpdateCommitments={updateCommitments}
          onRecordSent={recordCommitment}
        />

        <WalletsSheet
          isOpen={isWalletsOpen}
          wallets={wallets}
          entries={calc.month.entries}
          onClose={() => setIsWalletsOpen(false)}
          onUpdateWallets={setWallets}
          onInternalTransfer={internalTransfer}
        />

        <AlertsInboxSheet
          isOpen={isAlertsOpen}
          alerts={alerts}
          onClose={() => setIsAlertsOpen(false)}
          onSelectAlert={(al) => {
            setIsAlertsOpen(false);
            if (al.id.startsWith('alert-rubric-')) {
              setActiveTab('accueil');
              setOpenRubric(al.id.replace('alert-rubric-', ''));
            } else if (al.id.startsWith('alert-remind-')) {
              setActiveTab('accueil');
              setLineSheet({ open: true, lineId: al.id.replace('alert-remind-', '') });
            } else if (al.id.startsWith('alert-com-')) setIsCommitmentsOpen(true);
          }}
          onClearAlerts={() => setIsAlertsOpen(false)}
        />

        <SettingsSheet
          isOpen={isSettingsOpen}
          userName={profile.name}
          userEmail={userEmail}
          householdId={householdId}
          budget={budget}
          rollover={rollover}
          onToggleRollover={(v) => store.updateProfile({ envelopeRollover: v })}
          onRestoreCategory={(id) => run((b) => restoreCategory(b, id), 'Rubrique restaurée.', true)}
          onMoveEntries={(from, to) => {
            const err = run((b) => moveCategoryEntries(b, from, to), 'Opérations déplacées.', true);
            if (err) showToast(err);
          }}
          onApplyTemplate={(id) => {
            const t = TEMPLATES.find((x) => x.id === id);
            if (!t) return;
            setIsSettingsOpen(false);
            const err = run((b) => applyTemplate(ensurePlanned(b, currentMonth, rollover), t, currentMonth), `Modèle appliqué à ${monthLabel(currentMonth)}.`, true);
            if (err) showToast(err);
            else {
              finishSetup();
              setActiveTab('accueil');
            }
          }}
          onOpenSetup={(step) => {
            setIsSettingsOpen(false);
            setSetup({ open: true, step });
          }}
          onPrepareMonth={() => {
            setIsSettingsOpen(false);
            setActiveTab('accueil');
            openReview();
          }}
          householdSettings={householdSettings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateName={(name) => {
            store.updateProfile({ name });
            showToast('Prénom mis à jour.');
          }}
          onUpdateSettings={(s) => updateHouseholdSettings(s, 'Paramètres mis à jour.')}
          onSignOut={handleSignOut}
          onLeaveHousehold={handleLeaveHousehold}
          onDeleteAccount={handleDeleteAccount}
        />

        {setupFlow}

        {toast && (
          <div
            role="status"
            className="fixed left-4 right-4 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] max-w-[448px] mx-auto bg-[var(--color-text)] text-[var(--color-surface)] rounded-2xl pl-4 pr-2 py-2 flex justify-between items-center gap-3 text-xs shadow-xl z-[45]"
          >
            <span className="font-medium leading-snug">{toast.msg}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  store.undo(toast.undo!.before, toast.undo!.paths);
                  setToast(null);
                  showToast('Action annulée.');
                }}
                className="min-h-10 px-3 rounded-xl font-heading font-bold text-[var(--color-accent)] shrink-0"
              >
                Annuler
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
