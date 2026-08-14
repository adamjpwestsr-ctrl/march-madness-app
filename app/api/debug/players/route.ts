import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: players } = await supabase
    .from("nfl_player_merged")
    .select("*")
    .limit(5);

  console.log("DEBUG PLAYERS:", players);

  return Response.json(players);
}
