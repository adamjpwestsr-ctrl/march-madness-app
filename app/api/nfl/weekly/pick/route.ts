import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { teamId } = body;

  if (!teamId) {
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
  }

  // Determine active week (first week that has not been completed)
  const { data: allGames, error: scheduleErr } = await supabase
    .from("nfl_schedule")
    .select("*")
    .order("week_number", { ascending: true });

  if (scheduleErr || !allGames || allGames.length === 0) {
    return NextResponse.json(
      { error: "Unable to load schedule" },
      { status: 500 }
    );
  }

  const week = allGames[0].week_number;

  // Find the specific game this team is playing in this week
  const { data: activeGames, error: activeErr } = await supabase
    .from("nfl_schedule")
    .select("*")
    .eq("week_number", week)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

  if (activeErr) {
    return NextResponse.json(
      { error: "Failed to load active games" },
      { status: 500 }
    );
  }

  // No game found → team is on bye or invalid pick
  if (!activeGames || activeGames.length === 0) {
    return NextResponse.json(
      { error: "This team does not have a game this week (bye week)" },
      { status: 400 }
    );
  }

  const gameId = activeGames[0].id;

  // Upsert pick
  const { error: pickErr } = await supabase
    .from("nfl_challenge_selections")
    .upsert(
      {
        user_id: user.id,
        week_number: week,
        selected_team_id: teamId,
        game_id: gameId,
      },
      { onConflict: "user_id,week_number" }
    );

  if (pickErr) {
    return NextResponse.json({ error: pickErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
