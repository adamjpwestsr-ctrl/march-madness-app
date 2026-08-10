import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(req: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");

  const { data, error } = await supabase
    .from("fantasy_teams")
    .select("*")
    .eq("league_id", leagueId)
    .order("draft_position", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }

  return NextResponse.json(data);
}
