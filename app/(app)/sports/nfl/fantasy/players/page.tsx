import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  // Trigger merge before fetching
await fetch("/api/fantasy/merge", { method: "POST" });

  const supabase = await createSupabaseServerClient();

  const { data: players } = await supabase
    .from("nfl_player_merged")
    .select(`
      id,
      espn_id,
      name,
      team,
      position,
      projected_points,
      last_week_points,
      season_points,
      snap_pct,
      target_share,
      redzone_usage,
      defense_rank,
      matchup_difficulty,
      headshot_url,
      opponent_team,
      is_home,
      kickoff_time,
      badge_tier,
      badge_role,
      badge_archetype
    `)
    .order("projected_points", { ascending: false });
  
  // Error Log
  console.log(players?.slice(0, 5));

  return <PlayersPageClient initialPlayers={players || []} />;
}
