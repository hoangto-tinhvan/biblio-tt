import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";

export type MatchType = "don" | "doi";

export interface Match {
  id: string;
  date: string;
  type: MatchType;
  team1: string[];
  team2: string[];
  sets1: number;
  sets2: number;
  createdAt: Timestamp;
}

export interface MatchInput {
  date: string;
  type: MatchType;
  team1: string[];
  team2: string[];
  sets1: number;
  sets2: number;
}

const COL = "matches";

export async function addMatch(data: MatchInput): Promise<string> {
  const db = await getDb();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateMatch(id: string, data: MatchInput): Promise<void> {
  const db = await getDb();
  await updateDoc(doc(db, COL, id), { ...data });
}

export async function deleteMatch(id: string): Promise<void> {
  const db = await getDb();
  await deleteDoc(doc(db, COL, id));
}

export async function getAllMatches(): Promise<Match[]> {
  const db = await getDb();
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export function getWinner(m: Match): string[] {
  return m.sets1 > m.sets2 ? m.team1 : m.team2;
}

export function getLoser(m: Match): string[] {
  return m.sets1 > m.sets2 ? m.team2 : m.team1;
}
