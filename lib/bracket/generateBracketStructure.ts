import { createGames } from "./createGames";
import { getWinners } from "./getWinners";
import { mapOpeningRoundWinners } from "./mapOpeningRoundWinners";
import { openingToRound64Map } from "./openingToRound64Map";

import type { Team, BracketState } from "./types";

export function generateBracketStructure(teams: Team[]): BracketState {
  // --- Defensive guard ---
  if (!teams || teams.length === 0) {
    console.warn("⚠️ No teams provided to generateBracketStructure.");
    return {
      openingRound: [],
      roundOf64: [],
      roundOf32: [],
      sweet16: [],
      elite8: [],
      final4: [],
      championship: [],
    };
  }

  // Split teams into Opening Round pool and Round of 64 pool
  const openingRoundTeams = teams.slice(64); // 24 teams → 12 games (if present)
  const roundOf64Teams = teams.slice(0, 64);

  // --- Opening Round ---
  const openingRoundGames = createGames(openingRoundTeams, 12);

  // Winners (null placeholders until results exist)
  const openingRoundWinners = getWinners(openingRoundGames, teams);

  // --- Round of 64 ---
  // Safely filter out nulls and handle missing play‑in teams
  const openingRoundWinnersSafe = openingRoundWinners?.filter(
    (t): t is Team => t !== null
  ) ?? [];

  const roundOf64Games = createGames(
    roundOf64Teams.concat(openingRoundWinnersSafe),
    32
  );

  // Map Opening Round winners into their correct Round of 64 slots
  if (openingRoundGames.length && openingRoundWinnersSafe.length) {
    mapOpeningRoundWinners(
      openingRoundGames,
      roundOf64Games,
      openingToRound64Map
    );
  }

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
