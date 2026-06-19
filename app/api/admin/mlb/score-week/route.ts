import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { week_number } = await req.json();

    if (!week_number) {
      return NextResponse.json(
        { error: "Missing week_number" },
        { status: 400 }
      );
    }

    // Fetch all series for the week
    const { data: series, error: seriesErr } = await supabase
      .from("mlb_schedule")
      .select("series_id, winner_team_id, is_draw")
      .eq("week_number", week_number);

    if (seriesErr) throw seriesErr;
    if (!series?.length)
      return NextResponse.json(
        { error: "No series found for this week" },
        { status: 404 }
      );

    // Score each series
    for (const s of series) {
      const { data: picks, error: picksErr } = await supabase
        .from("mlb_challenge_selections")
        .select("id, selected_team_id")
        .eq("series_id", s.series_id)
        .eq("week_number", week_number);

      if (picksErr) throw picksErr;
      if (!picks?.length) continue;

      for (const p of picks) {
        const correct = !s.is_draw && p.selected_team_id === s.winner_team_id;

        const { error: updateErr } = await supabase
          .from("mlb_challenge_selections")
          .update({ points_awarded: correct ? 1 : 0 })
          .eq("id", p.id);

        if (updateErr) throw updateErr;
      }
    }

    // Optional: refresh leaderboard view if materialized
	try {
  await supabase.rpc("refresh_mlb_leaderboard_view");
} catch (_) {
  // ignore if function doesn't exist
}


    return NextResponse.json({ success: true, message: "Week scored successfully" });
  } catch (err: any) {
    console.error("Score week error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

