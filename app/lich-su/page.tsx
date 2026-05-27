"use client";

import { useState } from "react";
import { MatchInput, updateMatch, deleteMatch, Match } from "@/lib/firestore";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import MatchCard from "@/components/MatchCard";
import MatchForm from "@/components/MatchForm";
import PageHeader from "@/components/PageHeader";
import DoubleSummary from "@/components/DoubleSummary";

function formatDateVN(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dow = days[new Date(`${y}-${m}-${d}`).getDay()];
  return `${dow}, ${d}/${m}/${y}`;
}

export default function LichSuPage() {
  const { matches, members, loading, refresh } = useData();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Match | null>(null);
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());

  const byDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  const latestDate = dates[0];

  const isOpen = (date: string) => date === latestDate || openDates.has(date);

  const toggle = (date: string) => {
    if (date === latestDate) return; // latest always open
    setOpenDates((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  const handleEdit = async (data: MatchInput) => {
    if (!editing) return;
    const changedBy = user?.name && user.name !== editing.addedBy ? user.name : undefined;
    await updateMatch(editing.id, {
      ...data,
      addedBy: editing.addedBy,
      changedBy,
      commentBy: data.comment ? user?.name : undefined,
    });
    await refresh();
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMatch(id);
    await refresh();
  };

  if (editing) {
    return (
      <>
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 text-center"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <h1 className="text-lg font-bold">Sửa trận đấu</h1>
        </div>
        <div className="p-4">
          <MatchForm initial={editing} members={members}
            onSave={handleEdit} onCancel={() => setEditing(null)} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Lịch sử thi đấu" />
      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Đang tải...</div>
        ) : dates.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">Chưa có dữ liệu</p>
          </div>
        ) : dates.map((date) => {
          const dayMatches = byDate[date].sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
          const open = isOpen(date);
          const isLatest = date === latestDate;

          return (
            <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Date header — tappable for non-latest */}
              <button
                className={`w-full flex items-center justify-between px-4 py-3 ${isLatest ? "cursor-default" : "active:bg-gray-50"}`}
                onClick={() => toggle(date)}
                disabled={isLatest}
              >
                <span className="text-sm font-semibold text-gray-700">{formatDateVN(date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{dayMatches.length} trận</span>
                  {!isLatest && (
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  )}
                </div>
              </button>

              {/* Collapsible content */}
              {open && (
                <div className="px-3 pb-3 flex flex-col gap-2 border-t border-gray-50">
                  <div className="pt-2 flex flex-col gap-2">
                    {dayMatches.map((m, i) => (
                      <MatchCard key={m.id} match={m} index={i + 1}
                        onEdit={() => setEditing(m)}
                        onDelete={() => { if (window.confirm("Xoá trận này?")) handleDelete(m.id); }}
                      />
                    ))}
                  </div>
                  <DoubleSummary matches={dayMatches} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
