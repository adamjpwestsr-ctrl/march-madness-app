import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const games = body.games;

    if (!games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: "Invalid payload: 'games' must be an array." },
        { status: 400 }
      );
    }

    // Opening round must have exactly 12 games
    if (games.length !== 12) {
      return NextResponse.json(
        {
          error: `Opening round must contain exactly 12 games. Received ${games.length}.`,
        },
        { status: 400 }
      );
    }

    // Validate each game
    for (let i = 0; i < games.length; i++) {
      const g = games[i];

      if (!g.team1_id || !g.team2_id || !g.winner_to_game_id) {
        return NextResponse.json(
          {
            error: `Game ${i + 1} is missing required fields (team1_id, team2_id, winner_to_game_id).`,
          },
          { status: 400 }
        );
      }

      if (g.team1_id === g.team2_id) {
        return NextResponse.json(
          {
            error: `Game ${i + 1} has the same team for both slots.`,
          },
          { status: 400 }
        );
      }

      const round64GameNumber = Number(g.winner_to_game_id);
      if (isNaN(round64GameNumber) || round64GameNumber < 1 || round64GameNumber > 32) {
        return NextResponse.json(
          {
            error: `Game ${i + 1} has invalid winner_to_game_id. Must be a Round of 64 game number (1–32).`,
          },
          { status: 400 }
        );
      }
    }

    // Clear existing opening-round games (round = 0)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 0);

    if (clearErr) {
      console.error("Failed to clear opening-round games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing opening-round games." },
        { status: 500 }
      );
    }

    // Insert new opening-round games
    const payload = games.map((g: any, index: number) => ({
      id: crypto.randomUUID(),
      game_number: index + 1,
      round: 0, // opening round
      region: null, // region is determined by seeds, not stored here
      team1_id: g.team1_id,
      team2_id: g.team2_id,
      home_score: 0,
      away_score: 0,
      winner: null,
      status: "pre",
      is_placeholder: false,
      completed: false,
      winner_to_game_id: null, // will be linked after Round of 64 is generated
      bracket_id: null,
    }));

    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(payload);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert opening-round games." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Opening round games saved successfully.",
      count: payload.length,
    });
  } catch (err: any) {
    console.error("opening-round route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
