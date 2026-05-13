"use client";

import { useState } from "react";
import { MatchInput, MatchType } from "@/lib/firestore";
import PlayerInput from "./PlayerInput";

interface Props {
  initial?: MatchInput;
  suggestions: string[];
  onSave: (data: MatchInput) => Promise<void>;
  onCancel: () => void;
}

type Score = "2-0" | "2-1";

const SCORE_OPTIONS: { value: Score; label: string }[] = [
  { value: "2-0", label: "2 – 0" },
  { value: "2-1", label: "2 – 1" },
];

export default function MatchForm({ initial, suggestions, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initial?.date ?? today);
  const [type, setType] = useState<MatchType>(initial?.type ?? "don");

  // team 1
  const [p1a, setP1a] = useState(initial?.team1[0] ?? "");
  const [p1b, setP1b] = useState(initial?.team1[1] ?? "");

  // team 2
  const [p2a, setP2a] = useState(initial?.team2[0] ?? "");
  const [p2b, setP2b] = useState(initial?.team2[1] ?? "");

  // who won and with what score
  const [winner, setWinner] = useState<"team1" | "team2">(
    initial ? (initial.sets1 > initial.sets2 ? "team1" : "team2") : "team1"
  );
  const [score, setScore] = useState<Score>(
    initial
      ? Math.min(initial.sets1, initial.sets2) === 1 ? "2-1" : "2-0"
      : "2-0"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    const players = type === "don"
      ? [p1a.trim(), p2a.trim()]
      : [p1a.trim(), p1b.trim(), p2a.trim(), p2b.trim()];

    if (players.some((p) => !p)) return "Vui lòng nhập đủ tên người chơi.";
    const set = new Set(players);
    if (set.size !== players.length) return "Tên người chơi bị trùng.";
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    const [winSets, loseSets] = score === "2-0" ? [2, 0] : [2, 1];
    const sets1 = winner === "team1" ? winSets : loseSets;
    const sets2 = winner === "team2" ? winSets : loseSets;

    await onSave({
      date,
      type,
      team1: type === "don" ? [p1a.trim()] : [p1a.trim(), p1b.trim()],
      team2: type === "don" ? [p2a.trim()] : [p2a.trim(), p2b.trim()],
      sets1,
      sets2,
    });
    setSaving(false);
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

      {/* Match type */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Loại trận</label>
        <div className="flex gap-2">
          {(["don", "doi"] as MatchType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
                type === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600"
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
        <PlayerInput value={p1a} onChange={setP1a} suggestions={suggestions} placeholder="Người chơi 1" />
        {type === "doi" && (
          <PlayerInput value={p1b} onChange={setP1b} suggestions={suggestions} placeholder="Người chơi 2" />
        )}

        <div className="border-t border-dashed border-gray-200 my-1" />

        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đội 2</p>
        <PlayerInput value={p2a} onChange={setP2a} suggestions={suggestions} placeholder="Người chơi 1" />
        {type === "doi" && (
          <PlayerInput value={p2b} onChange={setP2b} suggestions={suggestions} placeholder="Người chơi 2" />
        )}
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kết quả</p>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Đội thắng</label>
          <div className="flex gap-2">
            {(["team1", "team2"] as const).map((t) => {
              const label = t === "team1"
                ? (type === "don" ? p1a || "Đội 1" : `${p1a || "?"} & ${p1b || "?"}`)
                : (type === "don" ? p2a || "Đội 2" : `${p2a || "?"} & ${p2b || "?"}`);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWinner(t)}
                  className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all text-center ${
                    winner === t
                      ? "bg-green-500 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Tỉ số</label>
          <div className="flex gap-2">
            {SCORE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setScore(opt.value)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  score === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-base"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-base disabled:opacity-50 shadow-sm active:scale-95 transition-transform"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}
