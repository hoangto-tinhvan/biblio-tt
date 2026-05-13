"use client";

import { useState } from "react";
import { MatchInput, MatchType } from "@/lib/firestore";
import { Member } from "@/lib/members";
import PlayerSelect from "./PlayerSelect";

interface Props {
  initial?: MatchInput;
  members: Member[];
  onSave: (data: MatchInput) => Promise<void>;
  onCancel: () => void;
}

const SET_OPTIONS = [0, 1, 2, 3];

export default function MatchForm({ initial, members, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initial?.date ?? today);
  const [type, setType] = useState<MatchType>(initial?.type ?? "don");

  const [p1a, setP1a] = useState(initial?.team1[0] ?? "");
  const [p1b, setP1b] = useState(initial?.team1[1] ?? "");
  const [p2a, setP2a] = useState(initial?.team2[0] ?? "");
  const [p2b, setP2b] = useState(initial?.team2[1] ?? "");

  const [sets1, setSets1] = useState(initial?.sets1 ?? 2);
  const [sets2, setSets2] = useState(initial?.sets2 ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allPicked = [p1a, type === "doi" ? p1b : "", p2a, type === "doi" ? p2b : ""].filter(Boolean);

  const ln = (name: string) => name.trim().split(" ").pop() ?? name;
  const team1Label = type === "don" ? (p1a ? ln(p1a) : "Đội 1") : [p1a, p1b].filter(Boolean).map(ln).join(" & ") || "Đội 1";
  const team2Label = type === "don" ? (p2a ? ln(p2a) : "Đội 2") : [p2a, p2b].filter(Boolean).map(ln).join(" & ") || "Đội 2";

  const winnerLabel = sets1 > sets2 ? team1Label : sets2 > sets1 ? team2Label : null;

  const validate = () => {
    const players = type === "don" ? [p1a, p2a] : [p1a, p1b, p2a, p2b];
    if (players.some((p) => !p.trim())) return "Vui lòng chọn đủ người chơi.";
    if (new Set(players).size !== players.length) return "Người chơi bị trùng.";
    if (sets1 === sets2) return "Tỉ số phải có người thắng (không được hoà).";
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await onSave({
        date, type,
        team1: type === "don" ? [p1a] : [p1a, p1b],
        team2: type === "don" ? [p2a] : [p2a, p2b],
        sets1, sets2,
      });
    } catch (e) {
      setError("Lưu thất bại, thử lại.");
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Ngày</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Loại trận</label>
        <div className="flex gap-2">
          {(["don", "doi"] as MatchType[]).map((t) => (
            <button
              key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
                type === t ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {t === "don" ? "Đơn" : "Đôi"}
            </button>
          ))}
        </div>
      </div>

      {/* Players */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đội 1</p>
        <PlayerSelect value={p1a} onChange={setP1a} members={members}
          label={type === "doi" ? "Người 1" : undefined}
          exclude={allPicked.filter((n) => n !== p1a)} />
        {type === "doi" && (
          <PlayerSelect value={p1b} onChange={setP1b} members={members}
            label="Người 2"
            exclude={allPicked.filter((n) => n !== p1b)} />
        )}
        <div className="border-t border-dashed border-gray-200 my-1" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đội 2</p>
        <PlayerSelect value={p2a} onChange={setP2a} members={members}
          label={type === "doi" ? "Người 1" : undefined}
          exclude={allPicked.filter((n) => n !== p2a)} />
        {type === "doi" && (
          <PlayerSelect value={p2b} onChange={setP2b} members={members}
            label="Người 2"
            exclude={allPicked.filter((n) => n !== p2b)} />
        )}
      </div>

      {/* Score */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tỉ số (số set thắng)</p>

        <div className="flex items-center gap-3">
          {/* Team 1 score */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-gray-500 truncate w-full text-center">{team1Label}</span>
            <select
              value={sets1}
              onChange={(e) => setSets1(Number(e.target.value))}
              className="w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-3xl font-bold text-gray-900 py-3 focus:outline-none focus:border-blue-500"
            >
              {SET_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Dash */}
          <span className="text-2xl font-light text-gray-300 mb-0 mt-5">–</span>

          {/* Team 2 score */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-gray-500 truncate w-full text-center">{team2Label}</span>
            <select
              value={sets2}
              onChange={(e) => setSets2(Number(e.target.value))}
              className="w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-3xl font-bold text-gray-900 py-3 focus:outline-none focus:border-blue-500"
            >
              {SET_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Winner preview */}
        {winnerLabel ? (
          <div className="flex items-center justify-center gap-2 bg-green-50 rounded-xl py-2 px-3">
            <span className="text-green-600 text-sm font-semibold">🏆 {winnerLabel} thắng</span>
          </div>
        ) : sets1 === sets2 && (sets1 > 0) ? (
          <div className="flex items-center justify-center gap-2 bg-red-50 rounded-xl py-2 px-3">
            <span className="text-red-500 text-sm font-semibold">Tỉ số hoà — cần có người thắng</span>
          </div>
        ) : null}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-base">
          Huỷ
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-base disabled:opacity-50 shadow-sm active:scale-95 transition-transform">
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}
