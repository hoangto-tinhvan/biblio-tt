import { Match, getWinner, getLoser } from "./firestore";

export interface PlayerStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface PairStats {
  pair: string;
  matches: number;
  wins: number;
  winRate: number;
}

export function computePlayerStats(matches: Match[]): PlayerStats[] {
  const map = new Map<string, { matches: number; wins: number; losses: number }>();

  const ensure = (name: string) => {
    if (!map.has(name)) map.set(name, { matches: 0, wins: 0, losses: 0 });
    return map.get(name)!;
  };

  for (const m of matches) {
    const winners = getWinner(m);
    const losers = getLoser(m);
    for (const p of winners) {
      const s = ensure(p);
      s.matches++;
      s.wins++;
    }
    for (const p of losers) {
      const s = ensure(p);
      s.matches++;
      s.losses++;
    }
  }

  return Array.from(map.entries())
    .map(([name, s]) => ({
      name,
      ...s,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
}

export function computePairStats(matches: Match[]): PairStats[] {
  const map = new Map<string, { matches: number; wins: number }>();

  const pairKey = (players: string[]) => [...players].sort().join(" & ");

  const ensure = (key: string) => {
    if (!map.has(key)) map.set(key, { matches: 0, wins: 0 });
    return map.get(key)!;
  };

  for (const m of matches) {
    if (m.type !== "doi") continue;
    const k1 = pairKey(m.team1);
    const k2 = pairKey(m.team2);
    ensure(k1).matches++;
    ensure(k2).matches++;
    if (m.sets1 > m.sets2) {
      ensure(k1).wins++;
    } else {
      ensure(k2).wins++;
    }
  }

  return Array.from(map.entries())
    .map(([pair, s]) => ({
      pair,
      ...s,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
}

export function getKnownPlayers(matches: Match[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    for (const p of [...m.team1, ...m.team2]) set.add(p);
  }
  return Array.from(set).sort();
}
