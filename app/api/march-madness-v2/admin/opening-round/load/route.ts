import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Load Opening Round teams (region is NULL)
    const { data: teams, error: teamError } = await supabase
      .from('tournament_teams')
      .select('id, team_name, seed, true_seed, region')
      .is('region', null)
      .order('true_seed', { ascending: true });

    if (teamError) throw teamError;

    // Load Opening Round games (round = 0)
    const { data: games, error: gameError } = await supabase
      .from('tournament_games')
      .select('*')
      .eq('round', 0)
      .order('game_number', { ascending: true });

    if (gameError) throw gameError;

    return NextResponse.json({ teams, games });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to load opening round data' },
      { status: 500 }
    );
  }
}
