import { Team } from "./bracketTypes";

/**
 * Bracket structure output shape
 */
export interface BracketState {
  openingRound: Game[];
  roundOf64: Game[];
  roundOf32: Game[];
  sweet16: Game[];
  elite8: Game[];
  final4: Game[];
  championship: Game[];
}

export interface Game {
  id: string;
  round: string;
  gameNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  winnerToGameId: string | null;
  winnerToSlot: 1 | 2 | null;
  placeholderSource?: string | null; // opening round game id
}

/**
 * Utility to generate unique IDs for games
 */
function gid(prefix: string, num: number) {
  return `${prefix}_${num}`;
}

/**
 * MAIN GENERATOR — creates the full 75‑game skeleton
 */
export function generateBracketStructure(teams: Team[]): BracketState {
  if (teams.length !== 76) {
    throw new Error(`Expected 76 teams, received ${teams.length}`);
  }

  // ---------------------------------------------------------
  // 1. OPENING ROUND (12 games, 24 lowest‑seeded teams)
  // ---------------------------------------------------------
  const openingRoundTeams = teams.slice(-24); // last 24 teams
  const openingRound: Game[] = [];

  for (let i = 0; i < 12; i++) {
    const team1 = openingRoundTeams[i * 2];
    const team2 = openingRoundTeams[i * 2 + 1];

    openingRound.push({
      id: gid("OR", i + 1),
      round: "Opening Round",
      gameNumber: i + 1,
      team1Id: String(team1.id),
      team2Id: String(team2.id),
      winnerToGameId: null, // ADMIN will assign via opening_round_slots
      winnerToSlot: null,
    });
  }

  // ---------------------------------------------------------
  // 2. ROUND OF 64 (32 games, 52 auto‑placed + 12 placeholders)
  // ---------------------------------------------------------
  const roundOf64Teams = teams.slice(0, 52); // top 52 teams
  const roundOf64: Game[] = [];

  for (let i = 0; i < 32; i++) {
    const team1 = roundOf64Teams[i * 2] ?? null;
    const team2 = roundOf64Teams[i * 2 + 1] ?? null;

    roundOf64.push({
      id: gid("R64", i + 1),
      round: "Round of 64",
      gameNumber: i + 1,
      team1Id: team1 ? String(team1.id) : null,
      team2Id: team2 ? String(team2.id) : null,
      winnerToGameId: gid("R32", Math.floor(i / 2) + 1),
      winnerToSlot: i % 2 === 0 ? 1 : 2,
    });
  }

  // ---------------------------------------------------------
  // 3. ROUND OF 32 (16 games)
  // ---------------------------------------------------------
  const roundOf32: Game[] = [];
  for (let i = 0; i < 16; i++) {
    roundOf32.push({
      id: gid("R32", i + 1),
      round: "Round of 32",
      gameNumber: i + 1,
      team1Id: null,
      team2Id: null,
      winnerToGameId: gid("S16", Math.floor(i / 2) + 1),
      winnerToSlot: i % 2 === 0 ? 1 : 2,
    });
  }

  // ---------------------------------------------------------
  // 4. SWEET 16 (8 games)
  // ---------------------------------------------------------
  const sweet16: Game[] = [];
  for (let i = 0; i < 8; i++) {
    sweet16.push({
      id: gid("S16", i + 1),
      round: "Sweet 16",
      gameNumber: i + 1,
      team1Id: null,
      team2Id: null,
      winnerToGameId: gid("E8", Math.floor(i / 2) + 1),
      winnerToSlot: i % 2 === 0 ? 1 : 2,
    });
  }

  // ---------------------------------------------------------
  // 5. ELITE 8 (4 games)
  // ---------------------------------------------------------
  const elite8: Game[] = [];
  for (let i = 0; i < 4; i++) {
    elite8.push({
      id: gid("E8", i + 1),
      round: "Elite 8",
      gameNumber: i + 1,
      team1Id: null,
      team2Id: null,
      winnerToGameId: gid("F4", Math.floor(i / 2) + 1),
      winnerToSlot: i % 2 === 0 ? 1 : 2,
    });
  }

  // ---------------------------------------------------------
  // 6. FINAL FOUR (2 games)
  // ---------------------------------------------------------
  const final4: Game[] = [];
  for (let i = 0; i < 2; i++) {
    final4.push({
      id: gid("F4", i + 1),
      round: "Final Four",
      gameNumber: i + 1,
      team1Id: null,
      team2Id: null,
      winnerToGameId: gid("CH", 1),
      winnerToSlot: i === 0 ? 1 : 2,
    });
  }

  // ---------------------------------------------------------
  // 7. CHAMPIONSHIP (1 game)
  // ---------------------------------------------------------
  const championship: Game[] = [
    {
      id: gid("CH", 1),
      round: "Championship",
      gameNumber: 1,
      team1Id: null,
      team2Id: null,
      winnerToGameId: null,
      winnerToSlot: null,
    },
  ];

  // ---------------------------------------------------------
  // RETURN FULL BRACKET
  // ---------------------------------------------------------
  return {
    openingRound,
    roundOf64,
    roundOf32,
    sweet16,
    elite8,
    final4,
    championship,
  };
}
