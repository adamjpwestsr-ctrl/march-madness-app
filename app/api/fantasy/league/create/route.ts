import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const {
    leagueName,
    season,
    numTeams,
    draftType,
    pickTimer,
    draftOrder,
  } = body;

  const { data: league, error } = await supabase
    .from("fantasy_leagues")
    .insert({
      league_name: leagueName,
      season,
      num_teams: numTeams,
      draft_type: draftType,
      pick_timer: pickTimer,
      draft_order: draftOrder,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create league" }, { status: 500 });
  }

  const teamRows = draftOrder.map((teamId: number, idx: number) => ({
    league_id: league.id,
    team_name: `Team ${teamId}`,
    draft_position: idx + 1,
  }));

  const { error: teamErr } = await supabase
    .from("fantasy_teams")
    .insert(teamRows);

  if (teamErr) {
    console.error(teamErr);
    return NextResponse.json({ error: "Failed to create teams" }, { status: 500 });
  }

  return NextResponse.json({ leagueId: league.id });
}
