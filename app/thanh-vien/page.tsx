"use client";

import { useState } from "react";
import { Member, MemberInput, addMember, updateMember, deleteMember, compressToDataUrl } from "@/lib/members";
import { useData } from "@/contexts/DataContext";
import Avatar from "@/components/Avatar";
import MemberForm from "@/components/MemberForm";
import PageHeader from "@/components/PageHeader";

type View = "list" | "add" | "edit";
const currentYear = new Date().getFullYear();

export default function ThanhVienPage() {
  const { members, loading, refresh } = useData();
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Member | null>(null);

  const handleSave = async (data: MemberInput, file?: File) => {
    let avatarUrl = data.avatarUrl;
    if (file) avatarUrl = await compressToDataUrl(file);

    if (view === "add") {
      await addMember({ ...data, avatarUrl });
    } else if (editing) {
      await updateMember(editing.id, { ...data, avatarUrl });
    }
    await refresh();
    setView("list");
    setEditing(null);
  };

  const handleDelete = async (m: Member) => {
    if (!window.confirm(`Xoá thành viên "${m.name}"?`)) return;
    await deleteMember(m.id);
    await refresh();
  };

  if (view === "add" || view === "edit") {
    return (
      <>
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 text-center"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <h1 className="text-lg font-bold">{view === "add" ? "Thêm thành viên" : "Sửa thông tin"}</h1>
        </div>
        <div className="p-4">
          <MemberForm initial={editing ?? undefined} onSave={handleSave}
            onCancel={() => { setView("list"); setEditing(null); }} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Thành viên" />
      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Đang tải...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-5xl mb-3">👥</p>
            <p className="font-medium">Chưa có thành viên nào</p>
            <p className="text-sm mt-1">Nhấn + để thêm</p>
          </div>
        ) : members.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <Avatar name={m.name} avatarUrl={m.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-base">{m.name}</p>
              {m.yearOfBirth && (
                <p className="text-sm text-gray-400 mt-0.5">Sinh {m.yearOfBirth} · {currentYear - m.yearOfBirth} tuổi</p>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => { setEditing(m); setView("edit"); }} className="text-blue-500 text-sm font-medium">Sửa</button>
              <button onClick={() => handleDelete(m)} className="text-red-400 text-sm font-medium">Xoá</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setEditing(null); setView("add"); }}
        className="fixed right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-3xl font-light flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >+</button>
    </>
  );
}
