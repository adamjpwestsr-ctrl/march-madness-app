import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tournament_id, player_id } = await req.json();

  // Enforce pick-once-per-player per season
  const { data: existing } = await supabase
    .from("golf_weekly_picks")
    .select("tournament_id")
    .eq("user_id", user.user_metadata.user_id)
    .eq("player_id", player_id);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "You have already picked this player this season." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("golf_weekly_picks").upsert({
    user_id: user.user_metadata.user_id,
    tournament_id,
    player_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
