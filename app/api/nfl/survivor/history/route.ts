import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Read mm_session cookie
    const cookie = req.headers.get("cookie") || "";
    const sessionRaw = cookie
      .split("; ")
      .find((row) => row.startsWith("mm_session="))
      ?.split("=")[1];

    if (!sessionRaw) {
      return NextResponse.json({ rows: [] });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(sessionRaw));
    } catch {
      return NextResponse.json({ rows: [] });
    }

    if (!user?.userId) {
      return NextResponse.json({ rows: [] });
    }

    // 1. Load Survivor picks (game_id = null)
    const { data: picks, error: picksError } = await supabase
      .from("user_picks")
      .select("week_number, winner_team_id")
      .eq("user_id", user.userId)
      .eq("sport", "NFL")
      .is("game_id", null)
      .order("week_number", { ascending: true });

    if (picksError) {
      console.error("Survivor history picks error:", picksError);
      return NextResponse.json({ rows: [] });
    }

    if (!picks || picks.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    // 2. Load NFL results
    const { data: results, error: resultsError } = await supabase
      .from("sport_results")
      .select("winner_team_id, game_id")
      .eq("sport", "NFL");

    if (resultsError) {
      console.error("Survivor history results error:", resultsError);
      return NextResponse.json({ rows: [] });
    }

    const winningTeams = new Set(results.map((r) => r.winner_team_id));

    // 3. Load team info
    const teamIds = Array.from(new Set(picks.map((p) => p.winner_team_id)));

    const { data: teams } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .in("id", teamIds);

    const teamMap: Record<string, any> = {};
    teams?.forEach((t) => {
      teamMap[t.id] = t;
    });

    // 4. Build history rows
    const rows = picks.map((p) => {
      const team = teamMap[p.winner_team_id];
      const correct = winningTeams.has(p.winner_team_id);

      return {
        week: p.week_number,
        team: team?.name ?? "Unknown",
        abbrev: team?.abbreviation ?? "",
        logo: team?.logo_url ?? null,
        correct,
        points: correct ? 1 : 0,
      };
    });

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Survivor history fatal error:", err);
    return NextResponse.json({ rows: [] });
  }
}
