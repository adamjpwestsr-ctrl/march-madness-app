// /app/api/nfl/weekly/pick/route.ts
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { week, teamId } = body;

  // Load settings
  const { data: settings } = await supabase
    .from("nfl_weekly_settings")
    .select("*")
    .single();

  if (!settings) {
    return NextResponse.json({ error: "Settings missing" }, { status: 500 });
  }

  const now = new Date();
  const lockTime = new Date(settings.lock_time);

  if (week !== settings.current_week) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  if (now >= lockTime) {
    return NextResponse.json({ error: "Week locked" }, { status: 400 });
  }

  // Check if team already used
  const { data: previousPicks } = await supabase
    .from("nfl_weekly_picks")
    .select("*")
    .eq("user_id", user.id);

  const usedTeamIds = new Set(previousPicks?.filter(p => p.week < week).map(p => p.team_id));

  if (usedTeamIds.has(teamId)) {
    return NextResponse.json({ error: "Team already used" }, { status: 400 });
  }

  // Upsert pick
  const { error } = await supabase
    .from("nfl_weekly_picks")
    .upsert({
      user_id: user.id,
      week,
      team_id: teamId,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
