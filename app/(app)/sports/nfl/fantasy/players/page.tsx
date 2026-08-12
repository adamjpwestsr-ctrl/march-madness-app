import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const supabase = await createSupabaseServerClient();

  const { data: players } = await supabase
    .from("nfl_players")
    .select("id, name, position, team, bye_week, projected_points")
    .order("projected_points", { ascending: false });

  return <PlayersPageClient initialPlayers={players || []} />;
}
