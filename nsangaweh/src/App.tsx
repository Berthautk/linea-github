/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccueilScreen } from './components/AccueilScreen';
import { AlertsInboxSheet } from './components/AlertsInboxSheet';
import { BottomNav, NavTab } from './components/BottomNav';
import { EvolutionScreen } from './components/EvolutionScreen';
import { FamilleScreen } from './components/FamilleScreen';
import { JournalScreen } from './components/JournalScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PlanEditorSheet } from './components/PlanEditorSheet';
import { PlusHubScreen, PlusModule } from './components/PlusHubScreen';
import { QuickAddSheet } from './components/QuickAddSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { TopAppBar } from './components/TopAppBar';
import { WalletsSheet } from './components/WalletsSheet';
import {
  addMonth,
  calcFamily,
  calcMonth,
  computeForecast,
  currentMonthKey,
  DEFAULT_WALLETS,
  fmt,
  generateHouseholdCode,
  generateId,
  getEntryLabel,
  monthLabel,
  SEED_DATA,
  todayStr,
} from './lib/budget-math';
import {
  collection,
  createUserWithEmailAndPassword,
  deleteDoc,
  deleteUser,
  doc,
  fbSignOut,
  getAuthErrorMessage,
  getDoc,
  getDocs,
  getQuotaTracker,
  getStoredConfig,
  getStoredHouseholdId,
  getStoredLocalLedger,
  incrementQuota,
  initFirebase,
  limit,
  onAuthStateChanged,
  onSnapshot,
  query,
  saveStoredHouseholdId,
  saveStoredLocalLedger,
  sendPasswordResetEmail,
  setDoc,
  signInWithEmailAndPassword,
} from './lib/firebase';
import { triggerHaptic } from './lib/haptics';
import {
  AlertItem,
  Commitment,
  Debt,
  Entry,
  EntrySource,
  EntryType,
  HouseholdSettings,
  MemberData,
  MonthData,
  PlanLine,
  Provision,
  RecipientMemory,
  SharedGoal,
  Tontine,
  Wallet,
} from './lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');
  const [currentMonth, setCurrentMonth] = useState<string>(() => '2026-09');

  // Modals & sub-views
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<EntryType>('out');
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalletsOpen, setIsWalletsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activePlusModule, setActivePlusModule] = useState<PlusModule | null>(null);

  // App & sync states
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'none' | 'signin' | 'household' | 'ready'
  >('loading');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [syncStatus, setSyncStatus] = useState<'cloud' | 'saving' | 'local' | 'load'>('load');
  const [authError, setAuthError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [createdHouseholdCode, setCreatedHouseholdCode] = useState<string | undefined>(undefined);

  // User & household state
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [householdId, setHouseholdId] = useState<string>(() => getStoredHouseholdId());
  const [myName, setMyName] = useState<string>('');
  const [myColor, setMyColor] = useState<string>('#0B6E4F');
  const [householdSettings, setHouseholdSettings] = useState<HouseholdSettings>({
    monthStartDay: 1,
    approvalThreshold: 50000,
    approvalEnabled: true,
    exemptRubrics: ['Revenus'],
    plan: 'free',
  });

  // Ledgers & Subcollections
  const [myMonths, setMyMonths] = useState<Record<string, MonthData>>({});
  const [otherMembers, setOtherMembers] = useState<
    Record<string, { name: string; color?: string; months: Record<string, MonthData> }>
  >({});
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [goals, setGoals] = useState<SharedGoal[]>([]);
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [recipientMemories, setRecipientMemories] = useState<RecipientMemory[]>([]);

  // Toast with undo
  const [toastInfo, setToastInfo] = useState<{
    msg: string;
    undoData?: { monthKey: string; entryId: string };
  } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Firestore & sync refs
  const dirtyMonthsRef = useRef<Set<string>>(new Set());
  const writingMonthsRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fbServicesRef = useRef<{ app: any; db: any; auth: any } | null>(null);

  // Initialize theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('nsangaweh-theme');
    if (savedTheme && savedTheme !== 'system') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Show Toast
  const showToast = (
    msg: string,
    undoData?: { monthKey: string; entryId: string }
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastInfo({ msg, undoData });
    toastTimerRef.current = setTimeout(() => {
      setToastInfo(null);
    }, 4500);
  };

  const handleUndo = () => {
    if (!toastInfo?.undoData) return;
    const { monthKey, entryId } = toastInfo.undoData;
    triggerHaptic('medium');

    setMyMonths((prev) => {
      const month = prev[monthKey];
      if (!month) return prev;
      const updatedEntries = month.entries.filter((e) => e.id !== entryId);
      const updatedMonth: MonthData = { ...month, entries: updatedEntries };
      touchMonth(monthKey, updatedMonth);
      return { ...prev, [monthKey]: updatedMonth };
    });

    setToastInfo(null);
    showToast('Opération annulée.');
  };

  // Local-only mode
  const loadLocalOnly = () => {
    const stored = getStoredLocalLedger();
    if (Object.keys(stored).length > 0) {
      setMyMonths(stored);
    } else {
      setMyMonths(SEED_DATA);
      saveStoredLocalLedger(SEED_DATA);
    }
    setMyName('Moi');
    setAuthStatus('ready');
    setSyncStatus('local');
  };

  // Debounced cloud flush
  const touchMonth = (monthKey: string, data: MonthData) => {
    if (authStatus === 'ready' && fbServicesRef.current && userUid && householdId) {
      dirtyMonthsRef.current.add(monthKey);
      setSyncStatus('saving');

      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(() => {
        flushDirtyMonths();
      }, 400);
    } else {
      setMyMonths((prev) => {
        const next = { ...prev, [monthKey]: data };
        saveStoredLocalLedger(next);
        return next;
      });
    }
  };

  const flushDirtyMonths = async () => {
    if (!fbServicesRef.current || !userUid || !householdId) return;
    const toFlush = Array.from(dirtyMonthsRef.current);
    dirtyMonthsRef.current.clear();

    for (const mk of toFlush) {
      if (writingMonthsRef.current.has(mk)) continue;
      writingMonthsRef.current.add(mk);

      try {
        const data = myMonths[mk];
        if (data) {
          const docRef = doc(
            fbServicesRef.current.db,
            `households/${householdId}/members/${userUid}/months/${mk}`
          );
          await setDoc(docRef, { ...data, updated: Date.now() }, { merge: true });
          incrementQuota('write', 1);
        }
      } catch (err) {
        console.error('Error syncing month', mk, err);
        dirtyMonthsRef.current.add(mk);
      } finally {
        writingMonthsRef.current.delete(mk);
      }
    }

    setSyncStatus(dirtyMonthsRef.current.size > 0 ? 'saving' : 'cloud');
  };

  // Cloud Sync Listener setup
  const startCloudSync = (uid: string, hid: string, services: any) => {
    setAuthStatus('ready');
    setSyncStatus('load');

    try {
      // 1. Listen to Member profile
      const myProfileRef = doc(services.db, `households/${hid}/members/${uid}`);
      onSnapshot(myProfileRef, (snap) => {
        incrementQuota('read', 1);
        if (snap.exists()) {
          const d = snap.data();
          if (d.name) setMyName(d.name);
          if (d.color) setMyColor(d.color);
        } else {
          setDoc(myProfileRef, { name: myName || 'Moi', color: myColor, joined: Date.now() });
          incrementQuota('write', 1);
        }
      });

      // 2. Listen to Household doc settings
      const householdDocRef = doc(services.db, `households/${hid}`);
      onSnapshot(householdDocRef, (snap) => {
        incrementQuota('read', 1);
        if (snap.exists()) {
          const d = snap.data();
          if (d.settings) {
            setHouseholdSettings(d.settings);
          }
        }
      });

      // 3. Listen to My Months
      const myMonthsColl = collection(services.db, `households/${hid}/members/${uid}/months`);
      onSnapshot(myMonthsColl, (snapshot) => {
        incrementQuota('read', snapshot.docs.length || 1);
        setMyMonths((prev) => {
          const next = { ...prev };
          let changed = false;

          snapshot.docChanges().forEach((change) => {
            const mKey = change.doc.id;
            if (dirtyMonthsRef.current.has(mKey) || writingMonthsRef.current.has(mKey)) {
              return;
            }
            if (change.type === 'removed') {
              delete next[mKey];
              changed = true;
            } else {
              const d = change.doc.data() as MonthData;
              next[mKey] = d;
              changed = true;
            }
          });

          if (!changed && Object.keys(next).length === 0) {
            // First time migration from local or seed
            const localLedger = getStoredLocalLedger();
            const initial = Object.keys(localLedger).length > 0 ? localLedger : SEED_DATA;
            Object.entries(initial).forEach(([k, val]) => {
              setDoc(doc(services.db, `households/${hid}/members/${uid}/months/${k}`), {
                ...val,
                updated: Date.now(),
              });
              incrementQuota('write', 1);
            });
            return initial;
          }

          return changed ? next : prev;
        });
        setSyncStatus('cloud');
      });

      // 4. Listen to other members in household (listen only to current month to respect Spark quotas)
      const membersColl = collection(services.db, `households/${hid}/members`);
      onSnapshot(membersColl, (snap) => {
        incrementQuota('read', snap.docs.length || 1);
        snap.docs.forEach((d) => {
          if (d.id !== uid) {
            const partnerData = d.data();
            const partnerMonthsColl = collection(
              services.db,
              `households/${hid}/members/${d.id}/months`
            );
            onSnapshot(partnerMonthsColl, (mSnap) => {
              incrementQuota('read', mSnap.docs.length || 1);
              const pMonths: Record<string, MonthData> = {};
              mSnap.docs.forEach((md) => {
                pMonths[md.id] = md.data() as MonthData;
              });
              setOtherMembers((prev) => ({
                ...prev,
                [d.id]: {
                  name: partnerData.name || 'Partenaire',
                  color: partnerData.color || '#F5B700',
                  months: pMonths,
                },
              }));
            });
          }
        });
      });
    } catch (err) {
      console.error('Error starting cloud sync', err);
      setSyncStatus('local');
    }
  };

  // Firebase initialization on mount
  useEffect(() => {
    const config = getStoredConfig();
    if (!config) {
      loadLocalOnly();
      return;
    }

    try {
      const services = initFirebase(config);
      fbServicesRef.current = services;

      const unsubscribe = onAuthStateChanged(services.auth, (user) => {
        if (!user) {
          setUserUid(null);
          setUserEmail('');
          setAuthStatus('signin');
          setSyncStatus('local');
        } else {
          setUserUid(user.uid);
          setUserEmail(user.email || '');

          const hid = getStoredHouseholdId();
          if (!hid) {
            setAuthStatus('household');
            setSyncStatus('local');
          } else {
            setHouseholdId(hid);
            startCloudSync(user.uid, hid, services);
          }
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Firebase init error', e);
      loadLocalOnly();
    }
  }, []);

  // Auth Handlers
  const handleSignIn = async (email: string, pass: string) => {
    if (!fbServicesRef.current) return;
    setIsBusy(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(fbServicesRef.current.auth, email, pass);
      setIsBusy(false);
    } catch (err: any) {
      setIsBusy(false);
      setAuthError(getAuthErrorMessage(err));
    }
  };

  const handleSignUp = async (email: string, pass: string, name: string, color: string) => {
    if (!fbServicesRef.current) return;
    setIsBusy(true);
    setAuthError('');
    try {
      setMyName(name);
      setMyColor(color);
      await createUserWithEmailAndPassword(fbServicesRef.current.auth, email, pass);
      setIsBusy(false);
    } catch (err: any) {
      setIsBusy(false);
      setAuthError(getAuthErrorMessage(err));
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!fbServicesRef.current) return;
    await sendPasswordResetEmail(fbServicesRef.current.auth, email);
  };

  const handleSignOut = async () => {
    triggerHaptic('medium');
    if (fbServicesRef.current) {
      await fbSignOut(fbServicesRef.current.auth);
    }
    window.location.reload();
  };

  const handleLeaveHousehold = () => {
    triggerHaptic('medium');
    saveStoredHouseholdId('');
    setHouseholdId('');
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!fbServicesRef.current || !fbServicesRef.current.auth.currentUser) return;
    try {
      if (householdId && userUid) {
        const memberRef = doc(fbServicesRef.current.db, `households/${householdId}/members/${userUid}`);
        await deleteDoc(memberRef).catch(() => {});
      }
      await deleteUser(fbServicesRef.current.auth.currentUser);
      localStorage.clear();
      window.location.reload();
    } catch (e: any) {
      showToast('Déconnexion requise pour supprimer votre compte (reconnexion récente nécessaire).');
      throw e;
    }
  };

  const handleCreateHousehold = async (name: string, color: string) => {
    const code = generateHouseholdCode();
    setCreatedHouseholdCode(code);
    saveStoredHouseholdId(code);
    setHouseholdId(code);
    setMyName(name);
    setMyColor(color);

    if (userUid && fbServicesRef.current) {
      // Create household metadata doc
      const householdRef = doc(fbServicesRef.current.db, `households/${code}`);
      await setDoc(householdRef, {
        joinCode: code,
        members: [userUid],
        createdAt: Date.now(),
        settings: householdSettings,
      });
      incrementQuota('write', 1);

      startCloudSync(userUid, code, fbServicesRef.current);
      showToast(`Code foyer créé : ${code}. Partagez-le avec votre partenaire.`);
    }
  };

  const handleJoinHousehold = async (code: string, name: string, color: string) => {
    if (!fbServicesRef.current) return;
    setIsBusy(true);
    setAuthError('');

    try {
      const cleanCode = code.trim().toUpperCase();
      const householdRef = doc(fbServicesRef.current.db, `households/${cleanCode}`);
      const snap = await getDoc(householdRef);
      incrementQuota('read', 1);

      setIsBusy(false);
      if (!snap.exists()) {
        setAuthError('Code introuvable. Vérifiez-le avec votre partenaire.');
        return;
      }

      setMyName(name);
      setMyColor(color);
      saveStoredHouseholdId(cleanCode);
      setHouseholdId(cleanCode);

      // Add self to household members list
      const data = snap.data();
      const currentMembers: string[] = data?.members || [];
      if (userUid && !currentMembers.includes(userUid)) {
        await setDoc(
          householdRef,
          { members: [...currentMembers, userUid] },
          { merge: true }
        );
        incrementQuota('write', 1);
      }

      if (userUid) {
        startCloudSync(userUid, cleanCode, fbServicesRef.current);
      }
    } catch {
      setIsBusy(false);
      setAuthError('Code introuvable ou accès refusé.');
    }
  };

  const handleUpdateName = async (name: string) => {
    setMyName(name);
    if (authStatus === 'ready' && fbServicesRef.current && userUid && householdId) {
      const docRef = doc(fbServicesRef.current.db, `households/${householdId}/members/${userUid}`);
      await setDoc(docRef, { name }, { merge: true });
      incrementQuota('write', 1);
    }
    showToast('Prénom mis à jour.');
  };

  const handleUpdateHouseholdSettings = async (settings: Partial<HouseholdSettings>) => {
    setHouseholdSettings((prev) => ({ ...prev, ...settings }));
    if (authStatus === 'ready' && fbServicesRef.current && householdId) {
      const docRef = doc(fbServicesRef.current.db, `households/${householdId}`);
      await setDoc(docRef, { settings }, { merge: true });
      incrementQuota('write', 1);
    }
    showToast('Paramètres mis à jour.');
  };

  // Entry Actions
  const handleAddEntry = ({
    type,
    amt,
    label,
    date,
    plan,
    walletId,
    fee,
    ref,
    who,
    src = 'manual',
    saveMemory,
  }: {
    type: EntryType;
    amt: number;
    label: string;
    date: string;
    plan: PlanLine | null;
    walletId: string;
    fee?: number;
    ref?: string;
    who?: string;
    src?: EntrySource;
    saveMemory?: { name: string; rubric: string; lineLabel?: string };
  }) => {
    const targetMonthKey = date.slice(0, 7);

    if (saveMemory) {
      setRecipientMemories((prev) => [
        ...prev.filter((m) => m.name.toLowerCase() !== saveMemory.name.toLowerCase()),
        { id: generateId(), name: saveMemory.name, rubric: saveMemory.rubric, planLineLabel: saveMemory.lineLabel },
      ]);
    }

    setMyMonths((prev) => {
      const targetMonthData = prev[targetMonthKey] || { plan: [], entries: [] };
      let matchedPlan = plan;

      if (targetMonthKey !== currentMonth && !matchedPlan) {
        const normLabel = label.toLowerCase();
        matchedPlan =
          targetMonthData.plan.find(
            (p) => (p.t || 'out') === type && p.l.toLowerCase() === normLabel
          ) || null;
      }

      const newEntry: Entry = {
        id: generateId(),
        d: date,
        t: type,
        amt,
        p: matchedPlan ? matchedPlan.id : null,
        l: matchedPlan ? '' : label,
        w: walletId,
        fee: fee && fee > 0 ? fee : undefined,
        ref,
        who,
        src,
        ts: Date.now(),
      };

      const entriesToAdd: Entry[] = [newEntry];

      // If fee exists from SMS or transfer, add linked sortie in Frais rubric
      if (fee && fee > 0) {
        entriesToAdd.push({
          id: generateId(),
          d: date,
          t: 'out',
          amt: fee,
          p: null,
          l: `Frais (${label})`,
          w: walletId,
          src: 'sms',
          ts: Date.now() + 1,
        });
      }

      const updatedMonth: MonthData = {
        ...targetMonthData,
        entries: [...targetMonthData.entries, ...entriesToAdd],
      };

      touchMonth(targetMonthKey, updatedMonth);

      const entryDispLabel = getEntryLabel(updatedMonth, newEntry).l;
      const monthNote = targetMonthKey !== currentMonth ? ` (${monthLabel(targetMonthKey)})` : '';
      showToast(
        `${type === 'in' ? 'Entrée' : type === 'save' ? 'Épargne' : 'Sortie'} ajoutée : ${fmt(amt)} F · ${entryDispLabel}${monthNote}`,
        { monthKey: targetMonthKey, entryId: newEntry.id }
      );

      return {
        ...prev,
        [targetMonthKey]: updatedMonth,
      };
    });
  };

  const handleUpdateEntry = (updated: Entry) => {
    setMyMonths((prev) => {
      const m = prev[currentMonth];
      if (!m) return prev;
      const updatedEntries = m.entries.map((e) => (e.id === updated.id ? updated : e));
      const updatedM = { ...m, entries: updatedEntries };
      touchMonth(currentMonth, updatedM);
      return { ...prev, [currentMonth]: updatedM };
    });
    showToast('Opération mise à jour.');
  };

  const handleDeleteEntry = (entryId: string) => {
    setMyMonths((prev) => {
      const m = prev[currentMonth];
      if (!m) return prev;
      const updatedEntries = m.entries.filter((e) => e.id !== entryId);
      const updatedM = { ...m, entries: updatedEntries };
      touchMonth(currentMonth, updatedM);
      return { ...prev, [currentMonth]: updatedM };
    });
    showToast('Opération supprimée.');
  };

  const handleUpdatePlan = (newPlan: PlanLine[]) => {
    setMyMonths((prev) => {
      const m = prev[currentMonth] || { plan: [], entries: [] };
      const updatedM: MonthData = { ...m, plan: newPlan };
      touchMonth(currentMonth, updatedM);
      return { ...prev, [currentMonth]: updatedM };
    });
  };

  const handleCopyPreviousPlan = (fromMonthKey: string) => {
    const fromMonth = myMonths[fromMonthKey];
    if (!fromMonth) return;

    setMyMonths((prev) => {
      const target = prev[currentMonth] || { plan: [], entries: [] };
      const clonedPlan = fromMonth.plan.map((p) => ({
        id: generateId(),
        g: p.g,
        l: p.l,
        a: p.a,
        t: p.t || 'out',
      }));
      const updatedM: MonthData = { ...target, plan: clonedPlan };
      touchMonth(currentMonth, updatedM);
      return { ...prev, [currentMonth]: updatedM };
    });
  };

  const handleStartBlankPlan = () => {
    setMyMonths((prev) => {
      const target = prev[currentMonth] || { plan: [], entries: [] };
      const updatedM: MonthData = { ...target, plan: [] };
      touchMonth(currentMonth, updatedM);
      return { ...prev, [currentMonth]: updatedM };
    });
  };

  // Internal transfers
  const handleInternalTransfer = ({
    fromWalletId,
    toWalletId,
    amount,
    fee,
    date,
  }: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    fee: number;
    date: string;
  }) => {
    const fromW = wallets.find((w) => w.id === fromWalletId)?.name || 'Compte source';
    const toW = wallets.find((w) => w.id === toWalletId)?.name || 'Compte dest';

    // Transfer is recorded via fee in current month entries
    if (fee > 0) {
      handleAddEntry({
        type: 'out',
        amt: fee,
        label: `Frais virement (${fromW} → ${toW})`,
        date,
        plan: null,
        walletId: fromWalletId,
        src: 'manual',
      });
    }

    showToast(`Virement de ${fmt(amount)} F enregistré (${fromW} → ${toW}).`);
  };

  // In-app computed alerts (Inbox)
  const computedAlerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    const c = calcMonth(myMonths[currentMonth]);

    // 1. Rubric over budget
    Object.entries(c.byGroup).forEach(([g, act]) => {
      if (g === 'Revenus' || g === 'Hors plan') return;
      const planned = c.monthData.plan
        .filter((p) => p.g === g)
        .reduce((acc, p) => acc + (p.a || 0), 0);
      if (planned > 0 && act >= planned) {
        list.push({
          id: `alert-rubric-${g}`,
          title: `Budget ${g} atteint`,
          message: `Vous avez dépensé ${fmt(act)} F sur les ${fmt(planned)} F prévus ce mois-ci.`,
          date: todayStr(),
          type: 'warning',
          read: false,
        });
      }
    });

    // 2. Commitments due soon
    commitments.forEach((cm) => {
      if (cm.active) {
        list.push({
          id: `alert-com-${cm.id}`,
          title: `Soutien famille : ${cm.recipient}`,
          message: `${cm.label} (${fmt(cm.amount)} F) prévu le ${cm.dayOfMonth} du mois.`,
          date: todayStr(),
          type: 'info',
          read: false,
        });
      }
    });

    return list;
  }, [myMonths, currentMonth, commitments]);

  const unreadAlertsCount = computedAlerts.length;

  // Calculations
  const currentCalc = useMemo(() => {
    return calcMonth(myMonths[currentMonth]);
  }, [myMonths, currentMonth]);

  const allMembers = useMemo<MemberData[]>(() => {
    const list: MemberData[] = [
      {
        uid: userUid || 'local-me',
        name: myName || 'Moi',
        color: myColor,
        me: true,
        months: myMonths,
        wallets,
        debts,
        commitments,
        provisions,
        tontines,
      },
    ];

    Object.entries(otherMembers).forEach(([uid, data]) => {
      list.push({
        uid,
        name: data.name,
        color: data.color || '#F5B700',
        me: false,
        months: data.months,
      });
    });

    return list;
  }, [userUid, myName, myColor, myMonths, otherMembers, wallets, debts, commitments, provisions, tontines]);

  // Find previous month with a plan
  const previousMonthWithPlan = useMemo(() => {
    const keys = Object.keys(myMonths)
      .filter((k) => k < currentMonth && (myMonths[k]?.plan?.length || 0) > 0)
      .sort()
      .reverse();
    return keys[0] || null;
  }, [myMonths, currentMonth]);

  // Open Plus Module handler
  const handleOpenPlusModule = (mod: PlusModule) => {
    triggerHaptic('light');
    if (mod === 'portefeuilles') {
      setIsWalletsOpen(true);
    } else if (mod === 'reglages') {
      setIsSettingsOpen(true);
    } else {
      setActivePlusModule(mod);
    }
  };

  // If in Onboarding / Auth flow
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
        onResetPassword={handleResetPassword}
        onContinueOffline={loadLocalOnly}
        onCreateHousehold={handleCreateHousehold}
        onJoinHousehold={handleJoinHousehold}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex justify-center selection:bg-[var(--color-primary-light)]">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col relative bg-[var(--color-surface)] shadow-lg">
        {/* Offline indicator */}
        <OfflineIndicator />

        {/* Sticky 56px Top App Bar */}
        <TopAppBar
          userName={myName}
          currentMonth={currentMonth}
          syncStatus={syncStatus}
          unreadAlertsCount={unreadAlertsCount}
          onMonthChange={setCurrentMonth}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content View */}
        <main className="flex-1 px-3.5 pt-2">
          {activeTab === 'accueil' && (
            <AccueilScreen
              currentMonth={currentMonth}
              calc={currentCalc}
              myName={myName || 'Moi'}
              previousMonthWithPlan={previousMonthWithPlan}
              onOpenQuickAdd={(t) => {
                setQuickAddInitialType(t || 'out');
                setIsQuickAddOpen(true);
              }}
              onOpenPlanEditor={() => setIsPlanEditorOpen(true)}
              onCopyPreviousPlan={handleCopyPreviousPlan}
              onStartBlankPlan={handleStartBlankPlan}
            />
          )}

          {activeTab === 'journal' && (
            <JournalScreen
              currentMonth={currentMonth}
              calc={currentCalc}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onOpenQuickAdd={() => {
                setQuickAddInitialType('out');
                setIsQuickAddOpen(true);
              }}
            />
          )}

          {activeTab === 'famille' && (
            <FamilleScreen
              currentMonth={currentMonth}
              isCloudMode={authStatus === 'ready'}
              householdId={householdId}
              members={allMembers}
              onShowSetup={() => setAuthStatus('signin')}
            />
          )}

          {activeTab === 'plus' && (
            <>
              {activePlusModule === 'evolution' ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePlusModule(null)}
                    className="self-start text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 mb-1"
                  >
                    ← Retour aux outils
                  </button>
                  <EvolutionScreen
                    isCloudMode={authStatus === 'ready'}
                    members={allMembers}
                  />
                </div>
              ) : (
                <PlusHubScreen
                  debts={debts}
                  commitments={commitments}
                  provisions={provisions}
                  goals={goals}
                  tontines={tontines}
                  wallets={wallets}
                  onOpenModule={handleOpenPlusModule}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (56px) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActivePlusModule(null);
            setActiveTab(tab);
          }}
          onOpenQuickAdd={() => {
            setQuickAddInitialType('out');
            setIsQuickAddOpen(true);
          }}
        />

        {/* Quick Add Bottom Sheet (Saisie, SMS, Voix) */}
        <QuickAddSheet
          isOpen={isQuickAddOpen}
          currentMonth={currentMonth}
          calc={currentCalc}
          wallets={wallets}
          recipientMemories={recipientMemories}
          initialType={quickAddInitialType}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleAddEntry}
        />

        {/* Plan Editor Full Bottom Sheet */}
        <PlanEditorSheet
          isOpen={isPlanEditorOpen}
          plan={currentCalc.monthData.plan}
          onClose={() => setIsPlanEditorOpen(false)}
          onUpdatePlan={handleUpdatePlan}
        />

        {/* Wallets Sheet */}
        <WalletsSheet
          isOpen={isWalletsOpen}
          wallets={wallets}
          entries={currentCalc.monthData.entries}
          onClose={() => setIsWalletsOpen(false)}
          onUpdateWallets={setWallets}
          onInternalTransfer={handleInternalTransfer}
        />

        {/* Alerts Inbox Sheet */}
        <AlertsInboxSheet
          isOpen={isAlertsOpen}
          alerts={computedAlerts}
          onClose={() => setIsAlertsOpen(false)}
          onSelectAlert={(al) => {
            setIsAlertsOpen(false);
            if (al.id.includes('rubric')) setActiveTab('accueil');
            else if (al.id.includes('com')) handleOpenPlusModule('engagements');
          }}
          onClearAlerts={() => setIsAlertsOpen(false)}
        />

        {/* Settings & Profile Sheet */}
        <SettingsSheet
          isOpen={isSettingsOpen}
          userName={myName}
          userEmail={userEmail}
          householdId={householdId}
          months={myMonths}
          householdSettings={householdSettings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateName={handleUpdateName}
          onUpdateSettings={handleUpdateHouseholdSettings}
          onSignOut={handleSignOut}
          onLeaveHousehold={handleLeaveHousehold}
          onDeleteAccount={handleDeleteAccount}
        />

        {/* Undo Toast */}
        {toastInfo && (
          <div
            role="status"
            className="fixed left-4 right-4 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] max-w-[448px] mx-auto bg-[var(--color-text)] text-[var(--color-surface)] rounded-2xl px-4 py-3 flex justify-between items-center gap-3 text-xs shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <span className="truncate font-medium">{toastInfo.msg}</span>
            {toastInfo.undoData && (
              <button
                type="button"
                onClick={handleUndo}
                className="text-[var(--color-primary)] font-heading font-bold underline hover:opacity-80 shrink-0 cursor-pointer text-xs"
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
