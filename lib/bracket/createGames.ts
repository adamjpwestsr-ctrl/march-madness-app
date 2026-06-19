import type { Game, Team } from './types';

export function createGames(teams: Team[], count: number): Game[] {
  const games: Game[] = [];

  for (let i = 0; i < count; i++) {
    const team1 = teams[i * 2] ?? null;
    const team2 = teams[i * 2 + 1] ?? null;

    games.push({
      gameNumber: i + 1,
      team1_id: team1?.id ?? null,
      team2_id: team2?.id ?? null,
      winner_id: null,
      winner_to_game_id: null,
    });
  }

  return games;
}

