import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Load all correct picks for NFL Weekly Pick’em
    const { data: picks, error: picksError } = await supabase
      .from("user_picks")
      .select("user_id, winner_team_id, game_id, sport")
      .eq("sport", "NFL");

    if (picksError) {
      console.error("Leaderboard picks error:", picksError);
      return NextResponse.json({ error: picksError.message }, { status: 500 });
    }

    if (!picks || picks.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    // 2. Load game results
    const { data: results, error: resultsError } = await supabase
      .from("sport_results")
      .select("game_id, winner_team_id, sport")
      .eq("sport", "NFL");

    if (resultsError) {
      console.error("Leaderboard results error:", resultsError);
      return NextResponse.json({ error: resultsError.message }, { status: 500 });
    }

    // Build result lookup
    const resultMap: Record<number, string> = {};
    results?.forEach((r) => {
      resultMap[r.game_id] = r.winner_team_id;
    });

    // 3. Score each pick
    const userPoints: Record<string, number> = {};

    picks.forEach((p) => {
      const correctWinner = resultMap[p.game_id];
      const isCorrect = correctWinner && correctWinner === p.winner_team_id;

      if (!userPoints[p.user_id]) {
        userPoints[p.user_id] = 0;
      }

      if (isCorrect) {
        userPoints[p.user_id] += 1; // 1 point per correct pick
      }
    });

    // 4. Load user names
    const userIds = Object.keys(userPoints);

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
        total_points: userPoints[uid],
        name: nameMap[uid] ?? null,
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .map((r, i) => ({
        ...r,
        rank: i + 1,
      }));

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Leaderboard fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
