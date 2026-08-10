import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");

  const { data, error } = await supabase
    .from("fantasy_leagues")
    .select("*")
    .eq("id", leagueId)
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "League not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
