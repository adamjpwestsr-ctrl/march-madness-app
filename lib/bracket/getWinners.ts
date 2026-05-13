import type { Game, Team } from './types';

export function getWinners(openingRoundGames: Game[], teams: Team[]): Team[] {
  return openingRoundGames.map(game => {
    if (!game.winner_id) return null;
    return teams.find(t => t.id === game.winner_id) ?? null;
  });
}
