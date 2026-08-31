import rawTeams from "../data/cfbd/teams.json";
import type { CfbdTeam } from "../types/types";

const teams: Record<string, CfbdTeam> = {};

for (const item of rawTeams as unknown as any[]) {
  if (!item || typeof item !== "object") continue;
  if (!("school" in item)) continue; // skip non-team entries

  const t = item as CfbdTeam;
  teams[t.school.toLowerCase()] = t;
}

export function getTeamData(teamName: string) {
  if (!teamName) return null;

  return teams[teamName.toLowerCase()] ?? null;
}
