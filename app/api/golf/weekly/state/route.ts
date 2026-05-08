import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Get logged-in user (optional)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Golf state - getUser error:", userError);
  }

  const today = new Date().toISOString().split("T")[0];

  // Fetch next upcoming tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("golf_tournaments")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) {
    console.error("Golf state - tournament error:", tournamentError);
  }

  // Fetch active golfers
  const { data: golfers, error: golfersError } = await supabase
    .from("golf_players")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (golfersError) {
    console.error("Golf state - golfers error:", golfersError);
  }

  // Fetch user's pick (if logged in and tournament exists)
  let pick = null;

  if (user && tournament) {
    const { data: pickData, error: pickError } = await supabase
      .from("golf_weekly_picks")
      .select("*")
      .eq("user_id", user.id)
      .eq("tournament_id", tournament.id)
      .single();

    if (pickError && pickError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Golf state - pick error:", pickError);
    }

    pick = pickData || null;
  }

  return NextResponse.json({
    tournament: tournament || null,
    golfers: golfers || [],
    pick,
  });
}
