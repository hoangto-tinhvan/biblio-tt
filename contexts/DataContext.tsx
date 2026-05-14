"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAllMatches, Match } from "@/lib/firestore";
import { getAllMembers, Member } from "@/lib/members";

interface DataCtx {
  matches: Match[];
  members: Member[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataCtx>({
  matches: [], members: [], loading: true, refresh: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [m, mem] = await Promise.all([getAllMatches(), getAllMembers()]);
    setMatches(m);
    setMembers(mem);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <DataContext.Provider value={{ matches, members, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
