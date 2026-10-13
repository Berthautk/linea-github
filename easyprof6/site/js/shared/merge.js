// Fusion des données (partagée serveur + application). Règle : le plus récent gagne, enregistrement par enregistrement.
// Chaque enregistrement a un `id` et `u` (date de dernière modification, en ms). Une suppression est un enregistrement
// {id, deleted:true, u} conservé quelque temps (« pierre tombale ») pour que la suppression se propage aux autres appareils.

export const TOMBSTONE_MS = 90 * 864e5;

export function newer(a, b) { return (a && +a.u || 0) >= (b && +b.u || 0); }

export function mergeById(cur = [], inc = []) {
  const map = new Map();
  for (const r of cur) if (r && r.id != null) map.set(r.id, r);
  for (const r of inc) {
    if (!r || r.id == null) continue;
    const old = map.get(r.id);
    if (!old || (+r.u || 0) >= (+old.u || 0)) map.set(r.id, r);   // à date égale, la version reçue l'emporte (même résultat partout)
  }
  return [...map.values()];
}

export function prune(list, now = Date.now()) {
  return list.filter(r => !(r.deleted && now - (+r.u || 0) > TOMBSTONE_MS));
}

export function sameJSON(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/** meta = { rev, dept:{u,...}, teachers:[], classes:[], regul:[] } — le plus récent gagne par enregistrement ; `dept` est un seul enregistrement. */
export function mergeMeta(cur, inc) {
  const out = { ...cur };
  if (inc.dept && (+inc.dept.u || 0) > (+((cur.dept || {}).u) || 0)) out.dept = inc.dept;
  for (const k of ['teachers', 'classes', 'assign', 'regul']) out[k] = mergeById(cur[k] || [], inc[k] || []);
  return out;
}
