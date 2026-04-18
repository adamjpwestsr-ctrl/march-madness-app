import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import WeeklyClient from "./WeeklyClient";

export default async function NFLWeeklyPage() {
  const supabase = await createClient();

  // Load teams
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load user picks by week
  const { data: picks } = await supabase
    .from("nfl_weekly_picks")
    .select("*")
    .eq("user_id", user?.id || null);

  // Load leaderboard
  const { data: leaderboard } = await supabase.rpc("nfl_weekly_leaderboard");

  // Load weekly settings (current week + lock time)
  const { data: settings } = await supabase
    .from("nfl_weekly_settings")
    .select("*")
    .single();

  return (
    <WeeklyClient
      teams={teams || []}
      user={user}
      picks={picks || []}
      leaderboard={leaderboard || []}
      settings={settings || null}
    />
  );
}
