import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load Final Four games
    const { data: finalFour, error: loadErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 5)
      .order("game_number", { ascending: true });

    if (loadErr) {
      console.error("Failed to load Final Four games:", loadErr);
      return NextResponse.json(
        { error: "Failed to load Final Four games." },
        { status: 500 }
      );
    }

    if (!finalFour || finalFour.length !== 2) {
      return NextResponse.json(
        {
          error: `Final Four must contain exactly 2 games. Found ${finalFour?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Clear existing Championship game (round = 6)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 6);

    if (clearErr) {
      console.error("Failed to clear Championship game:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Championship game." },
        { status: 500 }
      );
    }

    // 3. Build Championship game
    const championshipGame = {
      id: crypto.randomUUID(),
      game_number: 1,
      round: 6,
      region: "Championship",
      team1_id: null, // winners not known yet
      team2_id: null,
      home_score: 0,
      away_score: 0,
      winner: null,
      status: "pre",
      is_placeholder: true,
      completed: false,
      winner_to_game_id: null, // no game after championship
      bracket_id: null,
    };

    // 4. Insert Championship game
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert([championshipGame]);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Championship game." },
        { status: 500 }
      );
    }

    // 5. Wire Final Four → Championship
    const updates = [];

    for (const ffGame of finalFour) {
      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: championshipGame.id })
          .eq("id", ffGame.id)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Championship game generated successfully.",
      game_id: championshipGame.id,
    });
  } catch (err: any) {
    console.error("championship route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
