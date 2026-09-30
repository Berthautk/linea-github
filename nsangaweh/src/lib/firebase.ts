import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  setDoc,
} from 'firebase/firestore';

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  fbSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  limit,
};

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

const LOCAL_STORAGE_KEY = 'nsangaweh-v1';
const LOCAL_CONFIG_KEY = 'nsangaweh-fb';
const LOCAL_HID_KEY = 'nsangaweh-hid';
const LOCAL_QUOTA_KEY = 'nsangaweh-quota';

export interface QuotaTracker {
  readsToday: number;
  writesToday: number;
  lastResetDay: string; // YYYY-MM-DD
}

export function getQuotaTracker(): QuotaTracker {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(LOCAL_QUOTA_KEY);
    if (raw) {
      const data: QuotaTracker = JSON.parse(raw);
      if (data.lastResetDay === today) {
        return data;
      }
    }
  } catch {}
  return { readsToday: 0, writesToday: 0, lastResetDay: today };
}

export function incrementQuota(type: 'read' | 'write', count = 1) {
  try {
    const tracker = getQuotaTracker();
    if (type === 'read') tracker.readsToday += count;
    else tracker.writesToday += count;
    localStorage.setItem(LOCAL_QUOTA_KEY, JSON.stringify(tracker));
  } catch {}
}

export function getStoredConfig(): FirebaseConfig | null {
  // 1. Check environment variables
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProj = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (envKey && envProj) {
    return {
      apiKey: envKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProj}.firebaseapp.com`,
      projectId: envProj,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProj}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined,
    };
  }

  // 2. Check localStorage custom configuration
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored Firebase config', e);
  }

  return null;
}

export function saveCustomConfig(config: FirebaseConfig) {
  localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
}

export function clearCustomConfig() {
  localStorage.removeItem(LOCAL_CONFIG_KEY);
}

export function parseConfigText(text: string): FirebaseConfig | null {
  const c: Record<string, string> = {};
  const re = /(\w+)\s*:\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    c[m[1]] = m[2];
  }
  try {
    const j = JSON.parse(text);
    if (j && typeof j === 'object') {
      Object.assign(c, j);
    }
  } catch {
    // not strict JSON, regex matched properties
  }
  return c.apiKey && c.projectId ? (c as unknown as FirebaseConfig) : null;
}

export function getStoredHouseholdId(): string {
  try {
    return localStorage.getItem(LOCAL_HID_KEY) || '';
  } catch {
    return '';
  }
}

export function saveStoredHouseholdId(hid: string) {
  try {
    if (hid) {
      localStorage.setItem(LOCAL_HID_KEY, hid);
    } else {
      localStorage.removeItem(LOCAL_HID_KEY);
    }
  } catch (e) {
    console.error('Error saving household ID', e);
  }
}

export function getStoredLocalLedger(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredLocalLedger(data: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local ledger', e);
  }
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function initFirebase(config: FirebaseConfig): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
} {
  if (!firebaseApp) {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(config);
    }

    try {
      // Use multi-tab offline persistence
      firestoreDb = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      firestoreDb = getFirestore(firebaseApp);
    }

    firebaseAuth = getAuth(firebaseApp);
  }
  return { app: firebaseApp, db: firestoreDb!, auth: firebaseAuth! };
}

export function getAuthErrorMessage(err: any): string {
  const code = (err && err.code) || '';
  if (/invalid-email/.test(code)) return 'Adresse e-mail invalide.';
  if (/weak-password/.test(code)) return 'Mot de passe trop court : 6 caractères au minimum.';
  if (/email-already/.test(code)) return 'Un compte existe déjà avec cette adresse. Utilisez « Se connecter ».';
  if (/user-not-found|wrong-password|invalid-credential|invalid-login/.test(code)) {
    return 'Adresse ou mot de passe incorrect.';
  }
  if (/network/.test(code)) return 'Pas de connexion internet. Réessayez.';
  if (/operation-not-allowed/.test(code)) {
    return 'La connexion par e-mail n’est pas activée dans Firebase (Authentication).';
  }
  if (/too-many/.test(code)) return 'Trop d’essais. Patientez quelques minutes.';
  return `Connexion impossible (${code || err.message || 'erreur'}).`;
}
