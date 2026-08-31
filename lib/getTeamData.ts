import rawTeams from "../data/cfbd/teams.json";
import { TeamData } from "../types/types";

// Convert array → dictionary keyed by school name
const teams: Record<string, TeamData> = {};

for (const t of rawTeams as TeamData[]) {
  teams[t.school.toLowerCase()] = t;
}

export function getTeamData(teamName: string) {
  if (!teamName) return null;

  return teams[teamName.toLowerCase()] ?? null;
}
