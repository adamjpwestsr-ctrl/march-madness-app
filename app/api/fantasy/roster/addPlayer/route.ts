import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { rosterId, playerId } = await req.json();

  const { data: latest } = await supabase
    .from("fantasy_lineups")
    .select("*")
    .eq("roster_id", rosterId)
    .order("week", { ascending: false })
    .limit(1)
    .maybeSingle();

  const week = latest?.week || 1;
  const playerIds = latest?.player_ids || [];

  if (!playerIds.includes(playerId)) {
    playerIds.push(playerId);
  }

  const { data } = await supabase
    .from("fantasy_lineups")
    .upsert({
      roster_id: rosterId,
      week,
      player_ids: playerIds,
    })
    .select("*")
    .single();

  return NextResponse.json(data);
}
