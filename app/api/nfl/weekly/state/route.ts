import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Load schedule
    const { data: schedule, error: scheduleErr } = await supabase
      .from("nfl_schedule")
      .select("*")
      .order("week_number", { ascending: true });

    if (scheduleErr) {
      console.error("Schedule error:", scheduleErr);
      return NextResponse.json({ error: scheduleErr.message }, { status: 500 });
    }

    if (!schedule || schedule.length === 0) {
      console.warn("No schedule rows found.");
      return NextResponse.json({
        week: null,
        games: [],
        teams: [],
      });
    }

    const week = schedule[0].week_number;

    // Load games for the week (NO game_date)
    const { data: games, error: gamesErr } = await supabase
      .from("nfl_schedule")
      .select("*")
      .eq("week_number", week)
      .order("home_team_id", { ascending: true });

    if (gamesErr) {
      console.error("Games error:", gamesErr);
      return NextResponse.json({ error: gamesErr.message }, { status: 500 });
    }

    // Load teams
    const { data: teams, error: teamsErr } = await supabase
      .from("nfl_teams")
      .select("*");

    if (teamsErr) {
      console.error("Teams error:", teamsErr);
      return NextResponse.json({ error: teamsErr.message }, { status: 500 });
    }

    return NextResponse.json({
      week,
      games,
      teams,
    });

  } catch (err: any) {
    console.error("NFL Weekly State Fatal Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
