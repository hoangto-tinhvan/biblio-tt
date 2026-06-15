import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let initPromise: Promise<FirebaseApp> | null = null;

async function initFirebase(): Promise<FirebaseApp> {
  if (app) return app;
  const res = await fetch("/api/firebase-config");
  if (!res.ok) throw new Error(`Firebase config fetch failed: ${res.status}`);
  const config = await res.json();
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
