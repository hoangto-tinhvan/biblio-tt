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

export interface H2HStats {
  player1: string;
  player2: string;
  matches: number;
  wins1: number;
  wins2: number;
  winRate1: number; // %
  winRate2: number; // %
  handicap: number; // balls stronger gives weaker
  stronger: string | null; // who gives handicap (null if even)
}

export function computeH2HStats(matches: Match[]): H2HStats[] {
  // Only singles
  const singles = matches.filter((m) => m.type === "don");

  // key = sorted player names
  const map = new Map<string, { p1: string; p2: string; wins1: number; wins2: number }>();

  for (const m of singles) {
    const [a, b] = [m.team1[0], m.team2[0]];
    const key = [a, b].sort().join("|||");
    const [p1, p2] = key.split("|||");

    if (!map.has(key)) map.set(key, { p1, p2, wins1: 0, wins2: 0 });
    const entry = map.get(key)!;

    const winner = m.sets1 > m.sets2 ? m.team1[0] : m.team2[0];
    if (winner === p1) entry.wins1++;
    else entry.wins2++;
  }

  return Array.from(map.values())
    .map(({ p1, p2, wins1, wins2 }) => {
      const total = wins1 + wins2;
      const wr1 = total > 0 ? Math.round((wins1 / total) * 100) : 50;
      const wr2 = 100 - wr1;
      const diff = Math.abs(wr1 - wr2); // 0-100
      // Handicap: each 10% diff ≈ 1 ball, capped at 8
      const handicap = Math.min(8, Math.round(diff / 10));
      const stronger = diff < 10 ? null : wr1 > wr2 ? p1 : p2;
      return { player1: p1, player2: p2, matches: total, wins1, wins2, winRate1: wr1, winRate2: wr2, handicap, stronger };
    })
    .filter((s) => s.matches > 0)
    .sort((a, b) => b.matches - a.matches);
}

export function getKnownPlayers(matches: Match[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    for (const p of [...m.team1, ...m.team2]) set.add(p);
  }
  return Array.from(set).sort();
}
