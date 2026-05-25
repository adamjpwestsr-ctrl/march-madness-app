import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // ✅ Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;

  // ✅ Try to find the current tournament
  let { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  // ✅ Fallback: if none marked as current, pick the next upcoming tournament
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

  // ✅ Load golfers
  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .order("name", { ascending: true });

  // ✅ Load user pick
  const { data: pick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  // ✅ Load recent history
  const { data: history } = await supabase
    .from("golf_weekly_history_view")
    .select("*")
    .order("tournament_id", { ascending: false })
    .limit(5);

  // ✅ Load leaderboard
  const { data: leaderboard } = await supabase
    .from("golf_weekly_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });

  // ✅ Load season progress
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

  // ✅ Return safe JSON (no undefined values)
  return Response.json({
    user_id: userId,
    tournament: tournament ?? null,
    golfers: golfers ?? [],
    pick: pick ?? null,
    history: history ?? [],
    leaderboard: leaderboard ?? [],
    season,
  });
}
