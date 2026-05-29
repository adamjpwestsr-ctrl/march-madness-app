import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
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

  // Determine active week
  const { data: activeGames } = await supabase
    .from("nfl_schedule")
    .select("*")
    .order("week_number", { ascending: true });

  const week = activeGames?.[0]?.week_number ?? 1;

  // Load all games for the week
  const { data: games } = await supabase
    .from("nfl_schedule")
    .select("*")
    .eq("week_number", week)
    .order("game_date", { ascending: true });

  // Load teams
  const { data: teams } = await supabase.from("nfl_teams").select("*");

  // Load user pick
  const { data: currentPick } = await supabase
    .from("nfl_challenge_selections")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_number", week)
    .maybeSingle();

  // Load used teams
  const { data: used } = await supabase
    .from("nfl_challenge_selections")
    .select("selected_team_id")
    .eq("user_id", user.id);

  const usedTeamIds = used?.map((u) => u.selected_team_id) ?? [];

  return NextResponse.json({
    week,
    matchups: games?.map((g) => ({
      id: g.id,
      home: teams?.find((t) => t.id === g.home_team_id),
      away: teams?.find((t) => t.id === g.away_team_id),
    })),
    currentPick,
    usedTeamIds,
    usedTeams: teams
      ?.filter((t) => usedTeamIds.includes(t.id))
      .map((t) => t.name),
    locked: false, // You can add lock logic later
  });
}
