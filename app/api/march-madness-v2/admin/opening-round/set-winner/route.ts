import { NextResponse } from "next/server";
import { requireMarchMadnessAdmin } from "@/lib/march-madness-v2/requireAdmin";

export async function POST(req: Request) {
  const auth = await requireMarchMadnessAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  try {
    const body = await req.json();

    const gameNumber = Number(body.game_number);

    const hasTeam1Score =
      body.team1_score !== undefined &&
      body.team1_score !== null &&
      body.team1_score !== "";

    const hasTeam2Score =
      body.team2_score !== undefined &&
      body.team2_score !== null &&
      body.team2_score !== "";

    const team1Score = Number(body.team1_score);
    const team2Score = Number(body.team2_score);

    if (
      !Number.isInteger(gameNumber) ||
      gameNumber < 1 ||
      gameNumber > 12
    ) {
      return NextResponse.json(
        { error: "Provide an Opening Round game number from 1 to 12." },
        { status: 400 }
      );
    }

    if (
      !hasTeam1Score ||
      !hasTeam2Score ||
      !Number.isInteger(team1Score) ||
      !Number.isInteger(team2Score) ||
      team1Score < 0 ||
      team2Score < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a nonnegative whole-number score for both teams.",
        },
        { status: 400 }
      );
    }

    if (team1Score === team2Score) {
      return NextResponse.json(
        {
          error:
            "A completed game cannot have a tied score. Enter the final score after any overtime.",
        },
        { status: 400 }
      );
    }

    const { data: openingGame, error: openingError } = await supabase
      .from("tournament_games")
      .select(
        "id, team1_id, team2_id, home_score, away_score, winner, winner_to_game_id, completed"
      )
      .eq("round", 0)
      .eq("game_number", gameNumber)
      .is("bracket_id", null)
      .maybeSingle();

    if (openingError) throw openingError;

    if (!openingGame) {
      return NextResponse.json(
        { error: "Opening Round game not found." },
        { status: 404 }
      );
    }

    if (!openingGame.team1_id || !openingGame.team2_id) {
      return NextResponse.json(
        { error: "Both teams must be assigned before recording a result." },
        { status: 409 }
      );
    }

    const winnerTeamId =
      team1Score > team2Score
        ? openingGame.team1_id
        : openingGame.team2_id;

    if (!openingGame.winner_to_game_id) {
      return NextResponse.json(
        {
          error:
            "This Opening Round game has no configured Round-of-64 destination. Save the Opening Round matchup mapping first.",
        },
        { status: 409 }
      );
    }

    const { data: targetGame, error: targetError } = await supabase
      .from("tournament_games")
      .select("id, round, team1_id, team2_id, winner")
      .eq("id", openingGame.winner_to_game_id)
      .is("bracket_id", null)
      .maybeSingle();

    if (targetError) throw targetError;

    if (!targetGame || targetGame.round !== 1) {
      return NextResponse.json(
        {
          error:
            "The configured destination is not a shared Round-of-64 game.",
        },
        { status: 409 }
      );
    }

    // Team 2 is reserved for this Opening Round game's winner.
    // Before advancement, it contains this game's placeholder.
    // After advancement, it contains the previous winner's team ID.
    const openingGamePlaceholder = `opening-${openingGame.id}`;

    const slotContainsOpeningPlaceholder =
      targetGame.team2_id === openingGamePlaceholder;

    const slotContainsPreviousWinner = Boolean(
      openingGame.winner &&
        targetGame.team2_id === openingGame.winner
    );

    if (
      !targetGame.team1_id ||
      (
        targetGame.team2_id !== null &&
        !slotContainsOpeningPlaceholder &&
        !slotContainsPreviousWinner
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The destination game must contain the direct entrant in Team 1 and have Team 2 empty, reserved for this Opening Round game, or contain this game's previous winner.",
        },
        { status: 409 }
      );
    }

    // Do not change an advancing team if the destination game
    // already has a different official winner.
    if (
      targetGame.winner &&
      targetGame.winner !== winnerTeamId
    ) {
      return NextResponse.json(
        {
          error:
            "The Round-of-64 game already has a different official winner. Reset that result before changing the Opening Round winner.",
        },
        { status: 409 }
      );
    }

    // Save the Opening Round score and derive its official winner.
    const { error: saveWinnerError } = await supabase
      .from("tournament_games")
      .update({
        home_score: team1Score,
        away_score: team2Score,
        winner: winnerTeamId,
        completed: true,
        status: "final",
      })
      .eq("id", openingGame.id)
      .is("bracket_id", null);

    if (saveWinnerError) throw saveWinnerError;

    // Advance the winner into the reserved Team 2 slot.
    const { error: advanceError } = await supabase
      .from("tournament_games")
      .update({ team2_id: winnerTeamId })
      .eq("id", targetGame.id)
      .is("bracket_id", null);

    if (advanceError) throw advanceError;

    return NextResponse.json({
      success: true,
      opening_game_id: openingGame.id,
      winner_team_id: winnerTeamId,
      team1_score: team1Score,
      team2_score: team2Score,
      advanced_to_game_id: targetGame.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to save Opening Round result.";

    console.error("Opening Round result update error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}