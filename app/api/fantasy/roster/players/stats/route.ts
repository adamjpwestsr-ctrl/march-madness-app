import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  const playerId = Number(searchParams.get("playerId"));
  const week = Number(searchParams.get("week"));

  const { data } = await supabase
    .from("nfl_stats_weekly")
    .select("*")
    .eq("player_id", playerId)
    .eq("week", week)
    .maybeSingle();

  return NextResponse.json(data || {});
}
