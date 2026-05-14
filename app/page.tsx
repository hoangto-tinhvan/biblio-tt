"use client";

import { useState } from "react";
import { MatchInput, addMatch, updateMatch, deleteMatch, Match } from "@/lib/firestore";
import { useData } from "@/contexts/DataContext";
import MatchCard from "@/components/MatchCard";
import MatchForm from "@/components/MatchForm";
import PageHeader from "@/components/PageHeader";
import DoubleSummary from "@/components/DoubleSummary";

type View = "list" | "add" | "edit";

function formatDateVN(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function HomePage() {
  const today = new Date().toISOString().split("T")[0];
  const { matches, members, loading, refresh } = useData();
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Match | null>(null);

  const todayMatches = matches
    .filter((m) => m.date === today)
    .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

  const handleAdd = async (data: MatchInput) => {
    await addMatch(data);
    await refresh();
    setView("list");
  };

  const handleEdit = async (data: MatchInput) => {
    if (!editing) return;
    await updateMatch(editing.id, data);
    await refresh();
    setView("list");
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMatch(id);
    await refresh();
  };

  if (view === "add" || view === "edit") {
    return (
      <>
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 text-center"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <h1 className="text-lg font-bold">{view === "add" ? "Thêm trận đấu" : "Sửa trận đấu"}</h1>
        </div>
        <div className="p-4">
          <MatchForm
            initial={editing ?? undefined}
            members={members}
            onSave={view === "add" ? handleAdd : handleEdit}
            onCancel={() => { setView("list"); setEditing(null); }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Hôm nay · ${formatDateVN(today)}`} />
      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Đang tải...</div>
        ) : todayMatches.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-5xl mb-3">🏓</p>
            <p className="font-medium">Chưa có trận nào hôm nay</p>
            <p className="text-sm mt-1">Nhấn + để thêm kết quả</p>
          </div>
        ) : (
          <>
            {todayMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i + 1}
                onEdit={() => { setEditing(m); setView("edit"); }}
                onDelete={() => { if (window.confirm("Xoá trận này?")) handleDelete(m.id); }}
              />
            ))}
            <DoubleSummary matches={todayMatches} />
          </>
        )}
      </div>

      <button
        onClick={() => { setEditing(null); setView("add"); }}
        className="fixed right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-3xl font-light flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >+</button>
    </>
  );
}
