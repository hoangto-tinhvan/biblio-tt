"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
}

export default function PlayerInput({ value, onChange, suggestions, placeholder, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Nhập tên"}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => { onChange(s); setOpen(false); }}
              className="px-4 py-3 text-base active:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
