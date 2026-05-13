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
import { db } from "./firebase";

export type MatchType = "don" | "doi";

export interface Match {
  id: string;
  date: string; // YYYY-MM-DD
  type: MatchType;
  team1: string[];
  team2: string[];
  sets1: number; // 0, 1, or 2
  sets2: number; // 0, 1, or 2
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

const MATCHES_COL = "matches";

export async function addMatch(data: MatchInput): Promise<string> {
  const ref = await addDoc(collection(db, MATCHES_COL), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateMatch(id: string, data: MatchInput): Promise<void> {
  await updateDoc(doc(db, MATCHES_COL, id), { ...data });
}

export async function deleteMatch(id: string): Promise<void> {
  await deleteDoc(doc(db, MATCHES_COL, id));
}

export async function getAllMatches(): Promise<Match[]> {
  const q = query(collection(db, MATCHES_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export function getWinner(m: Match): string[] {
  return m.sets1 > m.sets2 ? m.team1 : m.team2;
}

export function getLoser(m: Match): string[] {
  return m.sets1 > m.sets2 ? m.team2 : m.team1;
}
