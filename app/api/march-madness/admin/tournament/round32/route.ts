import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load Round of 64 games
    const { data: round64, error: loadErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 1)
      .order("game_number", { ascending: true });

    if (loadErr) {
      console.error("Failed to load Round of 64 games:", loadErr);
      return NextResponse.json(
        { error: "Failed to load Round of 64 games." },
        { status: 500 }
      );
    }

    if (!round64 || round64.length !== 32) {
      return NextResponse.json(
        {
          error: `Round of 64 must contain exactly 32 games. Found ${round64?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Clear existing Round of 32 games
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 2);

    if (clearErr) {
      console.error("Failed to clear Round of 32 games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Round of 32 games." },
        { status: 500 }
      );
    }

    // 3. Build Round of 32 games
    const round32Games: any[] = [];

    // Round of 64 games are paired:
    // Game 1 winner vs Game 2 winner → Round of 32 Game 1
    // Game 3 winner vs Game 4 winner → Round of 32 Game 2
    // ...
    for (let i = 0; i < 32; i += 2) {
      const g1 = round64[i];
      const g2 = round64[i + 1];

      round32Games.push({
        id: crypto.randomUUID(),
        game_number: i / 2 + 1, // 1–16
        round: 2,
        region: g1.region, // both games share region
        team1_id: null, // winners not known yet
        team2_id: null,
        home_score: 0,
        away_score: 0,
        winner: null,
        status: "pre",
        is_placeholder: true,
        completed: false,
        winner_to_game_id: null, // wired in Sweet 16 generator
        bracket_id: null,
      });
    }

    // 4. Insert Round of 32 games
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(round32Games);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Round of 32 games." },
        { status: 500 }
      );
    }

    // 5. Wire Round of 64 → Round of 32
    const updates = [];

    for (let i = 0; i < 32; i += 2) {
      const g1 = round64[i];
      const g2 = round64[i + 1];
      const round32GameNumber = i / 2 + 1;

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: round32Games[round32GameNumber - 1].id })
          .eq("id", g1.id)
      );

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: round32Games[round32GameNumber - 1].id })
          .eq("id", g2.id)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Round of 32 generated successfully.",
      games_created: round32Games.length,
    });
  } catch (err: any) {
    console.error("round32 route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
