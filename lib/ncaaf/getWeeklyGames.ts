import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function getWeeklyGames(year: number, week: number) {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("ncaaf_games")
    .select(`
      *,
      home_team:ncaaf_teams!ncaaf_games_home_team_id_fkey(*),
      away_team:ncaaf_teams!ncaaf_games_away_team_id_fkey(*)
    `)
    .eq("season_year", year)
    .eq("week", week)
    .order("start_time", { ascending: true });

  return data;
}
