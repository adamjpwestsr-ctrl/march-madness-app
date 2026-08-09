import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { rosterId, week, playerIds } = await req.json();

  const { data } = await supabase
    .from("fantasy_lineups")
    .insert({
      roster_id: rosterId,
      week,
      player_ids: playerIds,
    })
    .select("*")
    .single();

  return NextResponse.json(data);
}
