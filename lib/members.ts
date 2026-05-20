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

export interface Member {
  id: string;
  name: string;
  yearOfBirth?: number;
  phone?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}

export interface MemberInput {
  name: string;
  yearOfBirth?: number;
  phone?: string;
  avatarUrl?: string;
}

const COL = "members";

function clean(data: MemberInput) {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
}

export function compressToDataUrl(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export async function getAllMembers(): Promise<Member[]> {
  const db = await getDb();
  const q = query(collection(db, COL), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
}

export async function addMember(data: MemberInput): Promise<string> {
  const db = await getDb();
  const ref = await addDoc(collection(db, COL), {
    ...clean(data),
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateMember(id: string, data: MemberInput): Promise<void> {
  const db = await getDb();
  await updateDoc(doc(db, COL, id), clean(data));
}

export async function deleteMember(id: string): Promise<void> {
  const db = await getDb();
  await deleteDoc(doc(db, COL, id));
}
