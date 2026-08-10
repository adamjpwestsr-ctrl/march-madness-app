import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const { leagueId, userId, season } = body;

  const { data: roster, error: rosterErr } = await supabase
    .from("fantasy_roster")
    .insert({
      user_id: userId,
      season,
    })
    .select()
    .single();

  if (rosterErr) {
    console.error(rosterErr);
    return NextResponse.json({ error: "Failed to create roster" }, { status: 500 });
  }

  const { data: picks, error: picksErr } = await supabase
    .from("fantasy_picks")
    .select("player_id")
    .eq("league_id", leagueId);

  if (picksErr) {
    console.error(picksErr);
    return NextResponse.json({ error: "Failed to load picks" }, { status: 500 });
  }

  const rows = picks.map((p) => ({
    roster_id: roster.id,
    player_id: p.player_id,
  }));

  const { error: insertErr } = await supabase
    .from("fantasy_roster_players")
    .insert(rows);

  if (insertErr) {
    console.error(insertErr);
    return NextResponse.json({ error: "Failed to add players to roster" }, { status: 500 });
  }

  return NextResponse.json({ rosterId: roster.id });
}
