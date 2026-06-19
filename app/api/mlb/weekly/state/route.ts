import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = Number(searchParams.get("week"));

  if (!week) {
    return NextResponse.json({ error: "Missing week" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mlb_schedule")
    .select(`
      series_id,
      week_number,
      start_date,
      end_date,
      series_length,
      home_team_id,
      away_team_id,
      home:mlb_teams!mlb_schedule_home_team_id_fkey (
        name,
        abbreviation
      ),
      away:mlb_teams!mlb_schedule_away_team_id_fkey (
        name,
        abbreviation
      )
    `)
    .eq("week_number", week)
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data.map((s: any) => ({
    series_id: s.series_id,
    week_number: s.week_number,
    start_date: s.start_date,
    end_date: s.end_date,
    series_length: s.series_length,
    home_team_id: s.home_team_id,
    away_team_id: s.away_team_id,
    home_name: s.home?.name ?? "",
    home_abbrev: s.home?.abbreviation ?? "",
    away_name: s.away?.name ?? "",
    away_abbrev: s.away?.abbreviation ?? "",
  }));

  return NextResponse.json({ series: formatted });
}


