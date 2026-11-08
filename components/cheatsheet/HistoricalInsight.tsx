
import getHistoricalFact from "@/utils/getHistoricalFact";
import { normalizeSOS } from "@/utils/calculateFavor";

type Team = {
  name?: string;
  seed?: number | string | null;
  sos?: number | string;
};

type HistoricalInsightProps = {
  teamA: Team;
  teamB: Team;
};

export default function HistoricalInsight({
  teamA,
  teamB,
}: HistoricalInsightProps) {
  const seedA = teamA?.seed ?? null;
  const seedB = teamB?.seed ?? null;

  const fact = getHistoricalFact(seedA, seedB);

  const teamAName = teamA?.name || "Team A";
  const teamBName = teamB?.name || "Team B";

  const sosA = normalizeSOS(teamA.sos);
  const sosB = normalizeSOS(teamB.sos);

  const displayFact =
    fact && fact.trim() !== ""
      ? fact
      : `Historically, ${teamAName} (SOS #${sosA}) vs ${teamBName} (SOS #${sosB}) shows no major upset trends for these seed ranges.`;

  return (
    <div className="min-w-0 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 animate-slide-in">
      <p className="whitespace-normal break-words text-xs leading-relaxed text-slate-200 sm:text-[13px]">
        {displayFact}
      </p>
    </div>
  );
}
