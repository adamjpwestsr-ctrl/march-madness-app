import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;

  // 1. Get current tournament
  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .single();

  // 2. Get golfers for this tournament
  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .order("name", { ascending: true });

  // 3. Get user's pick
  const { data: pick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournament?.id)
    .maybeSingle();

  // 4. Get user history (last 5)
  const { data: history } = await supabase
    .from("golf_weekly_history_view")
    .select("*")
    .order("tournament_id", { ascending: false })
    .limit(5);

  // 5. Leaderboard
  const { data: leaderboard } = await supabase
    .from("golf_weekly_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });

  return Response.json({
    user_id: userId,
    tournament,
    golfers,
    pick,
    history,
    leaderboard,
  });
}
