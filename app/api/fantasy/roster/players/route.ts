import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  const rosterId = Number(searchParams.get("rosterId"));

  const { data } = await supabase
    .from("fantasy_lineups")
    .select("player_ids")
    .eq("roster_id", rosterId)
    .order("week", { ascending: false })
    .limit(1)
    .maybeSingle();

  const playerIds = data?.player_ids || [];

  if (playerIds.length === 0) return NextResponse.json([]);

  const { data: players } = await supabase
    .from("nfl_players")
    .select("*")
    .in("id", playerIds);

  return NextResponse.json(players || []);
}
