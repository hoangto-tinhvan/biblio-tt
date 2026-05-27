"use client";

import { useCallback, useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { AuthContext, AuthUser } from "@/contexts/AuthContext";

const SESSION_KEY = "biblio_user";
const ADMIN_PIN = "0111";
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

function setThemeColor(light: boolean) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = light ? "#ffffff" : "#111827";
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { members, loading } = useData();

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? { name: stored } : null;
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setThemeColor(!!user);
  }, [user]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const handleKey = (key: string) => {
    if (key === "") return;
    if (key === "⌫") {
      setInput((p) => p.slice(0, -1));
      setError("");
      return;
    }
    const next = input + key;
    setInput(next);

    if (next.length === 4) {
      // Find member whose phone ends with these 4 digits
      // Admin PIN bypass
      if (next === ADMIN_PIN) {
        sessionStorage.setItem(SESSION_KEY, "Admin");
        setThemeColor(true);
        setUser({ name: "Admin" });
        return;
      }
      // Find member whose phone ends with these 4 digits
      const match = members.find(
        (m) => m.phone && m.phone.replace(/\D/g, "").slice(-4) === next
      );
      if (match) {
        sessionStorage.setItem(SESSION_KEY, match.name);
        setThemeColor(true);
        setUser({ name: match.name });
      } else {
        setError("Số điện thoại không khớp với thành viên nào");
        setShake(true);
        setTimeout(() => {
          setInput("");
          setShake(false);
          setError("");
        }, 700);
      }
    }
  };

  if (user) {
    return (
      <AuthContext.Provider value={{ user, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Auth screen
  return (
    <div
      className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[999] select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Logo + title */}
      <img src="/logo.avif" alt="logo" className="w-20 h-20 object-contain mb-2" />
      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
        CLB Bóng bàn BIBLIO
      </p>
      <p className="text-white text-lg font-semibold mb-1">Nhập 4 số cuối SĐT</p>
      {loading ? (
        <p className="text-white/40 text-xs mb-8">Đang tải danh sách thành viên...</p>
      ) : members.filter((m) => m.phone).length === 0 ? (
        <p className="text-orange-400 text-xs text-center px-8 mb-8">
          Chưa có thành viên nào có số điện thoại.{"\n"}Nhờ admin thêm SĐT vào hồ sơ thành viên.
        </p>
      ) : (
        <p className="text-white/40 text-xs mb-8">để xác định bạn là ai</p>
      )}

      {/* Dots */}
      <div className={`flex gap-4 mb-3 ${shake ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < input.length ? "bg-white border-white" : "border-white/40 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      <p className="text-red-400 text-xs h-5 mb-5 text-center px-6">
        {error}
      </p>

      {/* Numpad */}
      <div className="flex flex-col gap-4">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-6 justify-center">
            {row.map((key, ki) => (
              <button
                key={ki}
                onClick={() => handleKey(key)}
                disabled={key === "" || loading}
                className={`w-20 h-20 rounded-full text-white font-semibold text-2xl transition-all active:scale-90 ${
                  key === ""
                    ? "invisible"
                    : key === "⌫"
                    ? "bg-white/10 text-xl active:bg-white/20"
                    : "bg-white/15 active:bg-white/30 disabled:opacity-40"
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
