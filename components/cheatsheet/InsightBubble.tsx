
import generateInsight from "@/utils/generateInsight";

type Team = {
  team_name?: string;
  name?: string;
  record?: string;
  sos?: number | string;
  last10?: string;
  conference?: string;
};

type InsightBubbleProps = {
  teamA: Team;
  teamB: Team;
};

export default function InsightBubble({
  teamA,
  teamB,
}: InsightBubbleProps) {
  const safeTeamA = {
    name: teamA?.team_name || teamA?.name || "TBD",
    record: teamA?.record || "0-0",
    sos:
      typeof teamA?.sos === "number"
        ? teamA.sos
        : parseFloat(String(teamA?.sos ?? "")) || 0,
    last10: teamA?.last10 || "0-0",
    conference: teamA?.conference || "Unknown",
  };

  const safeTeamB = {
    name: teamB?.team_name || teamB?.name || "TBD",
    record: teamB?.record || "0-0",
    sos:
      typeof teamB?.sos === "number"
        ? teamB.sos
        : parseFloat(String(teamB?.sos ?? "")) || 0,
    last10: teamB?.last10 || "0-0",
    conference: teamB?.conference || "Unknown",
  };

  const insight =
    generateInsight(safeTeamA, safeTeamB) || "No insight available.";

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md animate-bubble">
      <span className="text-slate-200 text-sm">{insight}</span>
    </div>
  );
}
