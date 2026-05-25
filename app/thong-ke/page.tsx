"use client";

import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Match } from "@/lib/firestore";
import { computePlayerStats, computePairStats, computeH2HStats, PlayerStats, PairStats, H2HStats } from "@/lib/stats";
import PageHeader from "@/components/PageHeader";

type Tab = "nguoi" | "cap" | "doi-khang";
const MEDALS = ["🥇", "🥈", "🥉"];
const ln = (name: string) => name.trim().split(" ").pop() ?? name;

// "YYYY-MM" → "Tháng M/YYYY"
function formatMonth(prefix: string) {
  const [y, m] = prefix.split("-");
  return `Tháng ${parseInt(m)}/${y}`;
}

function doubleStatsForMonth(matches: Match[], prefix: string) {
  const doubles = matches.filter((m) => m.type === "doi" && m.date.startsWith(prefix));
  const lossMap = new Map<string, number>();
  for (const m of doubles) {
    const losers = m.sets1 > m.sets2 ? m.team2 : m.team1;
    for (const p of losers) lossMap.set(p, (lossMap.get(p) ?? 0) + 1);
  }
  const losses = Array.from(lossMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  return { total: doubles.length, losses };
}

function allDoubleMonths(matches: Match[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.type === "doi") set.add(m.date.slice(0, 7));
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a)); // newest first
}

export default function ThongKePage() {
  const { matches, loading } = useData();
  const [tab, setTab] = useState<Tab>("nguoi");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const playerStats = computePlayerStats(matches);
  const pairStats = computePairStats(matches);
  const h2hStats = computeH2HStats(matches);
  const totalMatches = matches.length;
  const singleMatches = matches.filter((m) => m.type === "don").length;
  const doubleMatches = matches.filter((m) => m.type === "doi").length;

  const now = new Date();
  const currentPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = allDoubleMonths(matches);
  const activeMonth = selectedMonth ?? currentPrefix;
  const monthStats = doubleStatsForMonth(matches, activeMonth);
  const pastMonths = months.filter((m) => m !== currentPrefix);

  return (
    <>
      <PageHeader title="Thống kê" />

      {/* Double stats modal */}
      {selectedMonth !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedMonth(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 px-5 py-4 flex-shrink-0">
              <p className="text-white font-bold text-base">{formatMonth(activeMonth)}</p>
              <p className="text-white/80 text-sm mt-0.5">Thống kê trận đôi</p>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3">
              {/* Current month total */}
              <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-3">
                <span className="text-sm font-semibold text-blue-800">Tổng số trận đôi</span>
                <span className="text-2xl font-bold text-blue-600">{monthStats.total}</span>
              </div>

              {/* Losses list */}
              {monthStats.losses.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Số trận thua</p>
                  <div className="flex flex-col gap-2">
                    {monthStats.losses.map(({ name, count }, i) => (
                      <div key={name} className="flex items-center gap-3 px-1">
                        <span className="text-base w-6 text-center">{i === 0 ? "😓" : i === 1 ? "😕" : "😐"}</span>
                        <span className="flex-1 text-sm font-medium text-gray-800">{name}</span>
                        <span className="text-sm font-bold text-red-500">{count} thua</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-2">Chưa có trận đôi nào</p>
              )}

              {/* Past months */}
              {pastMonths.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Các tháng trước</p>
                    <div className="flex flex-col gap-1.5">
                      {pastMonths.map((prefix) => {
                        const s = doubleStatsForMonth(matches, prefix);
                        return (
                          <button
                            key={prefix}
                            onClick={() => setSelectedMonth(prefix)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-colors ${
                              activeMonth === prefix
                                ? "bg-blue-600 text-white"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span className="text-sm font-semibold">{formatMonth(prefix)}</span>
                            <span className={`text-sm font-bold ${activeMonth === prefix ? "text-white/80" : "text-blue-600"}`}>
                              {s.total} trận
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 pb-5 flex-shrink-0">
              <button
                onClick={() => setSelectedMonth(null)}
                className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm active:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-16">Đang tải...</div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{totalMatches}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Tổng trận</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{singleMatches}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Đơn</p>
            </div>
            <button
              onClick={() => setSelectedMonth(currentPrefix)}
              className="bg-white rounded-2xl border border-blue-200 shadow-sm p-3 text-center active:bg-blue-50 transition-colors"
            >
              <p className="text-2xl font-bold text-blue-600">{doubleMatches}</p>
              <p className="text-xs text-blue-500 mt-0.5 font-semibold">Đôi ↗</p>
            </button>
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
                      Chỉ tính trận đơn · Dựa trên 5 trận gần nhất
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
        <p className="text-xs text-gray-400 mt-0.5">{stat.matches} trận đơn · {stat.wins}W {stat.losses}L</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-blue-600">{stat.score.toFixed(1)}</p>
        <p className="text-xs text-gray-400">điểm</p>
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
  const { player1, player2, totalMatches, recentMatches, wins1, wins2, winRate1, winRate2, handicapText, stronger } = stat;

  const hasEnough = totalMatches >= 5;
  const handicapColor = !hasEnough
    ? "text-gray-400 bg-gray-50"
    : stronger === null
    ? "text-gray-600 bg-gray-100"
    : "text-orange-700 bg-orange-100";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2">
      {/* Players + record */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-base">{ln(player1)}</span>
        <span className="text-xs text-gray-400 font-medium">
          {recentMatches} trận gần nhất
          {totalMatches > recentMatches && <span className="text-gray-300"> / {totalMatches}</span>}
        </span>
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
        <div className="bg-blue-500 transition-all" style={{ width: `${winRate1}%` }} />
        <div className="bg-purple-400 transition-all" style={{ width: `${winRate2}%` }} />
      </div>

      {/* Win rates */}
      <div className="flex justify-between text-xs">
        <span className="text-blue-600 font-semibold">{winRate1}%</span>
        <span className="text-purple-500 font-semibold">{winRate2}%</span>
      </div>

      {/* Handicap suggestion */}
      <div className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-3 ${handicapColor}`}>
        <span className="text-sm">⚖️</span>
        <span className="text-xs font-semibold">{handicapText}</span>
      </div>
    </div>
  );
}
