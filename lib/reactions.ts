import { updateDoc, doc, deleteField } from "firebase/firestore";
import { getDb } from "./firebase";

export type ReactionType = "heart" | "laugh" | "angry" | "sad";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "heart",  emoji: "❤️", label: "Tim" },
  { type: "laugh",  emoji: "😂", label: "Cười sặc" },
  { type: "angry",  emoji: "😡", label: "Tức giận" },
  { type: "sad",    emoji: "😢", label: "Buồn" },
];

/** Persistent anonymous device ID stored in localStorage */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "biblio_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Set or remove a reaction.
 * reactions map: { [deviceId]: ReactionType }
 * Pass null to remove current device's reaction.
 */
export async function setReaction(
  matchId: string,
  deviceId: string,
  type: ReactionType | null,
): Promise<void> {
  const db = await getDb();
  const ref = doc(db, "matches", matchId);
  if (type === null) {
    await updateDoc(ref, { [`reactions.${deviceId}`]: deleteField() });
  } else {
    await updateDoc(ref, { [`reactions.${deviceId}`]: type });
  }
}

/** Count reactions grouped by type */
export function countReactions(reactions: Record<string, string> = {}): Partial<Record<ReactionType, number>> {
  const counts: Partial<Record<ReactionType, number>> = {};
  for (const type of Object.values(reactions)) {
    const t = type as ReactionType;
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
