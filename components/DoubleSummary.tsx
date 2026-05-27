import { Match, getLoser, getWinner } from "@/lib/firestore";

interface Props {
  matches: Match[];
}

const ln = (name: string) => name.trim().split(" ").pop() ?? name;

function lossStats(matches: Match[]) {
  const lossMap = new Map<string, number>();
  for (const m of matches) {
    for (const p of getLoser(m)) lossMap.set(p, (lossMap.get(p) ?? 0) + 1);
    for (const p of getWinner(m)) { if (!lossMap.has(p)) lossMap.set(p, 0); }
  }
  return Array.from(lossMap.entries())
    .map(([name, losses]) => ({ name, losses }))
    .sort((a, b) => b.losses - a.losses);
}

export default function DoubleSummary({ matches }: Props) {
  const singles = matches.filter((m) => m.type === "don");
  const doubles = matches.filter((m) => m.type === "doi");

  if (singles.length === 0 && doubles.length === 0) return null;

  const singleStats = lossStats(singles);
  const doubleStats = lossStats(doubles);

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Singles summary */}
      {singles.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
            Trận đơn · {singles.length} trận
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {singleStats.map(({ name, losses }) => (
              <span key={name} className="text-sm">
                <span className="font-semibold text-gray-800">{ln(name)}</span>
                {losses === 0
                  ? <span className="text-green-600 ml-1">không thua</span>
                  : <span className="text-red-500 ml-1">thua {losses}</span>
                }
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Doubles summary */}
      {doubles.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">
            Trận đôi · {doubles.length} trận
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {doubleStats.map(({ name, losses }) => (
              <span key={name} className="text-sm">
                <span className="font-semibold text-gray-800">{ln(name)}</span>
                {losses === 0
                  ? <span className="text-green-600 ml-1">không thua</span>
                  : <span className="text-red-500 ml-1">thua {losses}</span>
                }
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
