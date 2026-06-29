import { Match, getWinner, getLoser } from "./firestore";

export interface PlayerStats {
  name: string;
  matches: number; // singles only
  wins: number;
  losses: number;
  score: number;   // (wins*5 + losses*1) / matches, range 1.0–5.0
}

// Win = 5 pts, Loss = 1 pt. Score = total pts / singles played.
// 100% win → 5.0, 0% win → 1.0
export function computePlayerStats(matches: Match[]): PlayerStats[] {
  const singles = matches.filter((m) => m.type === "don");
  const map = new Map<string, { wins: number; losses: number }>();

  const ensure = (name: string) => {
    if (!map.has(name)) map.set(name, { wins: 0, losses: 0 });
    return map.get(name)!;
  };

  for (const m of singles) {
    const winners = getWinner(m);
    const losers = getLoser(m);
    for (const p of winners) ensure(p).wins++;
    for (const p of losers) ensure(p).losses++;
  }

  return Array.from(map.entries())
    .map(([name, s]) => {
      const total = s.wins + s.losses;
      const score = total > 0
        ? Math.round(((s.wins * 5 + s.losses * 1) / total) * 10) / 10
        : 0;
      return { name, matches: total, wins: s.wins, losses: s.losses, score };
    })
    .sort((a, b) => b.score - a.score || b.wins - a.wins);
}

export interface PairStats {
  pair: string;
  matches: number;
  wins: number;
  winRate: number;
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
    if (m.sets1 > m.sets2) ensure(k1).wins++;
    else if (m.sets2 > m.sets1) ensure(k2).wins++;
  }

  return Array.from(map.entries())
    .map(([pair, s]) => ({
      pair,
      ...s,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
}

export interface H2HStats {
  player1: string;
  player2: string;
  totalMatches: number;   // all-time count
  recentMatches: number;  // matches considered (up to 5)
  wins1: number;          // wins in recent matches
  wins2: number;          // wins in recent matches
  winRate1: number;       // % based on recent matches
  winRate2: number;       // % based on recent matches
  handicapText: string;   // suggestion text
  stronger: string | null; // who should give handicap (null if even)
}

export function computeH2HStats(matches: Match[]): H2HStats[] {
  // Only singles
  const singles = matches.filter((m) => m.type === "don");

  // Group matches by sorted pair key, preserve order for recency
  const map = new Map<string, { p1: string; p2: string; matchList: Match[] }>();

  for (const m of singles) {
    const [a, b] = [m.team1[0], m.team2[0]];
    const key = [a, b].sort().join("|||");
    const [p1, p2] = key.split("|||");

    if (!map.has(key)) map.set(key, { p1, p2, matchList: [] });
    map.get(key)!.matchList.push(m);
  }

  return Array.from(map.values())
    .map(({ p1, p2, matchList }) => {
      const totalMatches = matchList.length;

      // Sort by createdAt descending, take last 5
      const recent = [...matchList]
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 5);

      const recentMatches = recent.length;
      let wins1 = 0;
      let wins2 = 0;

      for (const m of recent) {
        if (m.sets1 === m.sets2) continue;
        const winner = m.sets1 > m.sets2 ? m.team1[0] : m.team2[0];
        if (winner === p1) wins1++;
        else wins2++;
      }

      const wr1 = recentMatches > 0 ? Math.round((wins1 / recentMatches) * 100) : 50;
      const wr2 = 100 - wr1;

      let handicapText: string;
      let stronger: string | null = null;

      if (totalMatches < 5) {
        const needed = 5 - totalMatches;
        handicapText = `Cần ${needed} trận nữa để đưa ra số bóng chấp`;
      } else {
        const maxWins = Math.max(wins1, wins2);
        stronger = wins1 > wins2 ? p1 : wins2 > wins1 ? p2 : null;

        if (maxWins === 5) {
          handicapText = `${stronger ? ln(stronger) + " " : ""}nên chấp 3 hoặc 4 bóng`;
        } else if (maxWins === 4) {
          handicapText = `${stronger ? ln(stronger) + " " : ""}nên chấp 2 bóng`;
        } else {
          // 3-2: maxWins === 3
          handicapText = "Chơi ngang cơ hoặc chấp 1 bóng";
          stronger = null;
        }
      }

      return { player1: p1, player2: p2, totalMatches, recentMatches, wins1, wins2, winRate1: wr1, winRate2: wr2, handicapText, stronger };
    })
    .filter((s) => s.totalMatches > 0)
    .sort((a, b) => {
      const la = ln(a.player1).localeCompare(ln(b.player1), "vi");
      if (la !== 0) return la;
      return ln(a.player2).localeCompare(ln(b.player2), "vi");
    });
}

function ln(name: string) {
  return name.trim().split(" ").pop() ?? name;
}

export function getKnownPlayers(matches: Match[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    for (const p of [...m.team1, ...m.team2]) set.add(p);
  }
  return Array.from(set).sort();
}
