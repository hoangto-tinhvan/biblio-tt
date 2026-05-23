"use client";

import { useEffect, useRef, useState } from "react";
import { Match, getWinner } from "@/lib/firestore";
import { REACTIONS, ReactionType, countReactions, getDeviceId, setReaction } from "@/lib/reactions";
import { useData } from "@/contexts/DataContext";

interface Props {
  match: Match;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

const lastName = (name: string) => name.trim().split(" ").pop() ?? name;

export default function MatchCard({ match, onEdit, onDelete, index }: Props) {
  const { refresh } = useData();
  const team1Label = match.team1.map(lastName).join(" & ");
  const team2Label = match.team2.map(lastName).join(" & ");
  const team1Wins = match.sets1 > match.sets2;

  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);
  const lastTap = useRef<number>(0);

  const deviceId = typeof window !== "undefined" ? getDeviceId() : "";
  const myReaction = (match.reactions?.[deviceId] ?? null) as ReactionType | null;
  const counts = countReactions(match.reactions);
  const hasReactions = Object.keys(match.reactions ?? {}).length > 0;

  // Long-press detection
  const startPress = () => {
    moved.current = false;
    pressTimer.current = setTimeout(() => {
      if (!moved.current) {
        setShowPicker(true);
        if (navigator.vibrate) navigator.vibrate(40);
      }
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const onMove = () => {
    moved.current = true;
    cancelPress();
  };

  useEffect(() => () => { if (pressTimer.current) clearTimeout(pressTimer.current); }, []);

  const handleReact = async (type: ReactionType) => {
    setShowPicker(false);
    setSaving(true);
    try {
      // Toggle: same reaction = remove, different = replace
      await setReaction(match.id, deviceId, myReaction === type ? null : type);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  // Double-tap → heart
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0;
      handleReact("heart");
    } else {
      lastTap.current = now;
    }
  };

  return (
    <div className="relative">
      {/* Reaction picker overlay */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onPointerDown={() => setShowPicker(false)}
          />
          {/* Picker */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-16 z-50 flex gap-1 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2">
            {REACTIONS.map(({ type, emoji, label }) => (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl active:scale-110 transition-transform
                  ${myReaction === type ? "bg-blue-50 ring-2 ring-blue-400" : "hover:bg-gray-50"}`}
              >
                <span className="text-2xl leading-none">{emoji}</span>
                <span className="text-[9px] text-gray-400 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Card */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden select-none transition-opacity ${saving ? "opacity-60" : ""}`}
        onTouchStart={startPress}
        onTouchEnd={(e) => { cancelPress(); handleTap(); }}
        onTouchMove={onMove}
        onMouseDown={startPress}
        onMouseUp={(e) => { cancelPress(); handleTap(); }}
        onMouseLeave={cancelPress}
        onContextMenu={(e) => { e.preventDefault(); setShowPicker(true); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {match.type === "don" ? "Đơn" : "Đôi"} {index !== undefined ? `#${index}` : ""}
          </span>
          <div className="flex gap-3">
            {onEdit && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onEdit}
                className="text-blue-500 text-sm font-medium active:opacity-70"
              >
                Sửa
              </button>
            )}
            {onDelete && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onDelete}
                className="text-red-400 text-sm font-medium active:opacity-70"
              >
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

        {/* Reactions bar */}
        {hasReactions && (
          <div className="flex items-center gap-1.5 px-4 pb-2.5 flex-wrap">
            {REACTIONS.filter(({ type }) => counts[type]).map(({ type, emoji }) => (
              <button
                key={type}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleReact(type)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all active:scale-95
                  ${myReaction === type
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"}`}
              >
                <span>{emoji}</span>
                <span>{counts[type]}</span>
              </button>
            ))}
            <span className="text-[10px] text-gray-300 ml-auto">giữ để thả cảm xúc</span>
          </div>
        )}
      </div>
    </div>
  );
}
