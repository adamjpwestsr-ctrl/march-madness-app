import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { game_id, home_score, away_score, winner_team_id } = body;

  const { error } = await supabase.from("ncaaf_results").upsert(
    {
      game_id,
      home_score,
      away_score,
      winner_team_id,
    },
    { onConflict: "game_id" }
  );

  if (error) return NextResponse.json({ success: false, error });

  return NextResponse.json({ success: true });
}
