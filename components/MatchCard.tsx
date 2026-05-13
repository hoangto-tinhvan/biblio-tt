"use client";

import { Match, getWinner } from "@/lib/firestore";

interface Props {
  match: Match;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export default function MatchCard({ match, onEdit, onDelete, index }: Props) {
  const team1Label = match.team1.join(" & ");
  const team2Label = match.team2.join(" & ");
  const team1Wins = match.sets1 > match.sets2;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {match.type === "don" ? "Đơn" : "Đôi"} {index !== undefined ? `#${index}` : ""}
        </span>
        <div className="flex gap-3">
          {onEdit && (
            <button onClick={onEdit} className="text-blue-500 text-sm font-medium active:opacity-70">
              Sửa
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-red-400 text-sm font-medium active:opacity-70">
              Xoá
            </button>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Team 1 */}
        <div className={`flex-1 text-center ${team1Wins ? "" : "opacity-40"}`}>
          <p className={`font-semibold text-base leading-tight ${team1Wins ? "text-gray-900" : "text-gray-500"}`}>
            {team1Label}
          </p>
          {team1Wins && (
            <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              THẮNG
            </span>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 px-3">
          <span className={`text-2xl font-bold tabular-nums ${team1Wins ? "text-gray-900" : "text-gray-400"}`}>
            {match.sets1}
          </span>
          <span className="text-gray-300 font-light text-xl">–</span>
          <span className={`text-2xl font-bold tabular-nums ${!team1Wins ? "text-gray-900" : "text-gray-400"}`}>
            {match.sets2}
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex-1 text-center ${!team1Wins ? "" : "opacity-40"}`}>
          <p className={`font-semibold text-base leading-tight ${!team1Wins ? "text-gray-900" : "text-gray-500"}`}>
            {team2Label}
          </p>
          {!team1Wins && (
            <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              THẮNG
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
