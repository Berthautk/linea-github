import { setServerTime } from './store.js';
export async function api(path, body, token) {
  let res;
  try {
    res = await fetch('/api' + path, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body || {}) });
  } catch (e) { throw Object.assign(new Error('Pas de connexion à Internet.'), { offline: true }); }
  const json = await res.json().catch(() => ({}));
  if (typeof json.now === 'number') setServerTime(json.now);
  if (!res.ok) throw Object.assign(new Error(json.message || 'Erreur'), { status: res.status, code: json.error });
  return json;
}
