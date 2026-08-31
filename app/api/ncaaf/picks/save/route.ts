import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { userId, seasonYear, week, picks } = body;

  if (!userId || !seasonYear || !week || !picks) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rows = Object.entries(picks).map(([gameId, pickedTeamId]) => ({
    user_id: userId,
    season_year: seasonYear,
    week,
    game_id: gameId,
    picked_team_id: pickedTeamId,
  }));

  // Upsert by user + game
  const { error } = await supabase
    .from("ncaaf_picks")
    .upsert(rows, {
      onConflict: "user_id,game_id",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
