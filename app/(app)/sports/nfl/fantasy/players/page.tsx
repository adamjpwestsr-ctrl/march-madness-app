import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  // Trigger merge before fetching
await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/fantasy/merge`, {
  method: "POST",
});

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
    badge_archetype,
    status
  `)
  .eq("status", "Active") // ✅ only active players
  .order("projected_points", { ascending: false });
  
  // Error Log
  console.log(players?.slice(0, 5));

  return <PlayersPageClient initialPlayers={players || []} />;
}
