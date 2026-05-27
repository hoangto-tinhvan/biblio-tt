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
  handicapGiver?: 1 | 2;   // which team gives the handicap
  handicapBalls?: number;   // how many balls
  comment?: string;
  commentBy?: string;       // member name who wrote the comment
  addedBy?: string;         // member name who created the match
  changedBy?: string;       // member name who last edited (if different from addedBy)
  createdAt: Timestamp;
  reactions?: Record<string, string>; // { [deviceId]: ReactionType }
}

export interface MatchInput {
  date: string;
  type: MatchType;
  team1: string[];
  team2: string[];
  sets1: number;
  sets2: number;
  handicapGiver?: 1 | 2;
  handicapBalls?: number;
  comment?: string;
  commentBy?: string;
  addedBy?: string;
  changedBy?: string;
}

const COL = "matches";

function clean<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function addMatch(data: MatchInput): Promise<string> {
  const db = await getDb();
  const ref = await addDoc(collection(db, COL), {
    ...clean(data),
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateMatch(id: string, data: MatchInput): Promise<void> {
  const db = await getDb();
  await updateDoc(doc(db, COL, id), clean(data));
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
