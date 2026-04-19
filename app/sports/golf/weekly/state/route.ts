export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  const { data: players } = await supabase
    .from("golf_players")
    .select("*")
    .order("name");

  let picks = [];

  if (user) {
    const { data: userPicks } = await supabase
      .from("golf_weekly_picks")
      .select("tournament_id, player_id")
      .eq("user_id", user.id);

    picks = userPicks || [];
  }

  return NextResponse.json({
    picks,
    tournaments: tournaments || [],
    players: players || [],
  });
}
