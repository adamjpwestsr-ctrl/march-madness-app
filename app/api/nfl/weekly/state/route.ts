import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { searchParams } = new URL(req.url);
    const requestedWeek = searchParams.get("week")
      ? Number(searchParams.get("week"))
      : null;

    // Load full schedule
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
        locked: false,
        lock_time: null,
      });
    }

    // Determine active week
    const week = requestedWeek ?? schedule[0].week_number;

    // Load games for selected week
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

    // Load lock state
    const { data: settings } = await supabase
      .from("nfl_weekly_settings")
      .select("*")
      .eq("week_number", week)
      .maybeSingle();

    return NextResponse.json({
      week,
      games,
      teams,
      locked: settings?.is_locked ?? false,
      lock_time: settings?.lock_time ?? null,
    });

  } catch (err: any) {
    console.error("NFL Weekly State Fatal Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



