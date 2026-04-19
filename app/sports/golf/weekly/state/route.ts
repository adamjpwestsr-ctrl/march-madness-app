import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, return empty but valid structure
  if (!user) {
    return NextResponse.json({
      picks: [],
      tournaments: [],
      players: [],
    });
  }

  // User picks
  const { data: picks } = await supabase
    .from("golf_weekly_picks")
    .select("tournament_id, player_id")
    .eq("user_id", user.id);

  // All tournaments
  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  // All players
  const { data: players } = await supabase
    .from("golf_players")
    .select("*")
    .order("name");

  return NextResponse.json({
    picks: picks || [],
    tournaments: tournaments || [],
    players: players || [],
  });
}
