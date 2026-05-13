import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
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

export async function getStorageInstance(): Promise<FirebaseStorage> {
  if (_storage) return _storage;
  if (!initPromise) initPromise = initFirebase();
  const a = await initPromise;
  _storage = getStorage(a);
  return _storage;
}
