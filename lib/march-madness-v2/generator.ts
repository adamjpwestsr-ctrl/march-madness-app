import { v4 as uuidv4 } from "uuid";

export function generateTournament() {
  const regions = ["East", "West", "South", "Midwest"];
  const allGames: any[] = [];

  // A 64-team main bracket has 32 Round-of-64 games total: 8 per region.
  // The 12 shared Opening Round games are managed separately by the admin flow.
  const roundSizes: Record<number, number> = {
    1: 8, // Round of 64: 8 games per region, 32 total
    2: 4, // Round of 32: 4 games per region, 16 total
    3: 2, // Sweet 16: 2 games per region, 8 total
    4: 1, // Elite 8: 1 game per region, 4 total
  };

  const regionRoundGames: Record<string, Record<number, any[]>> = {};

  // --- REGION ROUNDS ---
  for (const region of regions) {
    regionRoundGames[region] = {};

    // Create rounds 1–4 for this region (16 → 8 → 4 → 2 → 1 teams)
    for (let round = 1; round <= 4; round++) {
      const count = roundSizes[round];
      const games: any[] = [];

      for (let i = 0; i < count; i++) {
        const game = {
          id: uuidv4(),
          game_number: round * 100 + i + 1,
          round,
          region,
          team1_id: null,
          team2_id: null,
          home_score: 0,
          away_score: 0,
          winner: null,
          status: "pre",
          is_placeholder: false,
          completed: false,
          winner_to_game_id: null,
        };

        games.push(game);
        allGames.push(game);
      }

      regionRoundGames[region][round] = games;
    }

    // --- LINK REGION ROUNDS ---
    linkRounds(regionRoundGames[region][1], regionRoundGames[region][2]);
    linkRounds(regionRoundGames[region][2], regionRoundGames[region][3]);
    linkRounds(regionRoundGames[region][3], regionRoundGames[region][4]);
  }

  // --- FINAL FOUR (Round 5) ---
  const finalFourGames = [];
  for (let i = 0; i < 2; i++) {
    const game = {
      id: uuidv4(),
      game_number: 500 + i + 1,
      round: 5,
      region: "FinalFour",
      team1_id: null,
      team2_id: null,
      home_score: 0,
      away_score: 0,
      winner: null,
      status: "pre",
      is_placeholder: false,
      completed: false,
      winner_to_game_id: null,
    };
    finalFourGames.push(game);
    allGames.push(game);
  }

  // Elite 8 winners → Final Four
  linkRounds(
    [
      ...regionRoundGames["East"][4],
      ...regionRoundGames["West"][4],
    ],
    [finalFourGames[0]]
  );

  linkRounds(
    [
      ...regionRoundGames["South"][4],
      ...regionRoundGames["Midwest"][4],
    ],
    [finalFourGames[1]]
  );

  // --- CHAMPIONSHIP (Round 6) ---
  const championshipGame = {
    id: uuidv4(),
    game_number: 600,
    round: 6,
    region: "Championship",
    team1_id: null,
    team2_id: null,
    home_score: 0,
    away_score: 0,
    winner: null,
    status: "pre",
    is_placeholder: false,
    completed: false,
    winner_to_game_id: null,
  };

  allGames.push(championshipGame);

  // Final Four winners → Championship
  linkRounds(finalFourGames, [championshipGame]);

  // Guard against accidentally reintroducing the old 123-game tree.
  if (allGames.length !== 63) {
    throw new Error(`Invalid March Madness main bracket: expected 63 games, got ${allGames.length}`);
  }

  return allGames;
}

// --- Helper: link winners from one round to the next ---
function linkRounds(fromRound: any[], toRound: any[]) {
  // ⭐ FIX: Prevent undefined access
  if (!fromRound || !toRound) {
    console.warn("linkRounds skipped — missing round data");
    return;
  }

  for (let i = 0; i < fromRound.length; i++) {
    const targetIndex = Math.floor(i / 2);

    if (!toRound[targetIndex]) {
      console.warn(`linkRounds: Missing target game for index ${i}`);
      continue;
    }

    fromRound[i].winner_to_game_id = toRound[targetIndex].id;
  }
}
