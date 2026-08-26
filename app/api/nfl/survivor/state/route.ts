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
      .select("id,week_number,home_team_id,away_team_id,game_date")
      .eq("sport", "NFL")
      .order("week_number", { ascending: true });

    if (scheduleError) {
      console.error("Survivor state schedule error:", scheduleError);
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    if (!schedule || schedule.length === 0) {
      return NextResponse.json({
        week: null,
        matchups: [],
        teams: {},
        lockTime: null,
      });
    }

    // Determine active week
    const week = requestedWeek ?? schedule[0].week_number;

    // 2. Load matchups for selected week
    const { data: games, error: gamesError } = await supabase
      .from("sport_schedule")
      .select("id,home_team_id,away_team_id,game_date")
      .eq("sport", "NFL")
      .eq("week_number", week)
      .order("game_date", { ascending: true });

    if (gamesError) {
      console.error("Survivor state games error:", gamesError);
      return NextResponse.json({ error: gamesError.message }, { status: 500 });
    }

    // 3. Load teams
    const teamIds = Array.from(
      new Set(games.flatMap((g) => [g.home_team_id, g.away_team_id]))
    );

    const { data: teamRows, error: teamsError } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .in("id", teamIds);

    if (teamsError) {
      console.error("Survivor state teams error:", teamsError);
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }

    const teamsById: Record<string, any> = {};
    teamRows?.forEach((t) => {
      teamsById[t.id] = {
        id: t.id,
        name: t.name,
        abbreviation: t.abbreviation,
        logo_url: t.logo_url,
      };
    });

    // 4. Build matchups
    const matchups = games.map((g) => ({
      id: g.id,
      home: teamsById[g.home_team_id],
      away: teamsById[g.away_team_id],
      game_date: g.game_date,
    }));

    // 5. Compute lock time (earliest kickoff)
    const lockTime =
      games.length > 0
        ? games.reduce<string | null>((min, g) => {
            const d = g.game_date as string;
            if (!min) return d;
            return new Date(d) < new Date(min) ? d : min;
          }, null)
        : null;

    return NextResponse.json({
      week,
      matchups,
      teams: teamsById,
      lockTime,
    });
  } catch (err: any) {
    console.error("Survivor state fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
