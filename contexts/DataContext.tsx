"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAllMatches, Match } from "@/lib/firestore";
import { getAllMembers, Member } from "@/lib/members";
import { readCache, writeCache } from "@/lib/cache";

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
      // Members resolve independently of the 300+ match documents, so login
      // stops waiting on data it never needed.
      const membersPromise = getAllMembers().then((mem) => {
        setMembers(mem);
        writeCache("members", mem);
      });
      const matchesPromise = getAllMatches().then((m) => {
        setMatches(m);
        writeCache("matches", m);
      });
      await Promise.all([membersPromise, matchesPromise]);
    } catch (e) {
      console.error("DataContext refresh failed:", e);
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    }
  }, []);

  useEffect(() => {
    // Paint from the previous session's cache first, then revalidate.
    const cachedMatches = readCache<Match[]>("matches");
    const cachedMembers = readCache<Member[]>("members");
    if (cachedMatches) setMatches(cachedMatches);
    if (cachedMembers) setMembers(cachedMembers);
    if (cachedMatches || cachedMembers) setLoading(false);

    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Only take over the screen when the fetch failed AND there is no cached
  // copy to fall back on — otherwise stale data beats an error wall.
  if (!loading && error && matches.length === 0 && members.length === 0) {
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
