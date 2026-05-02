import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { week, winningTeamId } = body;

  // Save winner
  const { error: winnerError } = await supabase
    .from("nfl_weekly_results")
    .upsert({
      week,
      winning_team_id: winningTeamId,
      updated_at: new Date().toISOString()
    });

  if (winnerError) {
    return NextResponse.json({ error: winnerError.message }, { status: 500 });
  }

  // Score all picks for that week
  const { error: scoringError } = await supabase.rpc("nfl_weekly_score_week", {
    input_week: week
  });

  if (scoringError) {
    return NextResponse.json({ error: scoringError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
