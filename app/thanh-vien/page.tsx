"use client";

import { useState } from "react";
import { Member, MemberInput, addMember, updateMember, deleteMember, compressToDataUrl } from "@/lib/members";
import { useData } from "@/contexts/DataContext";
import { computePlayerStats } from "@/lib/stats";
import Avatar from "@/components/Avatar";
import MemberForm from "@/components/MemberForm";
import PageHeader from "@/components/PageHeader";

type View = "list" | "add" | "edit" | "detail";
const currentYear = new Date().getFullYear();

export default function ThanhVienPage() {
  const { members, matches, loading, refresh } = useData();
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Member | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);

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
    setView("list");
    setSelected(null);
  };

  // --- Form views ---
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

  // --- Detail view ---
  if (view === "detail" && selected) {
    const playerStats = computePlayerStats(matches);
    const stats = playerStats.find((p) => p.name === selected.name);

    return (
      <>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 flex items-center gap-3"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "1rem" }}>
          <button onClick={() => { setView("list"); setSelected(null); }}
            className="text-blue-500 font-medium text-sm flex items-center gap-1">
            ‹ Quay lại
          </button>
          <h1 className="flex-1 text-center text-lg font-bold pr-16">Hồ sơ</h1>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-3 pt-2">
            {selected.avatarUrl ? (
              <img
                src={selected.avatarUrl}
                alt={selected.name}
                className="w-2/3 aspect-square rounded-full object-cover shadow-xl border-4 border-white ring-2 ring-gray-100"
              />
            ) : (
              <AvatarLarge name={selected.name} />
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
              {selected.yearOfBirth && (
                <p className="text-gray-400 mt-0.5">
                  Sinh {selected.yearOfBirth} · {currentYear - selected.yearOfBirth} tuổi
                </p>
              )}
              {selected.phone && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-gray-600 text-sm font-medium">{selected.phone}</span>
                  <a
                    href={`tel:${selected.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform shadow-sm"
                  >
                    📞 Gọi
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats card */}
          {stats ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Thống kê trận đơn</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <StatCell label="Số trận" value={stats.matches} />
                <StatCell label="Thắng" value={stats.wins} color="text-green-600" />
                <StatCell label="Thua" value={stats.losses} color="text-red-400" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.score.toFixed(1)}</p>
                <p className="text-xs text-gray-400 mt-0.5">điểm (thắng 5đ · thua 1đ)</p>
              </div>
              {/* score bar: map 1.0–5.0 → 0–100% */}
              <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${((stats.score - 1) / 4) * 100}%` }} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400 text-sm">
              Chưa có trận đơn nào
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setEditing(selected); setView("edit"); }}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm active:scale-95 transition-transform"
            >
              Sửa thông tin
            </button>
            <button
              onClick={() => handleDelete(selected)}
              className="flex-1 py-3 rounded-2xl bg-red-50 text-red-500 font-semibold text-sm active:scale-95 transition-transform"
            >
              Xoá
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- List view ---
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
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => { setSelected(m); setView("detail"); }}
          >
            <Avatar name={m.name} avatarUrl={m.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-base">{m.name}</p>
              {m.yearOfBirth && (
                <p className="text-sm text-gray-400 mt-0.5">Sinh {m.yearOfBirth} · {currentYear - m.yearOfBirth} tuổi</p>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setEditing(m); setView("edit"); }} className="text-blue-500 text-sm font-medium px-1 py-1">Sửa</button>
              <button onClick={() => handleDelete(m)} className="text-red-400 text-sm font-medium px-1 py-1">Xoá</button>
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

// Large avatar fallback with initials
function AvatarLarge({ name }: { name: string }) {
  const COLORS = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  const color = COLORS[h % COLORS.length];
  const initials = name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`w-2/3 aspect-square rounded-full ${color} flex items-center justify-center text-white font-bold shadow-xl`}
      style={{ fontSize: "clamp(3rem, 15vw, 6rem)" }}>
      {initials}
    </div>
  );
}

function StatCell({ label, value, color = "text-gray-900" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
