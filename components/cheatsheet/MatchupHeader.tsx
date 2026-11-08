
import TeamHeader from "./TeamHeader";

type Team = {
  name?: string;
  team_name?: string;
  logo?: string | null;
  logo_url?: string;
  seed?: number | string | null;
  conference?: string;
  record?: string;
  primaryColor?: string;
};

type MatchupHeaderProps = {
  teamA: Team;
  teamB: Team;
  round?: number | string | null;
};

export default function MatchupHeader({
  teamA,
  teamB,
  round,
}: MatchupHeaderProps) {
  const safeTeamA = {
    name: teamA?.name || teamA?.team_name || "TBD",
    logo: teamA?.logo || teamA?.logo_url || null,
    seed: teamA?.seed ?? "–",
    conference: teamA?.conference || "Unknown",
    record: teamA?.record || "0-0",
    primaryColor: teamA?.primaryColor || "#334155",
  };

  const safeTeamB = {
    name: teamB?.name || teamB?.team_name || "TBD",
    logo: teamB?.logo || teamB?.logo_url || null,
    seed: teamB?.seed ?? "–",
    conference: teamB?.conference || "Unknown",
    record: teamB?.record || "0-0",
    primaryColor: teamB?.primaryColor || "#334155",
  };

  return (
    <div className="flex items-center justify-between">
      <TeamHeader {...safeTeamA} align="left" />
      <TeamHeader {...safeTeamB} align="right" />
    </div>
  );
}
