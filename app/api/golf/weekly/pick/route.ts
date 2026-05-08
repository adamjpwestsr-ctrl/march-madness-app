import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { golferId } = body;

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get next upcoming tournament
  const today = new Date().toISOString().split("T")[0];
  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  if (!tournament) {
    return NextResponse.json({ error: "No active tournament found" }, { status: 404 });
  }

  // Upsert pick
const { error } = await supabase
  .from("golf_weekly_picks")
  .upsert({
    user_id: user.id,
    tournament_id: tournament.id,
    player_id: golferId, // ✅ correct column name
    created_at: new Date().toISOString(),
  })
  .select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save pick" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
