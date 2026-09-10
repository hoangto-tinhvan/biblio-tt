import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let initPromise: Promise<FirebaseApp> | null = null;

// Inlined by Next at build time. A Firebase web config is not a secret — access
// is controlled by Firestore rules — so shipping it in the bundle removes a
// serverless round trip that otherwise blocks every read behind a cold start.
const INLINE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Cfg = Record<string, string | undefined>;

declare global {
  interface Window { __fbConfig?: Promise<Cfg | null> }
}

async function fetchConfig(): Promise<Cfg> {
  // The document head kicks this request off before the bundle finishes
  // parsing; reuse it rather than starting a second, later one.
  const early = typeof window !== "undefined" ? await window.__fbConfig : null;
  if (early?.apiKey) return early;

  const res = await fetch("/api/firebase-config");
  if (!res.ok) throw new Error(`Firebase config fetch failed: ${res.status}`);
  return res.json();
}

async function initFirebase(): Promise<FirebaseApp> {
  if (app) return app;
  // Prefer a build-inlined config; otherwise go over the network.
  const config: Cfg = INLINE_CONFIG.apiKey ? INLINE_CONFIG : await fetchConfig();
  if (!config.apiKey) throw new Error("Firebase config missing apiKey");
  app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  return app;
}

export async function getDb(): Promise<Firestore> {
  if (_db) return _db;
  if (!initPromise) initPromise = initFirebase();
  try {
    const a = await initPromise;
    _db = getFirestore(a);
    return _db;
  } catch (e) {
    // Reset so the next call retries instead of getting the same rejected promise
    initPromise = null;
    throw e;
  }
}

// Kick off Firebase init eagerly on module load (client only).
if (typeof window !== "undefined") {
  initPromise = initFirebase().catch(() => {
    initPromise = null; // allow retry
    return Promise.reject(new Error("Firebase eager init failed"));
  });
}
