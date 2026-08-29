import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  const sampleGames = [
    {
      season_year: 2026,
      week: 1,
      game_id: "game_001",
      home_team_id: "ALABAMA",
      away_team_id: "GEORGIA",
      start_time: new Date("2026-09-05T19:00:00Z").toISOString(),
    },
  ];

  await supabase.from("ncaaf_games").upsert(sampleGames);

  return NextResponse.json({ success: true, inserted: sampleGames.length });
}
