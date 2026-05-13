"use client";

import { useEffect, useState } from "react";
import { Match, MatchInput, addMatch, updateMatch, deleteMatch, getAllMatches } from "@/lib/firestore";
import { getKnownPlayers } from "@/lib/stats";
import MatchCard from "@/components/MatchCard";
import MatchForm from "@/components/MatchForm";

type View = "list" | "add" | "edit";

function formatDateVN(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function HomePage() {
  const today = new Date().toISOString().split("T")[0];
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Match | null>(null);

  const load = async () => {
    setLoading(true);
    const all = await getAllMatches();
    setMatches(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const todayMatches = matches
    .filter((m) => m.date === today)
    .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

  const suggestions = getKnownPlayers(matches);

  const handleAdd = async (data: MatchInput) => {
    await addMatch(data);
    await load();
    setView("list");
  };

  const handleEdit = async (data: MatchInput) => {
    if (!editing) return;
    await updateMatch(editing.id, data);
    await load();
    setView("list");
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMatch(id);
    await load();
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="scroll-ios overflow-y-auto h-full">
        <div
          className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 text-center"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <h1 className="text-lg font-bold">
            {view === "add" ? "Thêm trận đấu" : "Sửa trận đấu"}
          </h1>
        </div>
        <div className="p-4">
          <MatchForm
            initial={editing ?? undefined}
            suggestions={suggestions}
            onSave={view === "add" ? handleAdd : handleEdit}
            onCancel={() => { setView("list"); setEditing(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-ios overflow-y-auto h-full">
      <div
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
      >
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest text-center">
          CLB Bóng bàn BIBLIO
        </p>
        <h1 className="text-xl font-bold text-center text-gray-900 mt-0.5">
          Hôm nay · {formatDateVN(today)}
        </h1>
      </div>

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
          todayMatches.map((m, i) => (
            <MatchCard
              key={m.id}
              match={m}
              index={i + 1}
              onEdit={() => { setEditing(m); setView("edit"); }}
              onDelete={() => {
                if (window.confirm("Xoá trận này?")) handleDelete(m.id);
              }}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditing(null); setView("add"); }}
        className="fixed right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-3xl font-light flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        +
      </button>
    </div>
  );
}
