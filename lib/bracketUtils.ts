import { Game, Team } from "@/lib/bracketTypes";

/**
 * Generate the full tournament bracket structure from a list of teams.
 * Teams must already be sorted by seed within each region.
 */
export function generateBracketStructure(teams: Team[]): Game[] {
  const games: Game[] = [];
  let gameId = 1;

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

  // Ensure each region is sorted by seed
  regions.forEach((r) => {
    regionTeams[r].sort((a, b) => a.seed - b.seed);
  });

  // Helper to create a round of games
  function createRound(
    round: number,
    region: string,
    inputTeams: (Team | null)[]
  ): Game[] {
    const roundGames: Game[] = [];

    for (let i = 0; i < inputTeams.length; i += 2) {
      const t1 = inputTeams[i];
      const t2 = inputTeams[i + 1];

      roundGames.push({
        id: gameId++,
        round,
        region,
        team1: t1 ? t1.name : null,
        team2: t2 ? t2.name : null,
        winner: null,
      });
    }

    return roundGames;
  }

  // Build rounds region by region
  regions.forEach((region) => {
    const t = regionTeams[region];

    // ROUND 1 — 64 teams (16 per region)
    const round1 = createRound(1, region, t);
    games.push(...round1);

    // ROUND 2 — winners of Round 1
    const round2 = createRound(
      2,
      region,
      new Array(round1.length).fill(null)
    );
    games.push(...round2);

    // SWEET 16 — winners of Round 2
    const round3 = createRound(
      3,
      region,
      new Array(round2.length).fill(null)
    );
    games.push(...round3);

    // ELITE 8 — winners of Round 3
    const round4 = createRound(
      4,
      region,
      new Array(round3.length).fill(null)
    );
    games.push(...round4);
  });

  // FINAL FOUR — winners of each region
  const finalFourTeams = new Array(4).fill(null);
  const finalFour = createRound(5, "FinalFour", finalFourTeams);
  games.push(...finalFour);

  // CHAMPIONSHIP — winners of Final Four
  const championshipTeams = new Array(2).fill(null);
  const championship = createRound(6, "Championship", championshipTeams);
  games.push(...championship);

  return games;
}
