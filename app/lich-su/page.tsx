"use client";

import { useEffect, useState } from "react";
import { Match, MatchInput, getAllMatches, updateMatch, deleteMatch } from "@/lib/firestore";
import { Member, getAllMembers } from "@/lib/members";
import MatchCard from "@/components/MatchCard";
import MatchForm from "@/components/MatchForm";
import PageHeader from "@/components/PageHeader";
import DoubleSummary from "@/components/DoubleSummary";

function formatDateVN(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const date = new Date(`${y}-${m}-${d}`);
  const dow = days[date.getDay()];
  return `${dow}, ${d}/${m}/${y}`;
}

export default function LichSuPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Match | null>(null);

  const load = async () => {
    setLoading(true);
    const [all, mems] = await Promise.all([getAllMatches(), getAllMembers()]);
    setMatches(all);
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by date, sorted desc
  const byDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  const handleEdit = async (data: MatchInput) => {
    if (!editing) return;
    await updateMatch(editing.id, data);
    await load();
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMatch(id);
    await load();
  };

  if (editing) {
    return (
      <div className="scroll-ios overflow-y-auto h-full">
        <div
          className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 text-center"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <h1 className="text-lg font-bold">Sửa trận đấu</h1>
        </div>
        <div className="p-4">
          <MatchForm
            initial={editing}
            members={members}
            onSave={handleEdit}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-ios overflow-y-auto h-full">
      <PageHeader title="Lịch sử thi đấu" />

      <div className="p-4 flex flex-col gap-6">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Đang tải...</div>
        ) : dates.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">Chưa có dữ liệu</p>
          </div>
        ) : (
          dates.map((date) => {
            const dayMatches = byDate[date].sort(
              (a, b) => a.createdAt.seconds - b.createdAt.seconds
            );
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-sm font-semibold text-gray-500">{formatDateVN(date)}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="flex flex-col gap-2">
                  {dayMatches.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      index={i + 1}
                      onEdit={() => setEditing(m)}
                      onDelete={() => {
                        if (window.confirm("Xoá trận này?")) handleDelete(m.id);
                      }}
                    />
                  ))}
                  <DoubleSummary matches={dayMatches} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
