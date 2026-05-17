"use client";

import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { computePlayerStats, computePairStats, computeH2HStats, PlayerStats, PairStats, H2HStats } from "@/lib/stats";
import PageHeader from "@/components/PageHeader";

type Tab = "nguoi" | "cap" | "doi-khang";
const MEDALS = ["🥇", "🥈", "🥉"];
const ln = (name: string) => name.trim().split(" ").pop() ?? name;

export default function ThongKePage() {
  const { matches, loading } = useData();
  const [tab, setTab] = useState<Tab>("nguoi");

  const playerStats = computePlayerStats(matches);
  const pairStats = computePairStats(matches);
  const h2hStats = computeH2HStats(matches);
  const totalMatches = matches.length;
  const singleMatches = matches.filter((m) => m.type === "don").length;
  const doubleMatches = matches.filter((m) => m.type === "doi").length;

  return (
    <>
      <PageHeader title="Thống kê" />
      {loading ? (
        <div className="text-center text-gray-400 py-16">Đang tải...</div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tổng trận", value: totalMatches },
              { label: "Đơn", value: singleMatches },
              { label: "Đôi", value: doubleMatches },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([
              ["nguoi", "Cá nhân"],
              ["cap", "Cặp đôi"],
              ["doi-khang", "Đối kháng"],
            ] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Cá nhân */}
          {tab === "nguoi" && (
            <div className="flex flex-col gap-2">
              {playerStats.length === 0
                ? <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
                : playerStats.map((p, i) => <PlayerRow key={p.name} stat={p} rank={i} />)}
            </div>
          )}

          {/* Cặp đôi */}
          {tab === "cap" && (
            <div className="flex flex-col gap-2">
              {pairStats.length === 0
                ? <p className="text-center text-gray-400 py-8">Chưa có trận đôi nào</p>
                : pairStats.map((p, i) => <PairRow key={p.pair} stat={p} rank={i} />)}
            </div>
          )}

          {/* Đối kháng */}
          {tab === "doi-khang" && (
            <div className="flex flex-col gap-2">
              {h2hStats.length === 0
                ? <p className="text-center text-gray-400 py-8">Chưa có trận đơn nào</p>
                : (
                  <>
                    <p className="text-xs text-gray-400 text-center px-2">
                      Chỉ tính trận đơn · Chấp = số bóng người mạnh hơn nên nhường
                    </p>
                    {h2hStats.map((s) => <H2HRow key={`${s.player1}-${s.player2}`} stat={s} />)}
                  </>
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PlayerRow({ stat, rank }: { stat: PlayerStats; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <span className="text-xl w-7 text-center">{MEDALS[rank] ?? `${rank + 1}`}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{stat.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{stat.matches} trận · {stat.wins}W {stat.losses}L</p>
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
        <p className="text-xs text-gray-400 mt-0.5">{stat.matches} trận · {stat.wins} thắng</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-blue-600">{stat.winRate}%</p>
        <p className="text-xs text-gray-400">thắng</p>
      </div>
    </div>
  );
}

function H2HRow({ stat }: { stat: H2HStats }) {
  const { player1, player2, matches, wins1, wins2, winRate1, winRate2, handicap, stronger } = stat;

  // bar widths
  const bar1 = winRate1;
  const bar2 = winRate2;

  const handicapLabel = stronger === null
    ? "Ngang cơ"
    : `${ln(stronger)} chấp ${handicap} bóng`;

  const handicapColor = stronger === null
    ? "text-gray-500 bg-gray-100"
    : "text-orange-700 bg-orange-100";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2">
      {/* Players + record */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-base">{ln(player1)}</span>
        <span className="text-xs text-gray-400 font-medium">{matches} trận</span>
        <span className="font-semibold text-gray-900 text-base">{ln(player2)}</span>
      </div>

      {/* Win counts */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-600 font-bold">{wins1}W</span>
        <span className="text-gray-300 text-xs">vs</span>
        <span className="text-blue-600 font-bold">{wins2}W</span>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-blue-500 transition-all" style={{ width: `${bar1}%` }} />
        <div className="bg-purple-400 transition-all" style={{ width: `${bar2}%` }} />
      </div>

      {/* Win rates */}
      <div className="flex justify-between text-xs text-gray-500">
        <span className="text-blue-600 font-semibold">{winRate1}%</span>
        <span className="text-purple-500 font-semibold">{winRate2}%</span>
      </div>

      {/* Handicap suggestion */}
      <div className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-3 ${handicapColor}`}>
        <span className="text-sm">⚖️</span>
        <span className="text-xs font-semibold">{handicapLabel}</span>
      </div>
    </div>
  );
}
