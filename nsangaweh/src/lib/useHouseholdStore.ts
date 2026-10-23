import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_BUDGET } from './budget-ops';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getStoredLocalLedger,
  incrementQuota,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from './firebase';
import { hasPersonalData, mergeMemberBudgets, PersonalBudget, readPersonalBudget } from './household';
import { hasLegacyData, migrateLegacy } from './migration';
import {
  BUDGET_COLLECTIONS,
  BudgetCollection,
  diffBudget,
  parseEntriesDocId,
  restorePaths,
  setAuthorEntries,
  setMonthPlan,
  toFirestore,
  valueAt,
} from './sync';
import { LegacyMonthData, MemberBudget, MemberProfile, MonthDoc } from './types';

export type SyncStatus = 'cloud' | 'saving' | 'local' | 'load' | 'error';

const LOCAL_V2_KEY = 'nsangaweh-v2';
const LOCAL_PROFILE_KEY = 'nsangaweh-profile';

interface CloudCtx {
  db: any;
  hid: string;
  uid: string;
}

export interface PartnerInfo {
  uid: string;
  name: string;
  color?: string;
}

function readLocal(): { budget: MemberBudget; profile: MemberProfile } | null {
  try {
    const raw = localStorage.getItem(LOCAL_V2_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      budget: { ...EMPTY_BUDGET, ...(parsed.budget || {}) },
      profile: parsed.profile || JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || '{"name":""}'),
    };
  } catch {
    return null;
  }
}

function writeLocal(budget: MemberBudget, profile: MemberProfile) {
  try {
    localStorage.setItem(LOCAL_V2_KEY, JSON.stringify({ budget, profile }));
  } catch (e) {
    console.error('Local save failed', e);
  }
}

/** Write documents of a budget to the household, in batches (few round trips, Spark friendly). */
async function writePaths(db: any, hid: string, b: MemberBudget, paths: string[]) {
  for (let i = 0; i < paths.length; i += 450) {
    const chunk = paths.slice(i, i + 450);
    const batch = writeBatch(db);
    chunk.forEach((p) => {
      const v = valueAt(b, p);
      const ref = doc(db, `households/${hid}/${p}`);
      if (v) batch.set(ref, toFirestore(p.startsWith('categories/') || p.startsWith('items/') || p.startsWith('debts/') || p.startsWith('commitments/') ? v : { ...v, updated: Date.now() }));
      else batch.delete(ref);
    });
    await batch.commit();
    incrementQuota('write', chunk.length);
  }
}

/**
 * One-time step for households created before the shared budget existed:
 * read what each partner built on their own and merge it into ONE budget.
 * The old documents are left untouched as a backup.
 */
async function migrateToSharedBudget(db: any, hid: string, memberUids: string[], hhRef: any): Promise<boolean> {
  const people: PersonalBudget[] = [];
  for (const mu of memberUids) {
    const base = `households/${hid}/members/${mu}`;
    const names = ['categories', 'items', 'months', 'debts', 'commitments'] as const;
    const snaps = await Promise.all(names.map((n) => getDocs(collection(db, `${base}/${n}`))));
    incrementQuota('read', snaps.reduce((s, x) => s + (x.docs.length || 1), 0));
    const [cats, its, mons, debts, coms] = snaps;
    const months: Record<string, any> = {};
    mons.docs.forEach((d: any) => (months[d.id] = d.data()));
    people.push(
      readPersonalBudget(mu, {
        categories: cats.docs.map((d: any) => ({ ...d.data(), id: d.id })),
        items: its.docs.map((d: any) => ({ ...d.data(), id: d.id })),
        months,
        debts: debts.docs.map((d: any) => ({ ...d.data(), id: d.id })),
        commitments: coms.docs.map((d: any) => ({ ...d.data(), id: d.id })),
      })
    );
  }
  const anything = people.some(hasPersonalData);
  if (anything) {
    const merged = mergeMemberBudgets(people);
    await writePaths(db, hid, merged, diffBudget(EMPTY_BUDGET, merged));
  }
  await updateDoc(hhRef, { budgetVersion: 2 });
  incrementQuota('write', 1);
  return anything;
}

/**
 * The household's single budget (rubrics, plan, operations) plus the signed-in
 * partner's profile. Operations carry their author in `by`.
 */
