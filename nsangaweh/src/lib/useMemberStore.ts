import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_BUDGET } from './budget-ops';
import {
  collection,
  doc,
  getStoredLocalLedger,
  incrementQuota,
  onSnapshot,
  setDoc,
  writeBatch,
} from './firebase';
import { hasLegacyData, isLegacyMonth, migrateLegacy } from './migration';
import { BUDGET_COLLECTIONS, BudgetCollection, diffBudget, restorePaths, toFirestore, valueAt } from './sync';
import { LegacyMonthData, MemberBudget, MemberData, MemberProfile, MonthDoc } from './types';

export type SyncStatus = 'cloud' | 'saving' | 'local' | 'load';

const LOCAL_V2_KEY = 'nsangaweh-v2';
const LOCAL_PROFILE_KEY = 'nsangaweh-profile';

interface CloudCtx {
  db: any;
  hid: string;
  uid: string;
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

/** Old-format months converted, with a copy of the old plan kept in each month. */
function migrateWithBackup(legacy: Record<string, LegacyMonthData>, existing: MemberBudget): MemberBudget {
  const m = migrateLegacy(legacy, existing);
  const months: Record<string, MonthDoc> = { ...existing.months };
  Object.entries(m.months).forEach(([k, doc]) => {
    months[k] = { ...doc, legacyPlan: legacy[k].plan };
  });
  return { ...existing, categories: m.categories, items: m.items, months };
}

/** Convert raw month documents of a partner who still uses the old format (display only). */
export function readPartnerBudget(raw: {
  categories: any[];
  items: any[];
  months: Record<string, any>;
}): Pick<MemberBudget, 'categories' | 'items' | 'months'> {
  const legacy: Record<string, LegacyMonthData> = {};
  const months: Record<string, MonthDoc> = {};
  Object.entries(raw.months).forEach(([k, d]) => {
    if (isLegacyMonth(d)) legacy[k] = d;
    else months[k] = { lines: [], entries: [], ...d };
  });
  if (!Object.keys(legacy).length) return { categories: raw.categories, items: raw.items, months };
  const m = migrateLegacy(legacy, { categories: raw.categories, items: raw.items });
  return { categories: m.categories, items: m.items, months: { ...m.months, ...months } };
}

export function useMemberStore() {
  const [budget, setBudget] = useState<MemberBudget>(EMPTY_BUDGET);
  const [profile, setProfile] = useState<MemberProfile>({ name: '' });
  const [loaded, setLoaded] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('load');
  const [partners, setPartners] = useState<Record<string, MemberData>>({});

  const budgetRef = useRef<MemberBudget>(EMPTY_BUDGET);
  const profileRef = useRef<MemberProfile>({ name: '' });
  const cloudRef = useRef<CloudCtx | null>(null);
  const dirtyRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  const replace = (next: MemberBudget) => {
    budgetRef.current = next;
    setBudget(next);
  };

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
    const base = `households/${ctx.hid}/members/${ctx.uid}`;
    const b = budgetRef.current;
    try {
      for (let i = 0; i < paths.length; i += 450) {
        const batch = writeBatch(ctx.db);
        paths.slice(i, i + 450).forEach((p) => {
          const v = valueAt(b, p);
          const ref = doc(ctx.db, `${base}/${p}`);
          if (v) batch.set(ref, toFirestore(p.startsWith('months/') ? { ...v, updated: Date.now() } : v));
          else batch.delete(ref);
        });
        await batch.commit();
        incrementQuota('write', Math.min(450, paths.length - i));
      }
    } catch (err) {
      console.error('Sync error', err);
      paths.forEach((p) => dirtyRef.current.add(p));
    }
    setSyncStatus(dirtyRef.current.size ? 'saving' : 'cloud');
  }, []);

  const schedule = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    const eco = typeof document !== 'undefined' && document.body.classList.contains('eco-mode');
    if (cloudRef.current) setSyncStatus('saving');
    flushTimerRef.current = setTimeout(() => flush(), cloudRef.current ? (eco ? 20000 : 400) : 250);
  }, [flush]);

  /** Replace the budget with `next`; only documents that changed are written. */
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

  const updateProfile = useCallback(
    (patch: Partial<MemberProfile>) => {
      const next = { ...profileRef.current, ...patch };
      profileRef.current = next;
      setProfile(next);
      const ctx = cloudRef.current;
      if (ctx) {
        setDoc(doc(ctx.db, `households/${ctx.hid}/members/${ctx.uid}`), toFirestore(patch), { merge: true }).catch((e) =>
          console.error('Profile save failed', e)
        );
        incrementQuota('write', 1);
      } else {
        writeLocal(budgetRef.current, next);
      }
    },
    []
  );

  /* ------------------------------ local mode ------------------------------ */

  const startLocal = useCallback((fallbackName = '') => {
    cloudRef.current = null;
    const stored = readLocal();
    let b = stored?.budget || EMPTY_BUDGET;
    let p: MemberProfile = stored?.profile || { name: fallbackName };
    if (!stored) {
      const v1 = getStoredLocalLedger() as Record<string, LegacyMonthData>;
      if (Object.keys(v1).length && hasLegacyData(v1)) {
        b = migrateWithBackup(v1, EMPTY_BUDGET);
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

  const startCloud = useCallback(
    (db: any, hid: string, uid: string, initialProfile: Partial<MemberProfile> = {}) => {
      stopCloud();
      cloudRef.current = { db, hid, uid };
      setSyncStatus('load');
      setLoaded(false);
      const base = `households/${hid}/members/${uid}`;
      const pending = new Set<string>([...BUDGET_COLLECTIONS, 'months', 'profile']);
      const legacy: Record<string, LegacyMonthData> = {};

      const firstDone = (what: string) => {
        if (!pending.delete(what) || pending.size) return;
        // Everything arrived once: migrate old data, or upload what was entered offline.
        let b = budgetRef.current;
        if (Object.keys(legacy).length) {
          b = migrateWithBackup(legacy, b);
          commit(b);
          setMigrated(true);
          if (!profileRef.current.budgetSetupDone) updateProfile({ budgetSetupDone: true });
        } else if (!b.categories.length && !Object.keys(b.months).length) {
          const local = readLocal();
          if (local && (local.budget.categories.length || Object.keys(local.budget.months).length)) {
            commit({ ...EMPTY_BUDGET, ...local.budget });
            if (local.profile.budgetSetupDone && !profileRef.current.budgetSetupDone) {
              updateProfile({ budgetSetupDone: true });
            }
          }
        }
        setLoaded(true);
        setSyncStatus(dirtyRef.current.size ? 'saving' : 'cloud');
      };

      // Profile
      const profileRef_ = doc(db, base);
      unsubsRef.current.push(
        onSnapshot(profileRef_, (snap: any) => {
          incrementQuota('read', 1);
          if (snap.exists()) {
            const d = snap.data() as MemberProfile;
            const merged = { ...profileRef.current, ...d };
            profileRef.current = merged;
            setProfile(merged);
          } else {
            const init: MemberProfile = { name: initialProfile.name || '', joined: Date.now(), ...initialProfile };
            profileRef.current = init;
            setProfile(init);
            setDoc(profileRef_, toFirestore(init), { merge: true });
            incrementQuota('write', 1);
          }
          firstDone('profile');
        })
      );

      // Rubrics, items, debts, commitments: one document each.
      BUDGET_COLLECTIONS.forEach((c: BudgetCollection) => {
        unsubsRef.current.push(
          onSnapshot(collection(db, `${base}/${c}`), (snap: any) => {
            const changes = snap.docChanges();
            incrementQuota('read', changes.length || 1);
            const cur = budgetRef.current;
            const map = new Map((cur[c] as Array<{ id: string }>).map((x) => [x.id, x]));
            let changed = false;
            changes.forEach((ch: any) => {
              const path = `${c}/${ch.doc.id}`;
              if (dirtyRef.current.has(path) || ch.doc.metadata.hasPendingWrites) return;
              if (ch.type === 'removed') map.delete(ch.doc.id);
              else map.set(ch.doc.id, { ...ch.doc.data(), id: ch.doc.id });
              changed = true;
            });
            if (changed) replace({ ...budgetRef.current, [c]: [...map.values()] });
            firstDone(c);
          })
        );
      });

      // Months: one document per month (plan lines + entries).
      unsubsRef.current.push(
        onSnapshot(collection(db, `${base}/months`), (snap: any) => {
          const changes = snap.docChanges();
          incrementQuota('read', changes.length || 1);
          const months = { ...budgetRef.current.months };
          let changed = false;
          changes.forEach((ch: any) => {
            const k = ch.doc.id;
            if (dirtyRef.current.has(`months/${k}`) || ch.doc.metadata.hasPendingWrites) return;
            if (ch.type === 'removed') {
              delete months[k];
              changed = true;
              return;
            }
            const d = ch.doc.data();
            if (isLegacyMonth(d)) {
              legacy[k] = d;
              return;
            }
            months[k] = { lines: [], entries: [], ...d };
            changed = true;
          });
          if (changed) replace({ ...budgetRef.current, months });
          firstDone('months');
        })
      );

      // Partners: their rubrics, items and months, read-only.
      const partnerUnsubs = new Map<string, Array<() => void>>();
      unsubsRef.current.push(
        onSnapshot(collection(db, `households/${hid}/members`), (snap: any) => {
          incrementQuota('read', snap.docChanges().length || 1);
          snap.docs.forEach((d: any) => {
            if (d.id === uid) return;
            const info = d.data() || {};
            setPartners((prev) => ({
              ...prev,
              [d.id]: {
                ...(prev[d.id] || { ...EMPTY_BUDGET, uid: d.id, me: false }),
                name: info.name || 'Partenaire',
                color: info.color || '#7C3AED',
              },
            }));
            if (partnerUnsubs.has(d.id)) return;
            const raw = { categories: [] as any[], items: [] as any[], months: {} as Record<string, any> };
            const publish = () => {
              const conv = readPartnerBudget(raw);
              setPartners((prev) => ({
                ...prev,
                [d.id]: { ...(prev[d.id] || { ...EMPTY_BUDGET, uid: d.id, me: false, name: 'Partenaire' }), ...conv },
              }));
            };
            const pBase = `households/${hid}/members/${d.id}`;
            const list: Array<() => void> = [];
            (['categories', 'items'] as const).forEach((c) =>
              list.push(
                onSnapshot(collection(db, `${pBase}/${c}`), (s: any) => {
                  incrementQuota('read', s.docChanges().length || 1);
                  raw[c] = s.docs.map((x: any) => ({ ...x.data(), id: x.id }));
                  publish();
                })
              )
            );
            list.push(
              onSnapshot(collection(db, `${pBase}/months`), (s: any) => {
                incrementQuota('read', s.docChanges().length || 1);
                const next: Record<string, any> = {};
                s.docs.forEach((x: any) => (next[x.id] = x.data()));
                raw.months = next;
                publish();
              })
            );
            partnerUnsubs.set(d.id, list);
            unsubsRef.current.push(...list);
          });
        })
      );
    },
    [commit, updateProfile]
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
    partners,
    commit,
    undo,
    updateProfile,
    startLocal,
    startCloud,
  };
}
