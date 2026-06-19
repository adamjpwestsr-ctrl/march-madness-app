import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Load all picks for the user
  const { data: picks } = await supabase
    .from("nfl_challenge_selections")
    .select("week_number, selected_team_id, points_awarded, game_id")
    .eq("user_id", user.id)
    .order("week_number", { ascending: true });

  // Load schedule + teams for enrichment
  const { data: schedule } = await supabase.from("nfl_schedule").select("*");
  const { data: teams } = await supabase.from("nfl_teams").select("*");

  const rows = picks?.map((p) => {
    const game = schedule?.find((g) => g.id === p.game_id);
    const team = teams?.find((t) => t.id === p.selected_team_id);

    return {
      week: p.week_number,
      team: team?.name ?? "Unknown",
      abbrev: team?.abbreviation ?? "",
      logo: team?.logo_url ?? null,
      correct: p.points_awarded > 0,
      points: p.points_awarded,
    };
  });

  return NextResponse.json({ rows });
}


