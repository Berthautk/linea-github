import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { kv } from './store.mjs';

const scrypt = promisify(crypto.scrypt);
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const b64u = (buf) => Buffer.from(buf).toString('base64url');
export const rand = (n = 8) => crypto.randomBytes(n).toString('hex');
export const now = () => Date.now();

export function normUser(u) { return String(u || '').trim().toLowerCase(); }
export function validUser(u) { return /^[a-z0-9][a-z0-9._-]{2,23}$/.test(u); }
export function validPassword(p) { return typeof p === 'string' && p.length >= 6 && p.length <= 100; }

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function randomCode(len = 6) {
  const bytes = crypto.randomBytes(len); let s = '';
  for (let i = 0; i < len; i++) s += ALPHA[bytes[i] % ALPHA.length];
  return s;
}
export function recoveryCode() { return [randomCode(4), randomCode(4), randomCode(4)].join('-'); }

export async function hashPassword(pw, salt = crypto.randomBytes(16)) {
  const key = await scrypt(String(pw), salt, 32, SCRYPT);
  return { salt: b64u(salt), hash: b64u(key) };
}
export async function verifyPassword(pw, rec) {
  if (!rec || !rec.salt || !rec.hash) return false;
  const key = await scrypt(String(pw), Buffer.from(rec.salt, 'base64url'), 32, SCRYPT);
  const a = Buffer.from(rec.hash, 'base64url');
  return a.length === key.length && crypto.timingSafeEqual(a, key);
}

let secretCache = null;
async function secret() {
  if (secretCache) return secretCache;
  const store = kv('config');
  let s = await store.get('secret');
  if (!s) { s = { k: crypto.randomBytes(32).toString('base64url') }; await store.set('secret', s); s = (await store.get('secret')) || s; }
  secretCache = Buffer.from(s.k, 'base64url');
  return secretCache;
}
export function resetSecretCache() { secretCache = null; }

export async function signToken(payload, days = 60) {
  const body = b64u(JSON.stringify({ ...payload, exp: now() + days * 864e5 }));
  const sig = b64u(crypto.createHmac('sha256', await secret()).update(body).digest());
  return body + '.' + sig;
}
export async function verifyToken(token) {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const good = b64u(crypto.createHmac('sha256', await secret()).update(body).digest());
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let p; try { p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  return p && p.exp > now() ? p : null;
}
