// Sauvegarde locale (IndexedDB) : rien ne quitte le téléphone.
// Si le navigateur ferme la page pendant la prise de photo, les pages déjà
// scannées sont retrouvées au retour.

// Nom interne gardé (ancien nom de l'application) : les documents déjà
// enregistrés restent disponibles.
const DB = 'vraiscan', VER = 1;
let dbp;

function open() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = () => {
        r.result.createObjectStore('meta');
        r.result.createObjectStore('pages');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}

export const getMeta = (k) => tx('meta', 'readonly', s => s.get(k)).catch(() => undefined);
export const putMeta = (k, v) => tx('meta', 'readwrite', s => s.put(v, k)).catch(() => {});
export const getPage = (id) => tx('pages', 'readonly', s => s.get(id)).catch(() => undefined);
export const putPage = (p) => tx('pages', 'readwrite', s => s.put(p, p.id)).catch(() => {});
export const delPage = (id) => tx('pages', 'readwrite', s => s.delete(id)).catch(() => {});
export const clearPages = () => tx('pages', 'readwrite', s => s.clear()).catch(() => {});
