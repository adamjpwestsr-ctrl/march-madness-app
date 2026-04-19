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

  let picks: any[] = [];

  if (user) {
    const { data } = await supabase
      .from("golf_weekly_picks")
      .select("tournament_id, player_id, points_awarded")
      .eq("user_id", user.user_metadata.user_id); // or your mapping
    picks = data || [];
  }

  return NextResponse.json({ tournaments: tournaments || [], picks });
}
