// app/api/march-madness-v2/admin/full-bracket/load/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ---------------------------------------------------------
  // 1. Load all teams
  // ---------------------------------------------------------
  const { data: teams, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('id, team_name, region, seed')
    .order('seed', { ascending: true });

  if (teamsError) {
    console.error('Teams load error:', teamsError);
    return NextResponse.json({ error: 'Failed to load teams' }, { status: 500 });
  }

  // ---------------------------------------------------------
  // 2. Load all games
  // ---------------------------------------------------------
  const { data: games, error: gamesError } = await supabase
    .from('tournament_games')
    .select(
      `
      id,
      game_number,
      round,
      region,
      team1_id,
      team2_id,
      winner,
      status,
      is_placeholder,
      completed,
      winner_to_game_id
    `
    )
    .order('game_number', { ascending: true });

  if (gamesError) {
    console.error('Games load error:', gamesError);
    return NextResponse.json({ error: 'Failed to load games' }, { status: 500 });
  }

  // ---------------------------------------------------------
  // 3. Convert DB rows → UI bracket structure
  // ---------------------------------------------------------
  function mapGame(g: any) {
    return {
      game_number: g.game_number,
      region: g.region,
      team1_source: g.team1_id
        ? { type: 'team', value: g.team1_id }
        : { type: 'team', value: null },

      team2_source: g.team2_id
        ? { type: 'team', value: g.team2_id }
        : { type: 'team', value: null },
    };
  }

  const bracket = {
    round64: games.filter((g) => g.round === 1).map(mapGame),
    round32: games.filter((g) => g.round === 2).map(mapGame),
    sweet16: games.filter((g) => g.round === 3).map(mapGame),
    elite8: games.filter((g) => g.round === 4).map(mapGame),
    final4: games.filter((g) => g.round === 5).map((g) => ({
      game_number: g.game_number,
      side: g.region === 'Left' ? 'Left' : 'Right',
      team1_source: g.team1_id ? { type: 'team', value: g.team1_id } : { type: 'team', value: null },
      team2_source: g.team2_id ? { type: 'team', value: g.team2_id } : { type: 'team', value: null },
    })),
    championship: games
      .filter((g) => g.round === 6)
      .map((g) => ({
        game_number: g.game_number,
        team1_source: g.team1_id ? { type: 'team', value: g.team1_id } : { type: 'team', value: null },
        team2_source: g.team2_id ? { type: 'team', value: g.team2_id } : { type: 'team', value: null },
      }))[0] ?? null,
  };

  // ---------------------------------------------------------
  // 4. Return JSON to your React component
  // ---------------------------------------------------------
  return NextResponse.json({
    teams,
    bracket,
  });
}
