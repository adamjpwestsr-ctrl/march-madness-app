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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;

  // 1️⃣ Current tournament (safe fallback)
  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  const tournamentId = tournament?.id ?? null;

  // 2️⃣ Golfers (always return array)
  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .order("name", { ascending: true });

  // 3️⃣ User pick (safe fallback)
  const { data: pick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  // 4️⃣ History (safe fallback)
  const { data: history } = await supabase
    .from("golf_weekly_history_view")
    .select("*")
    .order("tournament_id", { ascending: false })
    .limit(5);

  // 5️⃣ Leaderboard (safe fallback)
  const { data: leaderboard } = await supabase
    .from("golf_weekly_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });

  // 6️⃣ Season progress (safe fallback)
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

  // 7️⃣ Return SAFE JSON
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
