import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const tournament_id = Number(searchParams.get("tournament_id"));

  const { data: results } = await supabase
    .from("golf_weekly_results")
    .select("*")
    .eq("tournament_id", tournament_id);

  const { data: awarded } = await supabase
    .from("golf_weekly_picks")
    .select("user_id, points_awarded, users(name)")
    .eq("tournament_id", tournament_id)
    .order("points_awarded", { ascending: false });

  return NextResponse.json({
    results: results || [],
    awarded:
      awarded?.map((r) => ({
        user_id: r.user_id,
        name: r.users?.[0]?.name ?? "Unknown",
        points_awarded: r.points_awarded,
      })) || [],
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { tournament_id, results } = await req.json();

  const rows = Object.entries(results).map(([player_id, score]) => ({
    tournament_id,
    player_id: Number(player_id),
    final_score_relative_to_par: Number(score),
  }));

  const { error } = await supabase
    .from("golf_weekly_results")
    .upsert(rows, { onConflict: "tournament_id,player_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
