import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  // Correct SSR cookie wrapper for your Supabase version
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Determine active week
  const { data: activeGames, error: activeErr } = await supabase
    .from("nfl_schedule")
    .select("*")
    .order("week_number", { ascending: true });

  if (activeErr || !activeGames || activeGames.length === 0) {
    return NextResponse.json(
      { error: "Unable to load schedule" },
      { status: 500 }
    );
  }

  const week = activeGames[0].week_number;

  // Load all games for the week
  const { data: games, error: gamesErr } = await supabase
    .from("nfl_schedule")
    .select("*")
    .eq("week_number", week)
    .order("game_date", { ascending: true });

  if (gamesErr) {
    return NextResponse.json({ error: gamesErr.message }, { status: 500 });
  }

  // Load teams
  const { data: teams, error: teamsErr } = await supabase
    .from("nfl_teams")
    .select("*");

  if (teamsErr) {
    return NextResponse.json({ error: teamsErr.message }, { status: 500 });
  }

  // Load user pick
  const { data: currentPick, error: pickErr } = await supabase
    .from("nfl_challenge_selections")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_number", week)
    .maybeSingle();

  if (pickErr && pickErr.code !== "PGRST116") {
    return NextResponse.json({ error: pickErr.message }, { status: 500 });
  }

  // Load used teams
  const { data: used, error: usedErr } = await supabase
    .from("nfl_challenge_selections")
    .select("selected_team_id")
    .eq("user_id", user.id);

  if (usedErr) {
    return NextResponse.json({ error: usedErr.message }, { status: 500 });
  }

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
    locked: false,
  });
}
