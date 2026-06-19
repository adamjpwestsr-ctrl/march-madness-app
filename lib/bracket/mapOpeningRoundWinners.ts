import type { Game } from './types';

export function mapOpeningRoundWinners(
  openingRoundGames: Game[],
  round64Games: Game[],
  mapping: Record<number, number>
) {
  openingRoundGames.forEach(orGame => {
    const targetGameNumber = mapping[orGame.gameNumber];
    if (!targetGameNumber) return;

    const targetGame = round64Games.find(g => g.gameNumber === targetGameNumber);
    if (!targetGame) return;

    if (orGame.winner_id) {
      if (!targetGame.team1_id) {
        targetGame.team1_id = orGame.winner_id;
      } else {
        targetGame.team2_id = orGame.winner_id;
      }
    }
  });
}

