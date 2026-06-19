import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { week_number } = body;

  // Load all games for the week
  const { data: games } = await supabase
    .from("nfl_schedule")
    .select("*")
    .eq("week_number", week_number);

  // Score each pick
  for (const g of games ?? []) {
    const { data: picks } = await supabase
      .from("nfl_challenge_selections")
      .select("*")
      .eq("game_id", g.id);

    for (const p of picks ?? []) {
      const correct = p.selected_team_id === g.winner_team_id;

      await supabase
        .from("nfl_challenge_selections")
        .update({ points_awarded: correct ? 1 : 0 })
        .eq("id", p.id);
    }
  }

  return NextResponse.json({
    success: true,
    message: "NFL week scored successfully",
  });
}


