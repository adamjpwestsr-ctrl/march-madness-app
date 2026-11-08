import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load Elite 8 games
    const { data: elite8, error: loadErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 4)
      .order("game_number", { ascending: true });

    if (loadErr) {
      console.error("Failed to load Elite 8 games:", loadErr);
      return NextResponse.json(
        { error: "Failed to load Elite 8 games." },
        { status: 500 }
      );
    }

    if (!elite8 || elite8.length !== 4) {
      return NextResponse.json(
        {
          error: `Elite 8 must contain exactly 4 games. Found ${elite8?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Clear existing Final Four games (round = 5)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 5);

    if (clearErr) {
      console.error("Failed to clear Final Four games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Final Four games." },
        { status: 500 }
      );
    }

    // 3. Build Final Four games
    const finalFourGames: any[] = [];

    // Elite 8 pairing:
    // Game 1 winner vs Game 2 winner → Final Four Game 1
    // Game 3 winner vs Game 4 winner → Final Four Game 2
    for (let i = 0; i < 4; i += 2) {
      const g1 = elite8[i];
      const g2 = elite8[i + 1];

      finalFourGames.push({
        id: crypto.randomUUID(),
        game_number: i / 2 + 1, // 1–2
        round: 5,
        region: "Final Four",
        team1_id: null, // winners not known yet
        team2_id: null,
        home_score: 0,
        away_score: 0,
        winner: null,
        status: "pre",
        is_placeholder: true,
        completed: false,
        winner_to_game_id: null, // wired in Championship generator
        bracket_id: null,
      });
    }

    // 4. Insert Final Four games
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(finalFourGames);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Final Four games." },
        { status: 500 }
      );
    }

    // 5. Wire Elite 8 → Final Four
    const updates = [];

    for (let i = 0; i < 4; i += 2) {
      const g1 = elite8[i];
      const g2 = elite8[i + 1];
      const finalFourGameNumber = i / 2 + 1;

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: finalFourGames[finalFourGameNumber - 1].id })
          .eq("id", g1.id)
      );

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: finalFourGames[finalFourGameNumber - 1].id })
          .eq("id", g2.id)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Final Four generated successfully.",
      games_created: finalFourGames.length,
    });
  } catch (err: any) {
    console.error("finalfour route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
