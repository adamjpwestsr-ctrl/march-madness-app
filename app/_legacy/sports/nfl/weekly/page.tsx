import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import WeeklyClient from "./WeeklyClient";

export default async function NFLWeeklyPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return;
    const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load user picks by week
  if (!supabase) return;
    const { data: picks } = await supabase
    .from("nfl_weekly_picks")
    .select("*")
    .eq("user_id", user?.id || null);

  // Load leaderboard
  if (!supabase) return;
const {  data: leaderboard  } = await supabase.rpc
    await supabase.rpc("nfl_weekly_leaderboard");

  // Load weekly settings (current week + lock time)
  if (!supabase) return;
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


