"use client";

import { useState } from "react";
import { Member } from "@/lib/members";
import Avatar from "./Avatar";

const GUEST = "__guest__";

interface Props {
  value: string;
  onChange: (v: string) => void;
  members: Member[];
  label?: string;
  exclude?: string[]; // names already picked
}

export default function PlayerSelect({ value, onChange, members, label, exclude = [] }: Props) {
  const [showGuest, setShowGuest] = useState(value !== "" && !members.find((m) => m.name === value));

  const isGuest = showGuest || (value !== "" && !members.find((m) => m.name === value));
  const selectedMember = members.find((m) => m.name === value);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === GUEST) {
      setShowGuest(true);
      onChange("");
    } else {
      setShowGuest(false);
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-sm font-medium text-gray-600">{label}</label>}

      {!isGuest ? (
        <div className="relative">
          <select
            value={selectedMember ? value : ""}
            onChange={handleSelect}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          >
            <option value="" disabled>Chọn người chơi...</option>
            {members
              .filter((m) => !exclude.includes(m.name))
              .map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            <option value={GUEST}>Khác (giao hữu)...</option>
          </select>
          {/* Chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
          {/* Show selected avatar inline */}
          {selectedMember && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Avatar name={selectedMember.name} avatarUrl={selectedMember.avatarUrl} size="sm" />
            </span>
          )}
          {selectedMember && (
            <style>{`select { padding-left: 3rem !important; }`}</style>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tên khách giao hữu"
            autoFocus
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => { setShowGuest(false); onChange(""); }}
            className="px-3 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