export function useHouseholdStore() {
  const [budget, setBudget] = useState<MemberBudget>(EMPTY_BUDGET);
  const [profile, setProfile] = useState<MemberProfile>({ name: '' });
  const [loaded, setLoaded] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('load');
  const [syncError, setSyncError] = useState<'' | 'permission' | 'other'>('');
  const [members, setMembers] = useState<Record<string, PartnerInfo>>({});

  const budgetRef = useRef<MemberBudget>(EMPTY_BUDGET);
  const profileRef = useRef<MemberProfile>({ name: '' });
  const cloudRef = useRef<CloudCtx | null>(null);
  const dirtyRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);
  const genRef = useRef(0);

  const replace = (next: MemberBudget) => {
    budgetRef.current = next;
    setBudget(next);
  };

  const reportError = useCallback((err: unknown) => {
    console.error('Firebase error', err);
    const code = (err as { code?: string })?.code || '';
    setSyncError(/permission/.test(code) ? 'permission' : 'other');
    setSyncStatus('error');
    setLoaded(true);
  }, []);

  /* ----------------------------- persistence ----------------------------- */

  const flush = useCallback(async () => {
    const ctx = cloudRef.current;
    if (!ctx) {
      writeLocal(budgetRef.current, profileRef.current);
      dirtyRef.current.clear();
      return;
    }
    const paths = [...dirtyRef.current];
    dirtyRef.current.clear();
    if (!paths.length) return;
    try {
      await writePaths(ctx.db, ctx.hid, budgetRef.current, paths);
      setSyncError('');
    } catch (err) {
      paths.forEach((p) => dirtyRef.current.add(p));
      reportError(err);
      return;
    }
    setSyncStatus(dirtyRef.current.size ? 'saving' : 'cloud');
  }, [reportError]);

  const schedule = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    const eco = typeof document !== 'undefined' && document.body.classList.contains('eco-mode');
    if (cloudRef.current) setSyncStatus('saving');
    flushTimerRef.current = setTimeout(() => flush(), cloudRef.current ? (eco ? 20000 : 400) : 250);
  }, [flush]);

  /** Replace the budget with `next`; only the documents that changed are written. */
  const commit = useCallback(
    (next: MemberBudget) => {
      const prev = budgetRef.current;
      if (next === prev) return [] as string[];
      const paths = diffBudget(prev, next);
      paths.forEach((p) => dirtyRef.current.add(p));
      replace(next);
      schedule();
      return paths;
    },
    [schedule]
  );

  /** "Annuler": put back the documents an action changed. */
  const undo = useCallback(
    (before: MemberBudget, paths: string[]) => {
      commit(restorePaths(budgetRef.current, before, paths));
    },
    [commit]
  );

  const updateProfile = useCallback((patch: Partial<MemberProfile>) => {
    const next = { ...profileRef.current, ...patch };
    profileRef.current = next;
    setProfile(next);
    const ctx = cloudRef.current;
    if (ctx) {
      setDoc(doc(ctx.db, `households/${ctx.hid}/members/${ctx.uid}`), toFirestore(patch), { merge: true }).catch((e: unknown) =>
        console.error('Profile save failed', e)
      );
      incrementQuota('write', 1);
    } else {
      writeLocal(budgetRef.current, next);
    }
  }, []);

  /* ------------------------------ local mode ------------------------------ */

  const startLocal = useCallback((fallbackName = '') => {
    cloudRef.current = null;
    const stored = readLocal();
    let b = stored?.budget || EMPTY_BUDGET;
    let p: MemberProfile = stored?.profile || { name: fallbackName };
    if (!stored) {
      const v1 = getStoredLocalLedger() as Record<string, LegacyMonthData>;
      if (Object.keys(v1).length && hasLegacyData(v1)) {
        const m = migrateLegacy(v1, EMPTY_BUDGET);
        const months: Record<string, MonthDoc> = {};
        Object.entries(m.months).forEach(([k, d]) => (months[k] = d));
        b = { ...EMPTY_BUDGET, categories: m.categories, items: m.items, months };
        p = { ...p, budgetSetupDone: true };
        setMigrated(true);
      }
    }
    profileRef.current = p;
    setProfile(p);
    replace(b);
    writeLocal(b, p);
    setLoaded(true);
    setSyncStatus('local');
  }, []);

  /* ------------------------------ cloud mode ------------------------------ */

  const stopCloud = () => {
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];
  };

  const attach = useCallback(
    (db: any, hid: string, uid: string, initialProfile: Partial<MemberProfile>) => {
      const base = `households/${hid}`;
      const pending = new Set<string>([...BUDGET_COLLECTIONS, 'months', 'entries', 'profile', 'members']);

      const firstDone = (what: string) => {
        if (!pending.delete(what) || pending.size) return;
        // Everything arrived once. A brand-new household can adopt what this phone
        // already had (entered offline, in local mode).
        const b = budgetRef.current;
        if (!b.categories.length && !Object.keys(b.months).length) {
          const local = readLocal();
          if (local && (local.budget.categories.length || Object.keys(local.budget.months).length)) {
            const months: Record<string, MonthDoc> = {};
            Object.entries(local.budget.months).forEach(([k, m]) => {
              months[k] = { ...m, entries: (m.entries || []).map((e) => ({ ...e, by: uid })) };
            });
            commit({ ...EMPTY_BUDGET, ...local.budget, months });
            if (local.profile.budgetSetupDone && !profileRef.current.budgetSetupDone) updateProfile({ budgetSetupDone: true });
          }
        }
        setLoaded(true);
        setSyncStatus(dirtyRef.current.size ? 'saving' : 'cloud');
      };

      // My profile (first name, small flags)
      const myRef = doc(db, `${base}/members/${uid}`);
      unsubsRef.current.push(
        onSnapshot(
          myRef,
          (snap: any) => {
            incrementQuota('read', 1);
            if (snap.exists()) {
              const merged = { ...profileRef.current, ...(snap.data() as MemberProfile) };
              profileRef.current = merged;
              setProfile(merged);
            } else {
              const init: MemberProfile = { name: initialProfile.name || '', joined: Date.now(), ...initialProfile };
              profileRef.current = init;
              setProfile(init);
              setDoc(myRef, toFirestore(init), { merge: true });
              incrementQuota('write', 1);
            }
            firstDone('profile');
          },
          reportError
        )
      );

      // Both partners' names and colours
      unsubsRef.current.push(
        onSnapshot(
          collection(db, `${base}/members`),
          (snap: any) => {
            incrementQuota('read', snap.docChanges().length || 1);
            const next: Record<string, PartnerInfo> = {};
            snap.docs.forEach((d: any) => {
              const data = d.data() || {};
              next[d.id] = { uid: d.id, name: data.name || '', color: data.color };
            });
            setMembers(next);
            firstDone('members');
          },
          reportError
        )
      );

      // Shared rubrics, line templates, debts, commitments: one document each.
      BUDGET_COLLECTIONS.forEach((c: BudgetCollection) => {
        unsubsRef.current.push(
          onSnapshot(
            collection(db, `${base}/${c}`),
            (snap: any) => {
              const changes = snap.docChanges();
              incrementQuota('read', changes.length || 1);
              const map = new Map((budgetRef.current[c] as Array<{ id: string }>).map((x) => [x.id, x]));
              let changed = false;
              changes.forEach((ch: any) => {
                if (dirtyRef.current.has(`${c}/${ch.doc.id}`) || ch.doc.metadata.hasPendingWrites) return;
                if (ch.type === 'removed') map.delete(ch.doc.id);
                else map.set(ch.doc.id, { ...ch.doc.data(), id: ch.doc.id });
                changed = true;
              });
              if (changed) replace({ ...budgetRef.current, [c]: [...map.values()] });
              firstDone(c);
            },
            reportError
          )
        );
      });

      // The shared plan of each month
      unsubsRef.current.push(
        onSnapshot(
          collection(db, `${base}/months`),
          (snap: any) => {
            const changes = snap.docChanges();
            incrementQuota('read', changes.length || 1);
            let b = budgetRef.current;
            let changed = false;
            changes.forEach((ch: any) => {
              const k = ch.doc.id;
              if (dirtyRef.current.has(`months/${k}`) || ch.doc.metadata.hasPendingWrites) return;
              if (ch.type === 'removed') b = setMonthPlan(b, k, null);
              else {
                const { updated: _u, ...plan } = ch.doc.data();
                b = setMonthPlan(b, k, { ...plan, lines: plan.lines || [] });
              }
              changed = true;
            });
            if (changed) replace(b);
            firstDone('months');
          },
          reportError
        )
      );

      // What each partner noted, month by month
      unsubsRef.current.push(
        onSnapshot(
          collection(db, `${base}/entries`),
          (snap: any) => {
            const changes = snap.docChanges();
            incrementQuota('read', changes.length || 1);
            let b = budgetRef.current;
            let changed = false;
            changes.forEach((ch: any) => {
              const parsed = parseEntriesDocId(ch.doc.id);
              if (!parsed || dirtyRef.current.has(`entries/${ch.doc.id}`) || ch.doc.metadata.hasPendingWrites) return;
              const list = ch.type === 'removed' ? [] : ch.doc.data().entries || [];
              b = setAuthorEntries(b, parsed.month, parsed.uid, list);
              changed = true;
            });
            if (changed) replace(b);
            firstDone('entries');
          },
          reportError
        )
      );
    },
    [commit, reportError, updateProfile]
  );

  const startCloud = useCallback(
    (db: any, hid: string, uid: string, initialProfile: Partial<MemberProfile> = {}) => {
      stopCloud();
      cloudRef.current = { db, hid, uid };
      setSyncStatus('load');
      setSyncError('');
      setLoaded(false);
      const gen = ++genRef.current;
      (async () => {
        try {
          const hhRef = doc(db, `households/${hid}`);
          const hh = await getDoc(hhRef);
          incrementQuota('read', 1);
          if (hh.exists() && (hh.data().budgetVersion || 0) < 2) {
            const uids: string[] = hh.data().members?.length ? hh.data().members : [uid];
            const did = await migrateToSharedBudget(db, hid, uids, hhRef);
            if (did) setMigrated(true);
          }
        } catch (err) {
          reportError(err);
        }
        if (gen === genRef.current) attach(db, hid, uid, initialProfile);
      })();
    },
    [attach, reportError]
  );

  useEffect(() => () => stopCloud(), []);

  // Write pending changes when the app goes to the background.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && dirtyRef.current.size) flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  return {
    budget,
    budgetRef,
    profile,
    loaded,
    migrated,
    syncStatus,
    syncError,
    members,
    commit,
    undo,
    updateProfile,
    startLocal,
    startCloud,
  };
}
