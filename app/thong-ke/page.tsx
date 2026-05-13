"use client";

import { useEffect, useState } from "react";
import { getAllMatches, Match } from "@/lib/firestore";
import { computePlayerStats, computePairStats, PlayerStats, PairStats } from "@/lib/stats";
import PageHeader from "@/components/PageHeader";

type Tab = "nguoi" | "cap";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ThongKePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("nguoi");

  useEffect(() => {
    getAllMatches().then((m) => { setMatches(m); setLoading(false); });
  }, []);

  const playerStats = computePlayerStats(matches);
  const pairStats = computePairStats(matches);
  const totalMatches = matches.length;
  const singleMatches = matches.filter((m) => m.type === "don").length;
  const doubleMatches = matches.filter((m) => m.type === "doi").length;

  return (
    <div className="scroll-ios overflow-y-auto h-full">
      <PageHeader title="Thống kê" />

      {loading ? (
        <div className="text-center text-gray-400 py-16">Đang tải...</div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tổng trận", value: totalMatches },
              { label: "Đơn", value: singleMatches },
              { label: "Đôi", value: doubleMatches },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {([["nguoi", "Cá nhân"], ["cap", "Cặp đôi"]] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Player stats */}
          {tab === "nguoi" && (
            <div className="flex flex-col gap-2">
              {playerStats.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
              ) : (
                playerStats.map((p, i) => <PlayerRow key={p.name} stat={p} rank={i} />)
              )}
            </div>
          )}

          {/* Pair stats */}
          {tab === "cap" && (
            <div className="flex flex-col gap-2">
              {pairStats.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Chưa có trận đôi nào</p>
              ) : (
                pairStats.map((p, i) => <PairRow key={p.pair} stat={p} rank={i} />)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ stat, rank }: { stat: PlayerStats; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <span className="text-xl w-7 text-center">{MEDALS[rank] ?? `${rank + 1}`}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{stat.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stat.matches} trận · {stat.wins}W {stat.losses}L
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-blue-600">{stat.winRate}%</p>
        <p className="text-xs text-gray-400">thắng</p>
      </div>
    </div>
  );
}

function PairRow({ stat, rank }: { stat: PairStats; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <span className="text-xl w-7 text-center">{MEDALS[rank] ?? `${rank + 1}`}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{stat.pair}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stat.matches} trận · {stat.wins} thắng
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-blue-600">{stat.winRate}%</p>
        <p className="text-xs text-gray-400">thắng</p>
      </div>
    </div>
  );
}
