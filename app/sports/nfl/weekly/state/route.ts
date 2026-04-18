import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all teams
  const { data: teams } = await supabase.from("nfl_teams").select("*");

  // Get user picks
  const { data: picks } = await supabase
    .from("weekly_picks")
    .select("*")
    .eq("user_id", user.id);

  const usedTeams = picks?.map((p) => p.team_id) || [];

  // Determine current week (simple version)
  const currentWeek = picks?.length ? Math.max(...picks.map((p) => p.week)) + 1 : 1;

  return NextResponse.json({
    teams,
    picks,
    usedTeams,
    currentWeek: Math.min(currentWeek, 17),
  });
}
