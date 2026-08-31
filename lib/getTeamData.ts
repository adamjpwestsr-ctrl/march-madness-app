import rawTeams from "../data/cfbd/teams.json";
import { CfbdTeam } from "../types/types";

// Convert array → dictionary keyed by school name
const teams: Record<string, CfbdTeam> = {};

for (const t of rawTeams as CfbdTeam[]) {
  teams[t.school.toLowerCase()] = t;
}

export function getTeamData(teamName: string) {
  if (!teamName) return null;

  return teams[teamName.toLowerCase()] ?? null;
}
