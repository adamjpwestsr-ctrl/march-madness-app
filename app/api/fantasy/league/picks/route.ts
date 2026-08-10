import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");

  const { data, error } = await supabase
    .from("fantasy_picks")
    .select("*")
    .eq("league_id", leagueId)
    .order("pick_number", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load picks" }, { status: 500 });
  }

  return NextResponse.json(data);
}
