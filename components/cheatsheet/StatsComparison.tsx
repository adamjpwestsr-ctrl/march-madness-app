
import { normalizeSOS } from "@/utils/calculateFavor";

type Team = {
  name?: string;
  record?: string;
  sos?: number | string;
  last10?: string;
  vsTop10?: string;
  conference?: string;
};

type StatsComparisonProps = {
  teamA: Team;
  teamB: Team;
};

type ParsedRecord = {
  wins: number;
  losses: number;
  pct: number | null;
} | null;

type Advantage = "a" | "b" | "even";

type Stat = {
  label: string;
  category: string;
  a: string;
  b: string;
  aDetail: string;
  bDetail: string;
  aValue?: number | null;
  bValue?: number | null;
  advantage: Advantage;
  bar: boolean;
};

export default function StatsComparison({
  teamA,
  teamB,
}: StatsComparisonProps) {
  const parseRecord = (record?: string): ParsedRecord => {
    if (
      !record ||
      typeof record !== "string" ||
      !/^\s*\d+\s*-\s*\d+\s*$/.test(record)
    ) {
      return null;
    }

    const [wins, losses] = record
      .split("-")
      .map((n) => Number(n.trim()));

    const total = wins + losses;

    return {
      wins,
      losses,
      pct: total > 0 ? wins / total : null,
    };
  };

  const aRec = parseRecord(teamA.record);
  const bRec = parseRecord(teamB.record);
  const aLast10 = parseRecord(teamA.last10);
  const bLast10 = parseRecord(teamB.last10);
  const aTop10 = parseRecord(teamA.vsTop10);
  const bTop10 = parseRecord(teamB.vsTop10);

  const getAdvantage = (
    a: number | null,
    b: number | null,
    lowerIsBetter = false
  ): Advantage => {
    if (
      a === null ||
      b === null ||
      !Number.isFinite(a) ||
      !Number.isFinite(b)
    ) {
      return "even";
    }

    if (a === b) return "even";

    if (lowerIsBetter) {
      return a < b ? "a" : "b";
    }

    return a > b ? "a" : "b";
  };

  const stats: Stat[] = [
    {
      label: "Overall Record",
      category: "SEASON",
      a: aRec ? `${aRec.wins}-${aRec.losses}` : "—",
      b: bRec ? `${bRec.wins}-${bRec.losses}` : "—",
      aDetail: aRec ? `${((aRec.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      bDetail: bRec ? `${((bRec.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      aValue: aRec?.pct ?? null,
      bValue: bRec?.pct ?? null,
      advantage: getAdvantage(aRec?.pct ?? null, bRec?.pct ?? null),
      bar: true,
    },
    {
      label: "Strength of Schedule",
      category: "SCHEDULE",
      a: teamA.sos ? `#${normalizeSOS(teamA.sos)}` : "—",
      b: teamB.sos ? `#${normalizeSOS(teamB.sos)}` : "—",
      aDetail: "Schedule rank",
      bDetail: "Schedule rank",
      aValue: teamA.sos ? normalizeSOS(teamA.sos) : null,
      bValue: teamB.sos ? normalizeSOS(teamB.sos) : null,
      advantage: getAdvantage(
        teamA.sos ? normalizeSOS(teamA.sos) : null,
        teamB.sos ? normalizeSOS(teamB.sos) : null,
        true
      ),
      bar: true,
    },
    {
      label: "Last 10 Games",
      category: "MOMENTUM",
      a: teamA.last10 || "—",
      b: teamB.last10 || "—",
      aDetail: aLast10 ? `${((aLast10.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      bDetail: bLast10 ? `${((bLast10.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      aValue: aLast10?.pct ?? null,
      bValue: bLast10?.pct ?? null,
      advantage: getAdvantage(aLast10?.pct ?? null, bLast10?.pct ?? null),
      bar: true,
    },
    {
      label: "Against Top 10",
      category: "COMPETITION",
      a: teamA.vsTop10 || "—",
      b: teamB.vsTop10 || "—",
      aDetail: aTop10 ? `${((aTop10.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      bDetail: bTop10 ? `${((bTop10.pct ?? 0) * 100).toFixed(0)}% win rate` : "No data",
      aValue: aTop10?.pct ?? null,
      bValue: bTop10?.pct ?? null,
      advantage: getAdvantage(aTop10?.pct ?? null, bTop10?.pct ?? null),
      bar: true,
    },
    {
      label: "Conference",
      category: "CONFERENCE",
      a: teamA.conference || "Unknown",
      b: teamB.conference || "Unknown",
      aDetail: "Team affiliation",
      bDetail: "Team affiliation",
      advantage: "even",
      bar: false,
    },
  ];

  const getValueClass = (
    side: "a" | "b",
    advantage: Advantage
  ) => {
    if (advantage === "even") return "text-slate-200";

    return advantage === side
      ? "text-emerald-400"
      : "text-slate-400";
  };

  const getBarWidths = (
    a: number | null,
    b: number | null
  ): [number, number] => {
    if (a === null || b === null) return [50, 50];

    const total = a + b;
    if (total === 0) return [50, 50];

    return [(a / total) * 100, (b / total) * 100];
  };

  return (
    <div className="space-y-2">
      {/* Team labels */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-1 pb-1">
        <span className="break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {teamA.name || "Team A"}
        </span>

        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          VS
        </span>

        <span className="break-words text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {teamB.name || "Team B"}
        </span>
      </div>

      {stats.map((stat) => {
        const [aWidth, bWidth] = getBarWidths(
          stat.aValue ?? null,
          stat.bValue ?? null
        );

        const hasData =
          stat.aValue !== null &&
          stat.bValue !== null &&
          stat.aValue !== undefined &&
          stat.bValue !== undefined;

        return (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-800/90 bg-[#0b1426]/80 px-3 py-2.5 transition-colors duration-200 hover:border-slate-700"
          >
            {/* Label and category */}
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                <span className="text-[11px] font-semibold leading-snug text-slate-200">
                  {stat.label}
                </span>
              </div>

              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-600">
                {stat.category}
              </span>
            </div>

            {/* Team values */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
              <div className="min-w-0">
                <div
                  className={`break-words text-lg font-black tabular-nums leading-tight sm:text-xl ${getValueClass(
                    "a",
                    stat.advantage
                  )}`}
                >
                  {stat.a}
                </div>

                <div className="mt-1 whitespace-normal break-words text-[10px] leading-snug text-slate-400">
                  {stat.aDetail}
                </div>
              </div>

              <div className="pt-1 text-[9px] font-bold text-slate-700">
                VS
              </div>

              <div className="min-w-0 text-right">
                <div
                  className={`break-words text-lg font-black tabular-nums leading-tight sm:text-xl ${getValueClass(
                    "b",
                    stat.advantage
                  )}`}
                >
                  {stat.b}
                </div>

                <div className="mt-1 whitespace-normal break-words text-[10px] leading-snug text-slate-400">
                  {stat.bDetail}
                </div>
              </div>
            </div>

            {/* Comparison bar */}
            {stat.bar && (
              <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-slate-800">
                {hasData ? (
                  <>
                    <div
                      className={`h-full transition-all duration-500 ${
                        stat.advantage === "a"
                          ? "bg-emerald-400"
                          : stat.advantage === "b"
                            ? "bg-slate-600"
                            : "bg-slate-500"
                      }`}
                      style={{ width: `${aWidth}%` }}
                    />

                    <div
                      className={`h-full transition-all duration-500 ${
                        stat.advantage === "b"
                          ? "bg-emerald-400"
                          : stat.advantage === "a"
                            ? "bg-slate-600"
                            : "bg-slate-500"
                      }`}
                      style={{ width: `${bWidth}%` }}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-700/50" />
                )}
              </div>
            )}

            {/* Advantage */}
            <div className="mt-2 min-h-[14px]">
              {stat.advantage === "a" && (
                <span className="whitespace-normal break-words text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  ↑ {teamA.name} advantage
                </span>
              )}

              {stat.advantage === "b" && (
                <span className="block whitespace-normal break-words text-right text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  {teamB.name} advantage ↑
                </span>
              )}

              {stat.advantage === "even" && (
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  {hasData ? "Even comparison" : "Insufficient data"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
