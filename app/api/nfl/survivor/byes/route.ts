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

    // 1. Load full NFL schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("sport_schedule")
      .select("week_number, home_team_id, away_team_id")
      .eq("sport", "NFL");

    if (scheduleError || !schedule) {
      console.error("Byes schedule error:", scheduleError);
      return NextResponse.json({ byes: [] });
    }

    // Determine week
    const week =
      requestedWeek ??
      (schedule.length > 0 ? schedule[0].week_number : 1);

    // 2. Load all teams
    const { data: allTeams, error: teamsError } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .eq("sport", "NFL");

    if (teamsError || !allTeams) {
      console.error("Byes teams error:", teamsError);
      return NextResponse.json({ byes: [] });
    }

    const allTeamIds = allTeams.map((t) => t.id);

    // 3. Find teams playing this week
    const playingTeamIds = Array.from(
      new Set(
        schedule
          .filter((g) => g.week_number === week)
          .flatMap((g) => [g.home_team_id, g.away_team_id])
      )
    );

    // 4. Teams NOT playing = bye teams
    const byeTeamIds = allTeamIds.filter((id) => !playingTeamIds.includes(id));

    const byes = allTeams
      .filter((t) => byeTeamIds.includes(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        abbrev: t.abbreviation,
        logo: t.logo_url,
      }));

    return NextResponse.json({ week, byes });
  } catch (err: any) {
    console.error("Survivor byes fatal error:", err);
    return NextResponse.json({ byes: [] });
  }
}
