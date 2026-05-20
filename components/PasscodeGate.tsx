"use client";

import { useEffect, useState } from "react";

const PASSCODE = "0404";
const SESSION_KEY = "biblio_unlocked";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export default function PasscodeGate({ children }: { children: React.ReactNode }) {
  // Read sessionStorage synchronously in the initializer — no null state, no blank frame
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) === "1";
  });
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setThemeColor(unlocked);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeColor = (light: boolean) => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = light ? "#ffffff" : "#111827";
  };

  const handleKey = (key: string) => {
    if (key === "") return;
    if (key === "⌫") {
      setInput((p) => p.slice(0, -1));
      return;
    }
    const next = input + key;
    setInput(next);

    if (next.length === 4) {
      if (next === PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setThemeColor(true);
        setUnlocked(true);
      } else {
        setShake(true);
        setTimeout(() => { setInput(""); setShake(false); }, 600);
      }
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[999] select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* Logo + title */}
      <img src="/logo.avif" alt="logo" className="w-20 h-20 object-contain mb-2" />
      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">CLB Bóng bàn BIBLIO</p>
      <p className="text-white text-lg font-semibold mb-8">Nhập mã PIN</p>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < input.length
                ? "bg-white border-white"
                : "border-white/40 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="flex flex-col gap-4">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-6 justify-center">
            {row.map((key, ki) => (
              <button
                key={ki}
                onClick={() => handleKey(key)}
                disabled={key === ""}
                className={`w-20 h-20 rounded-full text-white font-semibold text-2xl transition-all active:scale-90 ${
                  key === ""
                    ? "invisible"
                    : key === "⌫"
                    ? "bg-white/10 text-xl active:bg-white/20"
                    : "bg-white/15 active:bg-white/30"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
}
