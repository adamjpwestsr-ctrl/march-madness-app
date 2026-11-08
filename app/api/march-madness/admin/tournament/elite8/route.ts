import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load Sweet 16 games
    const { data: sweet16, error: loadErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 3)
      .order("game_number", { ascending: true });

    if (loadErr) {
      console.error("Failed to load Sweet 16 games:", loadErr);
      return NextResponse.json(
        { error: "Failed to load Sweet 16 games." },
        { status: 500 }
      );
    }

    if (!sweet16 || sweet16.length !== 8) {
      return NextResponse.json(
        {
          error: `Sweet 16 must contain exactly 8 games. Found ${sweet16?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Clear existing Elite 8 games (round = 4)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 4);

    if (clearErr) {
      console.error("Failed to clear Elite 8 games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Elite 8 games." },
        { status: 500 }
      );
    }

    // 3. Build Elite 8 games
    const elite8Games: any[] = [];

    // Sweet 16 games are paired:
    // Game 1 winner vs Game 2 winner → Elite 8 Game 1
    // Game 3 winner vs Game 4 winner → Elite 8 Game 2
    // Game 5 winner vs Game 6 winner → Elite 8 Game 3
    // Game 7 winner vs Game 8 winner → Elite 8 Game 4
    for (let i = 0; i < 8; i += 2) {
      const g1 = sweet16[i];
      const g2 = sweet16[i + 1];

      elite8Games.push({
        id: crypto.randomUUID(),
        game_number: i / 2 + 1, // 1–4
        round: 4,
        region: g1.region, // both games share region
        team1_id: null, // winners not known yet
        team2_id: null,
        home_score: 0,
        away_score: 0,
        winner: null,
        status: "pre",
        is_placeholder: true,
        completed: false,
        winner_to_game_id: null, // wired in Final Four generator
        bracket_id: null,
      });
    }

    // 4. Insert Elite 8 games
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(elite8Games);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Elite 8 games." },
        { status: 500 }
      );
    }

    // 5. Wire Sweet 16 → Elite 8
    const updates = [];

    for (let i = 0; i < 8; i += 2) {
      const g1 = sweet16[i];
      const g2 = sweet16[i + 1];
      const elite8GameNumber = i / 2 + 1;

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: elite8Games[elite8GameNumber - 1].id })
          .eq("id", g1.id)
      );

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: elite8Games[elite8GameNumber - 1].id })
          .eq("id", g2.id)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Elite 8 generated successfully.",
      games_created: elite8Games.length,
    });
  } catch (err: any) {
    console.error("elite8 route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
