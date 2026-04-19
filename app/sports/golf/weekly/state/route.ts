import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Try to get logged-in user (may be null)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Always load tournaments
  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  // Always load players
  const { data: players } = await supabase
    .from("golf_players")
    .select("*")
    .order("name");

  // Only load picks if we have a user
  let picks: { tournament_id: number; player_id: number }[] = [];

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
