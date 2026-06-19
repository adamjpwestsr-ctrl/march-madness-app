import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Current Tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("golf_tournaments")
    .select("id, name")
    .eq("is_current", true)
    .maybeSingle();

  if (tournamentError || !tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  // 2. Pick Counts
  const { data: pickCounts } = await supabase
    .from("golf_weekly_pick_counts")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("pick_count", { ascending: false });

  // 3. Performance Summary
  const { data: performance } = await supabase
    .from("golf_player_performance_summary")
    .select("*");

  if (!performance) {
    return Response.json(
      { error: "Performance summary unavailable" },
      { status: 500 }
    );
  }

  // 4. Defaults
  let mostPicked = "Currently no selections made";
  let sleeper = "Random selection";
  let trending = "Ludvig Åberg";
  let watch = "Xander Schauffele";

  // 5. MOST PICKED + SLEEPER
  if (pickCounts && pickCounts.length > 0) {
    const mostPickedPlayerId = pickCounts[0].player_id;
    mostPicked =
      performance.find((p) => p.player_id === mostPickedPlayerId)?.name ??
      "Currently no selections made";

    const leastPickedPlayerId = pickCounts[pickCounts.length - 1].player_id;
    sleeper =
      performance.find((p) => p.player_id === leastPickedPlayerId)?.name ??
      "Random selection";
  } else {
    const { data: randomPlayer } = await supabase
      .from("golf_players")
      .select("name")
      .order("random()")
      .limit(1)
      .maybeSingle();

    sleeper = randomPlayer?.name ?? "Random selection";
  }

  // 6. PLAYER TO WATCH
  if (performance.length > 0) {
    const top10Leader = [...performance]
      .filter((p) => p.top_10s > 0)
      .sort((a, b) => {
        if (b.top_10s !== a.top_10s) return b.top_10s - a.top_10s;
        return a.recent_avg_finish - b.recent_avg_finish;
      })[0];

    watch = top10Leader?.name ?? "Xander Schauffele";
  }

  // 7. TRENDING
  const trendingCandidates = performance
    .filter((p) => p.recent_avg_finish <= 15)
    .sort((a, b) => a.recent_avg_finish - b.recent_avg_finish);

  if (trendingCandidates.length > 0) {
    trending = trendingCandidates[0]?.name ?? "Ludvig Åberg";
  }

  // 8. Return Spotlight
  return Response.json({
    tournament: tournament.name,
    spotlight: {
      mostPicked,
      sleeper,
      trending,
      watch,
    },
  });
}


