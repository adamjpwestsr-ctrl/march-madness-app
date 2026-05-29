import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load schedule
  const { data: schedule, error: scheduleErr } = await supabase
    .from("nfl_schedule")
    .select("*")
    .order("week_number", { ascending: true });

  if (scheduleErr || !schedule) {
    return NextResponse.json({ error: "Unable to load schedule" }, { status: 500 });
  }

  const week = schedule[0].week_number;

  // Load games for the week
  const { data: games } = await supabase
    .from("nfl_schedule")
    .select("*")
    .eq("week_number", week)
    .order("game_date", { ascending: true });

  // Load teams
  const { data: teams } = await supabase.from("nfl_teams").select("*");

  return NextResponse.json({
    week,
    games,
    teams,
  });
}
