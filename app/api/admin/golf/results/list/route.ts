import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournament_id = searchParams.get("tournament_id");

  if (!tournament_id) {
    return NextResponse.json({ error: "Missing tournament_id" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("golf_weekly_results")
    .select("player_id, final_score_relative_to_par, is_winner, golf_players(name)")
    .eq("tournament_id", tournament_id)
    .order("final_score_relative_to_par", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}

