import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Load all Survivor picks (game_id is null)
    const { data: picks, error: picksError } = await supabase
      .from("user_picks")
      .select("user_id, week_number, winner_team_id, sport")
      .eq("sport", "NFL")
      .is("game_id", null) // Survivor-only picks
      .order("week_number", { ascending: true });

    if (picksError) {
      console.error("Survivor leaderboard picks error:", picksError);
      return NextResponse.json({ rows: [] });
    }

    if (!picks || picks.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    // 2. Load NFL results
    const { data: results, error: resultsError } = await supabase
      .from("sport_results")
      .select("game_id, winner_team_id, sport")
      .eq("sport", "NFL");

    if (resultsError) {
      console.error("Survivor leaderboard results error:", resultsError);
      return NextResponse.json({ rows: [] });
    }

    // Build result lookup by team_id
    const winningTeams = new Set(results.map((r) => r.winner_team_id));

    // 3. Score Survivor picks
    const userStats: Record<
      string,
      {
        longestStreak: number;
        currentStreak: number;
        totalCorrect: number;
        eliminatedWeek: number | null;
      }
    > = {};

    picks.forEach((p) => {
      if (!userStats[p.user_id]) {
        userStats[p.user_id] = {
          longestStreak: 0,
          currentStreak: 0,
          totalCorrect: 0,
          eliminatedWeek: null,
        };
      }

      const stats = userStats[p.user_id];
      const correct = winningTeams.has(p.winner_team_id);

      if (correct) {
        stats.currentStreak += 1;
        stats.totalCorrect += 1;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      } else {
        // First incorrect pick eliminates the user
        if (stats.eliminatedWeek === null) {
          stats.eliminatedWeek = p.week_number;
        }
        stats.currentStreak = 0;
      }
    });

    // 4. Load user names
    const userIds = Object.keys(userStats);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const nameMap: Record<string, string | null> = {};
    profiles?.forEach((p) => {
      nameMap[p.id] = p.full_name ?? null;
    });

    // 5. Build leaderboard rows
    const rows = userIds
      .map((uid) => ({
        user_id: uid,
        name: nameMap[uid] ?? null,
        longestStreak: userStats[uid].longestStreak,
        currentStreak: userStats[uid].currentStreak,
        totalCorrect: userStats[uid].totalCorrect,
        eliminatedWeek: userStats[uid].eliminatedWeek,
      }))
      .sort((a, b) => {
        // Sort by:
        // 1. longest streak
        // 2. total correct
        // 3. earliest elimination (null = still alive)
        if (b.longestStreak !== a.longestStreak)
          return b.longestStreak - a.longestStreak;

        if (b.totalCorrect !== a.totalCorrect)
          return b.totalCorrect - a.totalCorrect;

        if (a.eliminatedWeek === null && b.eliminatedWeek !== null) return -1;
        if (b.eliminatedWeek === null && a.eliminatedWeek !== null) return 1;

        return (a.eliminatedWeek ?? 999) - (b.eliminatedWeek ?? 999);
      })
      .map((r, i) => ({
        ...r,
        rank: i + 1,
      }));

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Survivor leaderboard fatal error:", err);
    return NextResponse.json({ rows: [] });
  }
}
