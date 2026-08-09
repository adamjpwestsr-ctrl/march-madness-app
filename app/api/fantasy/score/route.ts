import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const SCORING = {
  passing_yards: 0.04,
  rushing_yards: 0.1,
  receiving_yards: 0.1,
  touchdowns: 6,
  interceptions: -2,
  fumbles: -2,
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { week } = await req.json();

  const { data: stats } = await supabase
    .from("nfl_stats_weekly")
    .select("*")
    .eq("week", week);

  // FIX: Ensure stats is always an array
  const safeStats = stats ?? [];

  for (const s of safeStats) {
    const points =
      s.passing_yards * SCORING.passing_yards +
      s.rushing_yards * SCORING.rushing_yards +
      s.receiving_yards * SCORING.receiving_yards +
      s.touchdowns * SCORING.touchdowns +
      s.interceptions * SCORING.interceptions +
      s.fumbles * SCORING.fumbles;

    await supabase.from("fantasy_scores").insert({
      player_id: s.player_id,
      week,
      fantasy_points: points,
    });
  }

  return NextResponse.json({ status: "scored", count: safeStats.length });
}
