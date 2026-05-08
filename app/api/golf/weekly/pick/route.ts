import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { golferId } = body;

  if (!golferId) {
    return NextResponse.json(
      { error: "Missing golferId" },
      { status: 400 }
    );
  }

  // Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Golf pick - getUser error:", userError);
  }

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Get next upcoming tournament
  const today = new Date().toISOString().split("T")[0];

  const { data: tournament, error: tournamentError } = await supabase
    .from("golf_tournaments")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) {
    console.error("Golf pick - tournament error:", tournamentError);
  }

  if (!tournament) {
    return NextResponse.json(
      { error: "No active tournament found" },
      { status: 404 }
    );
  }

  // Upsert pick
  const { error: upsertError } = await supabase
    .from("golf_weekly_picks")
    .upsert({
      user_id: user.id,          // NOTE: user.id must match integer/uuid type
      tournament_id: tournament.id,
      player_id: golferId,
      created_at: new Date().toISOString(),
    })
    .select();

  if (upsertError) {
    console.error("Golf pick - upsert error:", upsertError);
    return NextResponse.json(
      { error: "Failed to save pick", details: upsertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
