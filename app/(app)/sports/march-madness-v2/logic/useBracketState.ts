"use client";

import { useState } from "react";

/**
 * Bracket structure expected:
 *
 * {
 *   regions: {
 *     east: { round64: [], round32: [], sweet16: [], elite8: [] },
 *     west: { ... },
 *     south: { ... },
 *     midwest: { ... }
 *   },
 *   finalFour: [],
 *   championship: null
 * }
 */

export default function useBracketState(initialBracket: any) {
  const [bracket, setBracket] = useState(initialBracket);

  /**
   * Core pick handler
   */
  const pickTeam = (gameId: string, teamId: string) => {
    setBracket((prev: any) => {
      const updated = structuredClone(prev);

      // 1. Update selected team in the correct round
      updateGameSelection(updated, gameId, teamId);

      // 2. Advance winners through the bracket
      advanceWinners(updated);

      return updated;
    });
  };

  return {
    bracket,
    pickTeam,
  };
}

/**
 * Update selected team for a specific game
 */
function updateGameSelection(bracket: any, gameId: string, teamId: string) {
  const allRounds = [
    ...Object.values(bracket.regions).flatMap((r: any) => [
      ...r.round64,
      ...r.round32,
      ...r.sweet16,
      ...r.elite8,
    ]),
    ...bracket.finalFour,
    bracket.championship,
  ];

  const game = allRounds.find((g: any) => g.id === gameId);
  if (game) {
    game.selectedTeamId = teamId;
    game.selectedTeamName =
      game.home.id === teamId ? game.home.name : game.away.name;
  }
}

/**
 * Advance winners through rounds
 */
function advanceWinners(bracket: any) {
  // Advance region rounds
  Object.values(bracket.regions).forEach((region: any) => {
    advanceRound(region.round64, region.round32);
    advanceRound(region.round32, region.sweet16);
    advanceRound(region.sweet16, region.elite8);
  });

  // Advance Elite 8 winners into Final Four
  const eliteWinners = Object.values(bracket.regions).map(
    (region: any) => getWinner(region.elite8[0])
  );

  bracket.finalFour.forEach((game: any, idx: number) => {
    const winner = eliteWinners[idx];
    if (winner) {
      game.home = winner;
    }
  });

  // Advance Final Four winners into Championship
  const ffWinners = bracket.finalFour.map((g: any) => getWinner(g));
  if (ffWinners[0]) bracket.championship.home = ffWinners[0];
  if (ffWinners[1]) bracket.championship.away = ffWinners[1];
}

/**
 * Advance winners from one round to the next
 */
function advanceRound(currentRound: any[], nextRound: any[]) {
  currentRound.forEach((game: any, idx: number) => {
    const winner = getWinner(game);
    if (winner && nextRound[idx]) {
      nextRound[idx].home = winner;
    }
  });
}

/**
 * Determine winner of a game
 */
function getWinner(game: any) {
  if (!game || !game.selectedTeamId) return null;

  return game.home.id === game.selectedTeamId
    ? game.home
    : game.away;
}
