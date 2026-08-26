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
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        perfectWeeks: 0,
      });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(sessionRaw));
    } catch {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        perfectWeeks: 0,
      });
    }

    if (!user?.userId) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        perfectWeeks: 0,
      });
    }

    // 1. Load Survivor picks (game_id = null)
    const { data: picks, error: picksError } = await supabase
      .from("user_picks")
      .select("week_number, winner_team_id")
      .eq("user_id", user.userId)
      .eq("sport", "NFL")
      .is("game_id", null)
      .order("week_number", { ascending: true });

    if (picksError || !picks || picks.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        perfectWeeks: 0,
      });
    }

    // 2. Load NFL results
    const { data: results, error: resultsError } = await supabase
      .from("sport_results")
      .select("winner_team_id")
      .eq("sport", "NFL");

    if (resultsError) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        perfectWeeks: 0,
      });
    }

    const winningTeams = new Set(results.map((r) => r.winner_team_id));

    // 3. Compute streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let totalCorrect = 0;
    let perfectWeeks = 0;

    picks.forEach((p) => {
      const correct = winningTeams.has(p.winner_team_id);

      if (correct) {
        currentStreak += 1;
        totalCorrect += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
        perfectWeeks += 1;
      } else {
        currentStreak = 0;
      }
    });

    return NextResponse.json({
      currentStreak,
      longestStreak,
      totalCorrect,
      perfectWeeks,
    });
  } catch (err: any) {
    console.error("Survivor streaks fatal error:", err);
    return NextResponse.json({
      currentStreak: 0,
      longestStreak: 0,
      totalCorrect: 0,
      perfectWeeks: 0,
    });
  }
}
