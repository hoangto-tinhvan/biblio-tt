import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let initPromise: Promise<FirebaseApp> | null = null;

async function initFirebase(): Promise<FirebaseApp> {
  if (app) return app;
  const res = await fetch("/api/firebase-config");
  const config = await res.json();
  app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  return app;
}

export async function getDb(): Promise<Firestore> {
  if (_db) return _db;
  if (!initPromise) initPromise = initFirebase();
  const a = await initPromise;
  _db = getFirestore(a);
  return _db;
}

// Kick off Firebase init eagerly on module load (client only).
// By the time the first Firestore query runs, init is already done.
if (typeof window !== "undefined") {
  initPromise = initFirebase();
}
