import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { season, week } = await req.json();

  // Get all games for the week
  const { data: games } = await supabase
    .from("ncaaf_games")
    .select("id")
    .eq("season", season)
    .eq("week", week);

  // ⭐ FIX — type "g"
  const gameIds = games?.map((g: any) => g.id) ?? [];

  // Get results
  const { data: results } = await supabase
    .from("ncaaf_results")
    .select("game_id, winner_team_id")
    .in("game_id", gameIds);

  // Get picks
  const { data: picks } = await supabase
    .from("ncaaf_picks")
    .select("user_id, game_id, selected_team_id")
    .in("game_id", gameIds);

  // Calculate points
  const scores: Record<string, number> = {};

  // ⭐ FIX — type "p"
  picks?.forEach((p: any) => {
    // ⭐ FIX — type "r"
    const result = results?.find((r: any) => r.game_id === p.game_id);
    if (result && result.winner_team_id === p.selected_team_id) {
      scores[p.user_id] = (scores[p.user_id] ?? 0) + 1;
    }
  });

  // Store points
  const rows = Object.entries(scores).map(([user_id, points]) => ({
    user_id,
    season,
    week,
    points,
  }));

  const { error } = await supabase.from("ncaaf_points").upsert(rows, {
    onConflict: "user_id,season,week",
  });

  if (error) return NextResponse.json({ success: false, error });

  return NextResponse.json({ success: true, rows });
}
