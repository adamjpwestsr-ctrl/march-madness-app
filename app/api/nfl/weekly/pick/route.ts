import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { teamId } = body;

  // Determine active week
  const { data: activeGames } = await supabase
    .from("nfl_schedule")
    .select("*")
    .order("week_number", { ascending: true });

  const week = activeGames?.[0]?.week_number ?? 1;

  // Upsert pick
  const { error } = await supabase.from("nfl_challenge_selections").upsert(
    {
      user_id: user.id,
      week_number: week,
      selected_team_id: teamId,
      game_id: activeGames[0].id,
    },
    { onConflict: "user_id,week_number" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
