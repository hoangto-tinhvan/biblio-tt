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

/** Rename a player across all match records. Returns number of updated matches. */
export async function renamePlayerInMatches(oldName: string, newName: string): Promise<number> {
  const db = await getDb();
  const snap = await getDocs(collection(db, COL));
  const updates: Promise<void>[] = [];

  for (const d of snap.docs) {
    const data = d.data() as Match;
    const t1 = data.team1.map((p) => (p === oldName ? newName : p));
    const t2 = data.team2.map((p) => (p === oldName ? newName : p));
    const addedBy = data.addedBy === oldName ? newName : data.addedBy;
    const changedBy = data.changedBy === oldName ? newName : data.changedBy;
    const commentBy = data.commentBy === oldName ? newName : data.commentBy;

    const changed =
      JSON.stringify(t1) !== JSON.stringify(data.team1) ||
      JSON.stringify(t2) !== JSON.stringify(data.team2) ||
      addedBy !== data.addedBy || changedBy !== data.changedBy || commentBy !== data.commentBy;

    if (changed) {
      updates.push(updateDoc(doc(db, COL, d.id), clean({ team1: t1, team2: t2, addedBy, changedBy, commentBy })));
    }
  }

  await Promise.all(updates);
  return updates.length;
}

export async function getAllMatches(): Promise<Match[]> {
  const db = await getDb();
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export function getWinner(m: Match): string[] {
  if (m.sets1 === m.sets2) return [];
  return m.sets1 > m.sets2 ? m.team1 : m.team2;
}

export function getLoser(m: Match): string[] {
  if (m.sets1 === m.sets2) return [];
  return m.sets1 > m.sets2 ? m.team2 : m.team1;
}
