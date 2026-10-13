// Stockage clé/valeur JSON. En production : Netlify Blobs. En test/développement : mémoire ou fichier.
import fs from 'node:fs';
import path from 'node:path';

let factory = null;
export function setStoreFactory(f) { factory = f; }

export function memoryFactory() {
  const stores = new Map();
  return (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      async get(k) { const v = m.get(k); return v === undefined ? null : JSON.parse(v); },
      async set(k, v) { m.set(k, JSON.stringify(v)); },
      async delete(k) { m.delete(k); },
      async list(prefix = '') { return [...m.keys()].filter(k => k.startsWith(prefix)); },
    };
  };
}

export function fileFactory(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = (n) => path.join(dir, n + '.json');
  const load = (n) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch { return {}; } };
  const save = (n, o) => fs.writeFileSync(file(n), JSON.stringify(o));
  return (name) => ({
    async get(k) { const o = load(name); return o[k] === undefined ? null : o[k]; },
    async set(k, v) { const o = load(name); o[k] = v; save(name, o); },
    async delete(k) { const o = load(name); delete o[k]; save(name, o); },
    async list(prefix = '') { return Object.keys(load(name)).filter(k => k.startsWith(prefix)); },
  });
}

function blobsFactory() {
  let mod = null;
  return (name) => {
    const store = async () => { mod = mod || await import('@netlify/blobs'); return mod.getStore({ name, consistency: 'strong' }); };
    return {
      async get(k) { return (await store()).get(k, { type: 'json' }); },
      async set(k, v) { await (await store()).setJSON(k, v); },
      async delete(k) { await (await store()).delete(k); },
      async list(prefix = '') {
        const s = await store(); const out = [];
        for await (const page of s.list({ prefix, paginate: true })) for (const b of page.blobs) out.push(b.key);
        return out;
      },
    };
  };
}

export function kv(name) {
  if (!factory) factory = blobsFactory();
  return factory(name);
}
