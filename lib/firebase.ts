import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let initPromise: Promise<Firestore> | null = null;

async function initFirebase(): Promise<Firestore> {
  if (db) return db;

  const res = await fetch("/api/firebase-config");
  const config = await res.json();

  app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  db = getFirestore(app);
  return db;
}

export function getDb(): Promise<Firestore> {
  if (!initPromise) initPromise = initFirebase();
  return initPromise;
}
