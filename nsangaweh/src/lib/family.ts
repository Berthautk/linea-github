import { calcMonth, FreeBasis, MonthCalc } from './calc';
import { CategoryKind, MemberData } from './types';
import { nameKey } from './validation';

/** Normalised key used by the Famille view, after the household's merges. */
export function familyKey(name: string, merges: Record<string, string> = {}): string {
  const k = nameKey(name);
  return merges[k] || k;
}

export interface FamilyRubricShare {
  uid: string;
  name: string; // the partner's own rubric name
  categoryId: string;
  planned: number;
  actual: number;
}

export interface FamilyRubric {
  key: string;
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  planned: number;
  actual: number;
  per: FamilyRubricShare[];
}

export interface FamilyMember {
  uid: string;
  name: string;
  color?: string;
  me: boolean;
  calc: MonthCalc;
}

export interface FamilyCalc {
  monthKey: string;
  inc: number;
  out: number;
  saved: number;
  pIn: number;
  pOut: number;
  pSave: number;
  toPay: number;
  free: number | null;
  freeBasis: FreeBasis;
  /** Rubrics used by every partner (after merges). */
  shared: FamilyRubric[];
  /** Rubrics only one partner has. Empty when the household has one member. */
  unmatched: FamilyRubric[];
  uncategorizedOut: number;
  per: FamilyMember[];
}

export function aggregateFamily(
  members: MemberData[],
  monthKey: string,
  merges: Record<string, string> = {}
): FamilyCalc {
  const per: FamilyMember[] = members.map((m) => ({
    uid: m.uid,
    name: m.name,
    color: m.color,
    me: m.me,
    calc: calcMonth(m.categories, m.months[monthKey], monthKey),
  }));

  const rubrics = new Map<string, FamilyRubric>();
  // "me" first so the family view uses my names and colours when both exist.
  [...per].sort((a, b) => Number(b.me) - Number(a.me)).forEach((p) => {
    Object.values(p.calc.byCategory).forEach((cc) => {
      if (!cc.planned && !cc.actual && cc.category.archived) return;
      const key = familyKey(cc.category.name, merges);
      let r = rubrics.get(key);
      if (!r) {
        r = {
          key,
          name: cc.category.name,
          icon: cc.category.icon,
          color: cc.category.color,
          kind: cc.kind,
          planned: 0,
          actual: 0,
          per: [],
        };
        rubrics.set(key, r);
      }
      r.planned += cc.planned;
      r.actual += cc.actual;
      r.per.push({ uid: p.uid, name: cc.category.name, categoryId: cc.id, planned: cc.planned, actual: cc.actual });
    });
  });

  const sum = (f: (c: MonthCalc) => number) => per.reduce((s, p) => s + f(p.calc), 0);
  const inc = sum((c) => c.inc);
  const out = sum((c) => c.out);
  const saved = sum((c) => c.saved);
  const pIn = sum((c) => c.pIn);
  const toPay = sum((c) => c.toPay);

  let freeBasis: FreeBasis = 'none';
  let free: number | null = null;
  if (inc > 0) {
    freeBasis = 'received';
    free = inc - out - saved - toPay;
  } else if (pIn > 0) {
    freeBasis = 'planned';
    free = pIn - out - saved - toPay;
  }

  const all = [...rubrics.values()];
  const memberCount = members.length;
  const isShared = (r: FamilyRubric) => memberCount < 2 || new Set(r.per.map((x) => x.uid)).size >= memberCount;

  return {
    monthKey,
    inc,
    out,
    saved,
    pIn,
    pOut: sum((c) => c.pOut),
    pSave: sum((c) => c.pSave),
    toPay,
    free,
    freeBasis,
    shared: all.filter(isShared),
    unmatched: all.filter((r) => !isShared(r)),
    uncategorizedOut: sum((c) => c.uncategorizedOut),
    per,
  };
}

export interface MergeSuggestion {
  /** Canonical key (kept) and the key merged into it. */
  keep: string;
  merge: string;
  keepName: string;
  mergeName: string;
  keepOwner: string;
  mergeOwner: string;
}

function tokens(key: string): string[] {
  return key.split(' ').filter((w) => w.length >= 4);
}

export function pairId(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Suggest merging two partners' rubrics that probably mean the same thing
 * ("Soutien famille" / "Aide famille"): they share a significant word or icon.
 */
export function suggestMerges(
  members: MemberData[],
  merges: Record<string, string> = {},
  dismissed: string[] = []
): MergeSuggestion[] {
  if (members.length < 2) return [];
  const byMember = members.map((m) => ({
    m,
    cats: m.categories
      .filter((c) => !c.archived && c.kind !== 'in')
      .map((c) => ({ c, key: familyKey(c.name, merges) })),
  }));
  const keysOf = (i: number) => new Set(byMember[i].cats.map((x) => x.key));
  const out: MergeSuggestion[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < byMember.length; i++) {
    for (let j = i + 1; j < byMember.length; j++) {
      const ki = keysOf(i);
      const kj = keysOf(j);
      byMember[i].cats.forEach((a) => {
        if (kj.has(a.key)) return; // already matched
        byMember[j].cats.forEach((b) => {
          if (ki.has(b.key) || a.key === b.key) return;
          const id = pairId(a.key, b.key);
          if (seen.has(id) || dismissed.includes(id)) return;
          const ta = tokens(a.key);
          const common = tokens(b.key).some((t) => ta.includes(t));
          if (!common && a.c.icon !== b.c.icon) return;
          seen.add(id);
          const meFirst = byMember[i].m.me || !byMember[j].m.me;
          const [keep, merge] = meFirst ? [a, b] : [b, a];
          const [keepOwner, mergeOwner] = meFirst
            ? [byMember[i].m.name, byMember[j].m.name]
            : [byMember[j].m.name, byMember[i].m.name];
          out.push({
            keep: keep.key,
            merge: merge.key,
            keepName: keep.c.name,
            mergeName: merge.c.name,
            keepOwner,
            mergeOwner,
          });
        });
      });
    }
  }
  return out;
}

/** Add a merge to the household mapping (both names now point to `keep`). */
export function addMerge(merges: Record<string, string>, keep: string, merge: string): Record<string, string> {
  const next: Record<string, string> = {};
  Object.entries(merges).forEach(([k, v]) => (next[k] = v === merge ? keep : v));
  next[merge] = keep;
  delete next[keep];
  return next;
}

export function removeMerge(merges: Record<string, string>, merged: string): Record<string, string> {
  const next = { ...merges };
  delete next[merged];
  return next;
}
