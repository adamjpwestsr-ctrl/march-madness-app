import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const { leagueId, teamId, pickNumber, playerId } = body;

  const { error } = await supabase
    .from("fantasy_picks")
    .insert({
      league_id: leagueId,
      team_id: teamId,
      pick_number: pickNumber,
      player_id: playerId,
    });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save pick" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
