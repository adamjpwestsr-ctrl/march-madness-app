// /lib/survivorEngine.ts
import { SupabaseClient } from "@supabase/supabase-js";

export async function processSurvivorWeek(
  supabase: SupabaseClient,
  week: number,
  winningTeamId: string
) {
  // Load all survivor picks for this week
  const { data: picks, error: picksError } = await supabase
    .from("user_picks")
    .select("user_id, winner_team_id")
    .eq("sport", "NFL")
    .eq("week_number", week)
    .is("game_id", null);

  if (picksError) throw picksError;

  // For each user, determine elimination or streak increment
  for (const pick of picks || []) {
    const correct = pick.winner_team_id === winningTeamId;

    // Update survivor_stats table (example)
    const { error: statsError } = await supabase.rpc("update_survivor_stats", {
      p_user_id: pick.user_id,
      p_week: week,
      p_correct: correct,
    });

    if (statsError) throw statsError;
  }

  return true;
}
