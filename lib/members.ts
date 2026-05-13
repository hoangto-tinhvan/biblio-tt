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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDb, getStorageInstance } from "./firebase";

export interface Member {
  id: string;
  name: string;
  yearOfBirth?: number;
  avatarUrl?: string;
  createdAt: Timestamp;
}

export interface MemberInput {
  name: string;
  yearOfBirth?: number;
  avatarUrl?: string;
}

const COL = "members";

export async function uploadAvatar(memberId: string, file: File): Promise<string> {
  const storage = await getStorageInstance();
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `avatars/${memberId}.${ext}`);
  const compressed = await compressImage(file, 400);
  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}

async function compressImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8);
    };
    img.src = url;
  });
}

export async function getAllMembers(): Promise<Member[]> {
  const db = await getDb();
  const q = query(collection(db, COL), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
}

function clean(data: MemberInput) {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
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

export async function deleteMember(id: string, avatarUrl?: string): Promise<void> {
  const db = await getDb();
  await deleteDoc(doc(db, COL, id));
  if (avatarUrl?.includes("firebasestorage")) {
    try {
      const storage = await getStorageInstance();
      // extract path from URL
      const path = decodeURIComponent(avatarUrl.split("/o/")[1].split("?")[0]);
      await deleteObject(ref(storage, path));
    } catch {
      // ignore if avatar already gone
    }
  }
}
