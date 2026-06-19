import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: cookieStore });

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const authId = user.id;

  // Current tournament
  let { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (!tournament) {
    const { data: nextTournament } = await supabase
      .from("golf_tournaments")
      .select("*")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    tournament = nextTournament ?? null;
  }

  const tournamentId = tournament?.id ?? null;

  // Load golfers
  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .order("name", { ascending: true });

  // Load ALL picks for this user
  const { data: allPicks } = await supabase
    .from("golf_weekly_picks")
    .select("tournament_id, player_id")
    .eq("auth_id", authId);

  // Load pick for current tournament
  const { data: pick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("auth_id", authId)
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  // Load history
  const { data: history } = await supabase
    .from("golf_weekly_history_view")
    .select("*")
    .order("tournament_id", { ascending: false })
    .limit(5);

  // Load leaderboard
  const { data: leaderboard } = await supabase
    .from("golf_weekly_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });

  // Load season progress
  const { data: seasonRow } = await supabase
    .from("golf_season_progress")
    .select("*")
    .maybeSingle();

  const season = seasonRow
    ? {
        completed_events: seasonRow.completed_events ?? 0,
        total_events: seasonRow.total_events ?? 0,
      }
    : { completed_events: 0, total_events: 0 };

  return Response.json({
    user_id: authId,
    tournament: tournament ?? null,
    golfers: golfers ?? [],
    pick: pick ?? null,
    picks: allPicks ?? [],
    history: history ?? [],
    leaderboard: leaderboard ?? [],
    season,
  });
}
