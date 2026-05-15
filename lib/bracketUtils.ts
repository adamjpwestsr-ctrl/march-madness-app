import { TournamentTeam } from "./bracketTypes";

/**
 * Output shape matches your Supabase `games` table exactly.
 */
export interface GameRow {
  game_id: number;
  round: number; // 0–6
  region: string | null;
  game_number: number;
  team1: string | null;
  seed1: number | null;
  team2: string | null;
  seed2: number | null;
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
  final_score: number | null;
}

/**
 * round mapping:
 * 0 = Opening Round
 * 1 = Round of 64
 * 2 = Round of 32
 * 3 = Sweet 16
 * 4 = Elite 8
 * 5 = Final Four
 * 6 = Championship
 */
const ROUND = {
  OPENING: 0,
  R64: 1,
  R32: 2,
  S16: 3,
  E8: 4,
  F4: 5,
  CH: 6,
};

/**
 * MAIN GENERATOR
 * @param orderedTeams — array of 76 team names in true‑seed order (1–76)
 * @param teamData — array of v_tournament_teams rows
 */
export function generateBracketStructure(
  orderedTeams: string[],
  teamData: TournamentTeam[]
): GameRow[] {
  if (orderedTeams.length !== 76) {
    throw new Error(`Expected 76 teams, received ${orderedTeams.length}`);
  }

  // Map team name → metadata
  const lookup = new Map<string, TournamentTeam>();
  for (const t of teamData) lookup.set(t.team, t);

  // Split into Opening Round (65–76) and Round of 64 (1–64)
  const openingRoundTeams = orderedTeams.slice(64); // 12 teams
  const roundOf64Teams = orderedTeams.slice(0, 64); // 64 teams

  const games: GameRow[] = [];
  let gid = 1;

  // ---------------------------------------------------------
  // 1. OPENING ROUND — 12 games
  // ---------------------------------------------------------
  for (let i = 0; i < 12; i++) {
    const t1 = lookup.get(openingRoundTeams[i * 2])!;
    const t2 = lookup.get(openingRoundTeams[i * 2 + 1])!;

    games.push({
      game_id: gid++,
      round: ROUND.OPENING,
      region: null,
      game_number: i + 1,
      team1: t1.team,
      seed1: null,
      team2: t2.team,
      seed2: null,
      winner: null,
      source_game1: null,
      source_game2: null,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 2. ROUND OF 64 — 32 games
  // ---------------------------------------------------------
  for (let i = 0; i < 32; i++) {
    const t1Name = roundOf64Teams[i * 2];
    const t2Name = roundOf64Teams[i * 2 + 1];

    const t1 = lookup.get(t1Name);
    const t2 = lookup.get(t2Name);

    const bothKnown = t1 && t2;

    games.push({
      game_id: gid++,
      round: ROUND.R64,
      region: bothKnown ? t1!.region : null,
      game_number: i + 1,
      team1: t1 ? t1.team : null,
      seed1: t1 ? t1.seed : null,
      team2: t2 ? t2.team : null,
      seed2: t2 ? t2.seed : null,
      winner: null,
      source_game1: t1 ? null : i < 12 ? i + 1 : null, // Opening Round feeds
      source_game2: t2 ? null : null,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 3. ROUND OF 32 — 16 games
  // ---------------------------------------------------------
  for (let i = 0; i < 16; i++) {
    games.push({
      game_id: gid++,
      round: ROUND.R32,
      region: null,
      game_number: i + 1,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      winner: null,
      source_game1: 13 + i * 2,
      source_game2: 14 + i * 2,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 4. SWEET 16 — 8 games
  // ---------------------------------------------------------
  for (let i = 0; i < 8; i++) {
    games.push({
      game_id: gid++,
      round: ROUND.S16,
      region: null,
      game_number: i + 1,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      winner: null,
      source_game1: 45 + i * 2,
      source_game2: 46 + i * 2,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 5. ELITE 8 — 4 games
  // ---------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    games.push({
      game_id: gid++,
      round: ROUND.E8,
      region: null,
      game_number: i + 1,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      winner: null,
      source_game1: 61 + i * 2,
      source_game2: 62 + i * 2,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 6. FINAL FOUR — 2 games
  // ---------------------------------------------------------
  for (let i = 0; i < 2; i++) {
    games.push({
      game_id: gid++,
      round: ROUND.F4,
      region: null,
      game_number: i + 1,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      winner: null,
      source_game1: 69 + i * 2,
      source_game2: 70 + i * 2,
      final_score: null,
    });
  }

  // ---------------------------------------------------------
  // 7. CHAMPIONSHIP — 1 game
  // ---------------------------------------------------------
  games.push({
    game_id: gid++,
    round: ROUND.CH,
    region: null,
    game_number: 1,
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    winner: null,
    source_game1: 73,
    source_game2: 74,
    final_score: null,
  });

  return games;
}
