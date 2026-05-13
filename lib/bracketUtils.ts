// lib/bracketUtils.ts

export type Team = {
  id: number;
  name: string;
  seed: number;
  region: string;
};

export type Game = {
  id: number;
  round: number;
  region: string;
  team1: string | null;
  team2: string | null;
  winner: string | null;
};

/**
 * Generates the full 64‑team bracket structure.
 * Assumes teams are already sorted by seed ASC within each region.
 */
export function generateBracketStructure(teams: Team[]) {
  if (!teams || teams.length === 0) {
    throw new Error("No teams provided to generateBracketStructure");
  }

  // Group teams by region
  const regions = ["East", "West", "South", "Midwest"];
  const regionTeams: Record<string, Team[]> = {
    East: [],
    West: [],
    South: [],
    Midwest: [],
  };

  teams.forEach((t) => {
    if (regionTeams[t.region]) {
      regionTeams[t.region].push(t);
    }
  });

  let gameId = 1;
  const games: Game[] = [];

  // Round of 64 (round 1)
  regions.forEach((region) => {
    const list = regionTeams[region];
    if (!list || list.length !== 16) {
      throw new Error(`Region ${region} does not have exactly 16 teams`);
    }

    // Standard 1 vs 16, 2 vs 15, 3 vs 14, etc.
    for (let i = 0; i < 8; i++) {
      const team1 = list[i].name;
      const team2 = list[15 - i].name;

      games.push({
        id: gameId++,
        round: 1,
        region,
        team1,
        team2,
        winner: null,
      });
    }
  });

  // Future rounds (Round of 32, Sweet 16, Elite 8, Final Four, Championship)
  // These start empty and get filled as results come in.
  for (let round = 2; round <= 6; round++) {
    const numGames =
      round <= 4 ? 8 * Math.pow(2, 1 - (round - 1)) : round === 5 ? 2 : 1;

    for (let i = 0; i < numGames; i++) {
      games.push({
        id: gameId++,
        round,
        region: round <= 4 ? regions[Math.floor(i / (numGames / 4))] : "Final",
        team1: null,
        team2: null,
        winner: null,
      });
    }
  }

  return games;
}
