// lib/sports/weekly.ts
import { createClient } from '@/utils/supabase/server';

export type WeeklyGame = {
  id: number;
  sport: string;
  week_number: number;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  season_year: number;
};

export type Team = {
  id: string;
  sport: string;
  name: string;
  abbreviation: string;
};

export type WeeklyData = {
  games: WeeklyGame[];
  teamsById: Record<string, Team>;
  lockTime: string | null;
};

export async function getWeeklyData(
  sport: 'NBA' | 'NHL',
  week: number,
): Promise<WeeklyData> {
  const supabase = createClient();

  const { data: games, error: gamesError } = await supabase
    .from('sport_schedule')
    .select('id,sport,week_number,home_team_id,away_team_id,game_date,season_year')
    .eq('sport', sport)
    .eq('week_number', week)
    .order('game_date', { ascending: true });

  if (gamesError) throw gamesError;

  const teamIds = Array.from(
    new Set(
      (games ?? []).flatMap(g => [g.home_team_id, g.away_team_id]),
    ),
  );

  const { data: teams, error: teamsError } = await supabase
    .from('teams_sports')
    .select('id,sport,name,abbreviation')
    .in('id', teamIds);

  if (teamsError) throw teamsError;

  const teamsById: Record<string, Team> = {};
  (teams ?? []).forEach(t => {
    teamsById[t.id] = {
      id: t.id,
      sport: t.sport,
      name: t.name,
      abbreviation: t.abbreviation,
    };
  });

  const lockTime =
    games && games.length
      ? games.reduce<string | null>((min, g) => {
          const d = g.game_date;
          if (!min) return d;
          return new Date(d) < new Date(min) ? d : min;
        }, null)
      : null;

  return {
    games: games ?? [],
    teamsById,
    lockTime,
  };
}
