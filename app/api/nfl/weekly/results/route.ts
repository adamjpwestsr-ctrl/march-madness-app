import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Load all NFL game results
    const { data: results, error: resultsError } = await supabase
      .from("sport_results")
      .select("game_id, winner_team_id, sport")
      .eq("sport", "NFL");

    if (resultsError) {
      console.error("Results error:", resultsError);
      return NextResponse.json({ rows: [] });
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    // 2. Load schedule to get week numbers + team IDs
    const { data: schedule, error: scheduleError } = await supabase
      .from("sport_schedule")
      .select("id, week_number, home_team_id, away_team_id")
      .eq("sport", "NFL");

    if (scheduleError) {
      console.error("Schedule error:", scheduleError);
      return NextResponse.json({ rows: [] });
    }

    const scheduleMap: Record<number, any> = {};
    schedule?.forEach((g) => {
      scheduleMap[g.id] = g;
    });

    // 3. Collect all team IDs involved in results
    const teamIds = Array.from(
      new Set(
        results.map((r) => r.winner_team_id)
      )
    );

    // 4. Load team info
    const { data: teams } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .in("id", teamIds);

    const teamMap: Record<string, any> = {};
    teams?.forEach((t) => {
      teamMap[t.id] = t;
    });

    // 5. Build result rows
    const rows = results.map((r) => {
      const sched = scheduleMap[r.game_id];
      const team = teamMap[r.winner_team_id];

      return {
        game_id: r.game_id,
        week: sched?.week_number ?? null,
        winner_team_id: r.winner_team_id,
        team: team?.name ?? "Unknown",
        abbrev: team?.abbreviation ?? "",
        logo: team?.logo_url ?? null,
      };
    });

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Results fatal error:", err);
    return NextResponse.json({ rows: [] });
  }
}
