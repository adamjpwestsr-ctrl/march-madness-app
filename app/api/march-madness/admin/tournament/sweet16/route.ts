import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load Round of 32 games
    const { data: round32, error: loadErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 2)
      .order("game_number", { ascending: true });

    if (loadErr) {
      console.error("Failed to load Round of 32 games:", loadErr);
      return NextResponse.json(
        { error: "Failed to load Round of 32 games." },
        { status: 500 }
      );
    }

    if (!round32 || round32.length !== 16) {
      return NextResponse.json(
        {
          error: `Round of 32 must contain exactly 16 games. Found ${round32?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Clear existing Sweet 16 games (round = 3)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 3);

    if (clearErr) {
      console.error("Failed to clear Sweet 16 games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Sweet 16 games." },
        { status: 500 }
      );
    }

    // 3. Build Sweet 16 games
    const sweet16Games: any[] = [];

    // Round of 32 games are paired:
    // Game 1 winner vs Game 2 winner → Sweet 16 Game 1
    // Game 3 winner vs Game 4 winner → Sweet 16 Game 2
    // ...
    for (let i = 0; i < 16; i += 2) {
      const g1 = round32[i];
      const g2 = round32[i + 1];

      sweet16Games.push({
        id: crypto.randomUUID(),
        game_number: i / 2 + 1, // 1–8
        round: 3,
        region: g1.region, // both games share region
        team1_id: null, // winners not known yet
        team2_id: null,
        home_score: 0,
        away_score: 0,
        winner: null,
        status: "pre",
        is_placeholder: true,
        completed: false,
        winner_to_game_id: null, // wired in Elite 8 generator
        bracket_id: null,
      });
    }

    // 4. Insert Sweet 16 games
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(sweet16Games);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Sweet 16 games." },
        { status: 500 }
      );
    }

    // 5. Wire Round of 32 → Sweet 16
    const updates = [];

    for (let i = 0; i < 16; i += 2) {
      const g1 = round32[i];
      const g2 = round32[i + 1];
      const sweet16GameNumber = i / 2 + 1;

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: sweet16Games[sweet16GameNumber - 1].id })
          .eq("id", g1.id)
      );

      updates.push(
        supabase
          .from("tournament_games")
          .update({ winner_to_game_id: sweet16Games[sweet16GameNumber - 1].id })
          .eq("id", g2.id)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Sweet 16 generated successfully.",
      games_created: sweet16Games.length,
    });
  } catch (err: any) {
    console.error("sweet16 route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
