import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  // trigger merge before fetching
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fantasy/merge`, {
    method: "POST",
  });

  const supabase = await createSupabaseServerClient();

  const { data: players } = await supabase
    .from("nfl_player_merged")
    .select(`
      espn_id,
      name,
      team,
      position,
      bye_week,
      projected_points,
      last_week_points,
      season_points,
      snap_pct,
      target_share,
      redzone_usage
    `)
    .order("projected_points", { ascending: false });

  return <PlayersPageClient initialPlayers={players || []} />;
}
