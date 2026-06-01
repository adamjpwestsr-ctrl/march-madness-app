import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { week, winningTeams } = await req.json();

    if (!week || !Array.isArray(winningTeams)) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    // Update winners in schedule
    for (const teamId of winningTeams) {
      await supabase
        .from("nfl_schedule")
        .update({ winner_team_id: teamId })
        .eq("week_number", week)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    }

    // Load all picks for the week
    const { data: picks } = await supabase
      .from("nfl_challenge_selections")
      .select("*")
      .eq("week_number", week);

    if (picks && picks.length > 0) {
      for (const pick of picks) {
        const isCorrect = winningTeams.includes(pick.selected_team_id);

        await supabase
          .from("nfl_challenge_selections")
          .update({ points_awarded: isCorrect ? 1 : 0 })
          .eq("id", pick.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Results route fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
