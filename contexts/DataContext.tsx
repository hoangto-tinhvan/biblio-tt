"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAllMatches, Match } from "@/lib/firestore";
import { getAllMembers, Member } from "@/lib/members";

interface DataCtx {
  matches: Match[];
  members: Member[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataCtx>({
  matches: [], members: [], loading: true, error: null, refresh: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [m, mem] = await Promise.all([getAllMatches(), getAllMembers()]);
      setMatches(m);
      setMembers(mem);
    } catch (e) {
      console.error("DataContext refresh failed:", e);
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Show a full-screen error with retry if initial load fails
  if (!loading && error) {
    return (
      <DataContext.Provider value={{ matches, members, loading, error, refresh }}>
        <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-8 z-50">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-800 font-semibold text-center mb-2">Không tải được dữ liệu</p>
          <p className="text-xs text-gray-400 text-center mb-6 font-mono">{error}</p>
          <button
            onClick={() => { setLoading(true); refresh().finally(() => setLoading(false)); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
          >
            Thử lại
          </button>
        </div>
      </DataContext.Provider>
    );
  }

  return (
    <DataContext.Provider value={{ matches, members, loading, error, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
