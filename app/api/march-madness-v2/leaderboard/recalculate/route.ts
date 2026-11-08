import { NextResponse } from "next/server";
import { requireMarchMadnessAdmin } from "@/lib/march-madness-v2/requireAdmin";

/** Canonical V2 scoring: round base points + winner seed; Opening Round is 1 point. */
const ROUND_POINTS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 32,
};

const OPENING_ROUND_SEED_BONUS = 14;

export async function POST() {
  const auth = await requireMarchMadnessAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.supabase;

  // Only the shared official tree is authoritative. Never score per-player game copies.
  const { data: games, error: gamesError } = await supabase
    .from("tournament_games")
    .select("id, round, winner, team1_id, team2_id")
    .is("bracket_id", null);

  if (gamesError) {
    return NextResponse.json(
      { error: `Failed to load official games: ${gamesError.message}` },
      { status: 500 }
    );
  }

  const { data: teams, error: teamsError } = await supabase
    .from("tournament_teams")
    .select("id, seed");

  if (teamsError) {
    return NextResponse.json(
      { error: `Failed to load teams: ${teamsError.message}` },
      { status: 500 }
    );
  }

  const seedByTeam = new Map(
    (teams ?? []).map((team) => [
      String(team.id),
      Number(team.seed ?? 0),
    ])
  );

  // A team appearing in an official Round 0 game is an Opening Round team.
  const openingRoundTeamIds = new Set<string>();

  for (const game of games ?? []) {
    if (Number(game.round) !== 0) continue;

    if (game.team1_id) {
      openingRoundTeamIds.add(String(game.team1_id));
    }

    if (game.team2_id) {
      openingRoundTeamIds.add(String(game.team2_id));
    }
  }

  const { data: brackets, error: bracketsError } = await supabase
    .from("brackets")
    .select("bracket_id, user_id, user_name, bracket_name, sport")
    .eq("sport", "ncaab");

  if (bracketsError) {
    return NextResponse.json(
      {
        error: `Failed to load March Madness brackets: ${bracketsError.message}`,
      },
      { status: 500 }
    );
  }

  const bracketIds = (brackets ?? [])
    .map((bracket) => bracket.bracket_id)
    .filter(Boolean);

  if (!bracketIds.length) {
    return NextResponse.json({
      success: true,
      updated: 0,
      message: "No March Madness brackets to score.",
    });
  }

  const { data: picks, error: picksError } = await supabase
    .from("bracket_picks")
    .select("bracket_id, game_id, picked_team")
    .in("bracket_id", bracketIds);

  if (picksError) {
    return NextResponse.json(
      { error: `Failed to load picks: ${picksError.message}` },
      { status: 500 }
    );
  }

  const officialGames = new Map(
    (games ?? []).map((game) => [String(game.id), game])
  );

  const scores = new Map<string, number>(
    bracketIds.map((id) => [String(id), 0])
  );

  for (const pick of picks ?? []) {
    const game = officialGames.get(String(pick.game_id));

    if (
      !game ||
      !game.winner ||
      !pick.picked_team ||
      String(pick.picked_team) !== String(game.winner)
    ) {
      continue;
    }

    const round = Number(game.round);
    const base = ROUND_POINTS[round] ?? 0;
    const winnerId = String(game.winner);

    // Opening Round wins receive only the round base.
    // In later rounds, play-in teams receive a fixed 14-point bonus
    // instead of a stored seed value.
    const seedBonus =
      round === 0
        ? 0
        : openingRoundTeamIds.has(winnerId)
          ? OPENING_ROUND_SEED_BONUS
          : (seedByTeam.get(winnerId) ?? 0);

    scores.set(
      String(pick.bracket_id),
      (scores.get(String(pick.bracket_id)) ?? 0) + base + seedBonus
    );
  }

  const previousResult = await supabase
    .from("bracket_leaderboard")
    .select("bracket_id, total_points, rank")
    .in("bracket_id", bracketIds);

  if (previousResult.error) {
    return NextResponse.json(
      {
        error: `Failed to load previous scores: ${previousResult.error.message}`,
      },
      { status: 500 }
    );
  }

  const previousByBracket = new Map(
    (previousResult.data ?? []).map((row) => [
      String(row.bracket_id),
      row,
    ])
  );

  const now = new Date().toISOString();

  const rows = (brackets ?? []).map((bracket) => {
    const id = String(bracket.bracket_id);
    const previous = previousByBracket.get(id);

    return {
      bracket_id: bracket.bracket_id,
      user_id: bracket.user_id,
      total_points: scores.get(id) ?? 0,
      name: bracket.user_name || bracket.bracket_name || "Unknown",
      avatar_url: null,
      groups: [],
      previous_points: previous?.total_points ?? 0,
      previous_rank: previous?.rank ?? null,
      updated_at: now,
    };
  });

  const { error: upsertError } = await supabase
    .from("bracket_leaderboard")
    .upsert(rows, { onConflict: "bracket_id" });

  if (upsertError) {
    return NextResponse.json(
      { error: `Failed to save scores: ${upsertError.message}` },
      { status: 500 }
    );
  }

  const { data: ranked, error: rankFetchError } = await supabase
    .from("bracket_leaderboard")
    .select("bracket_id, total_points")
    .in("bracket_id", bracketIds)
    .order("total_points", { ascending: false });

  if (rankFetchError) {
    return NextResponse.json(
      { error: `Failed to calculate ranks: ${rankFetchError.message}` },
      { status: 500 }
    );
  }

  // Update only March Madness rows so rankings for other sports remain untouched.
  for (const [index, row] of (ranked ?? []).entries()) {
    const { error } = await supabase
      .from("bracket_leaderboard")
      .update({ rank: index + 1 })
      .eq("bracket_id", row.bracket_id);

    if (error) {
      return NextResponse.json(
        {
          error: `Failed to save rank for bracket ${row.bracket_id}: ${error.message}`,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: "March Madness V2 leaderboard recalculated.",
    updated: rows.length,
  });
}