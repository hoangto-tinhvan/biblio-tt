"use client";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  title: string;
}

const ln = (name: string) => name.trim().split(" ").pop() ?? name;

export default function PageHeader({ title }: Props) {
  const { user, logout } = useAuth();

  return (
    <div
      className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
    >
      <div className="flex items-center gap-2 justify-center relative">
        {/* CLB logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.avif" alt="CLB Bóng bàn BIBLIO" className="w-20 h-20 object-contain" />
        <div>
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">
            CLB Bóng bàn BIBLIO
          </p>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
        </div>

        {/* Current user + logout */}
        {user && (
          <button
            onClick={() => { if (window.confirm(`Đăng xuất khỏi tài khoản ${ln(user.name)}?`)) logout(); }}
            className="absolute right-0 flex flex-col items-end gap-0.5"
          >
            <span className="text-[10px] text-gray-400">Xin chào,</span>
            <span className="text-xs font-semibold text-blue-600">{ln(user.name)} ↩</span>
          </button>
        )}
      </div>
    </div>
  );
}
