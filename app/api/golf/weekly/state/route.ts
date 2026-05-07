import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine today's date
  const today = new Date().toISOString().split("T")[0];

  // Fetch next upcoming tournament
  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  // Fetch active golfers
  const { data: golfers } = await supabase
    .from("golf_players")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Fetch user's pick (if logged in)
  let pick = null;

  if (user && tournament) {
    const { data: pickData } = await supabase
      .from("golf_weekly_picks")
      .select("*")
      .eq("user_id", user.id)
      .eq("tournament_id", tournament.id)
      .single();

    pick = pickData || null;
  }

  return NextResponse.json({
    tournament: tournament || null,
    golfers: golfers || [],
    pick,
  });
}
