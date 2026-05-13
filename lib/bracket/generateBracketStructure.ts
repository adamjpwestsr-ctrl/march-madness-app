import { createGames } from './createGames';
import { getWinners } from './getWinners';
import { mapOpeningRoundWinners } from './mapOpeningRoundWinners';
import { openingToRound64Map } from './openingToRound64Map';

import type { Team, BracketState } from './types';

export function generateBracketStructure(teams: Team[]): BracketState {
  // Split teams into Opening Round pool and Round of 64 pool
  const openingRoundTeams = teams.slice(64); // 24 teams → 12 games
  const roundOf64Teams = teams.slice(0, 64);

  // --- Opening Round ---
  const openingRoundGames = createGames(openingRoundTeams, 12);

  // Winners (null placeholders until results exist)
  const openingRoundWinners = getWinners(openingRoundGames, teams);

  // --- Round of 64 ---
  const roundOf64Games = createGames(
    roundOf64Teams.concat(openingRoundWinners),
    32
  );

  // Map Opening Round winners into their correct Round of 64 slots
  mapOpeningRoundWinners(openingRoundGames, roundOf64Games, openingToRound64Map);

  // --- Round of 32 ---
  const roundOf32Games = createGames([], 16);

  // --- Sweet 16 ---
  const sweet16Games = createGames([], 8);

  // --- Elite 8 ---
  const elite8Games = createGames([], 4);

  // --- Final Four ---
  const final4Games = createGames([], 2);

  // --- Championship ---
  const championshipGames = createGames([], 1);

  return {
    openingRound: openingRoundGames,
    roundOf64: roundOf64Games,
    roundOf32: roundOf32Games,
    sweet16: sweet16Games,
    elite8: elite8Games,
    final4: final4Games,
    championship: championshipGames,
  };
}
