import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // Next.js 16 requires await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value;
        },
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;

  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .single();

  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .order("name", { ascending: true });

  const { data: pick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournament?.id)
    .maybeSingle();

  const { data: history } = await supabase
    .from("golf_weekly_history_view")
    .select("*")
    .order("tournament_id", { ascending: false })
    .limit(5);

  const { data: leaderboard } = await supabase
    .from("golf_weekly_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });

  const { data: seasonRow } = await supabase
    .from("golf_season_progress")
    .select("*")
    .single()
    .catch(() => ({ data: null }));

  const season = seasonRow
    ? {
        completed_events: seasonRow.completed_events ?? 0,
        total_events: seasonRow.total_events ?? 0,
      }
    : null;

  return Response.json({
    user_id: userId,
    tournament,
    golfers,
    pick,
    history,
    leaderboard,
    season,
  });
}
