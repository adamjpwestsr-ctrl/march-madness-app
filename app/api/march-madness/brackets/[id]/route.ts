// app/api/march-madness/brackets/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import {
  TournamentGame,
  TournamentTeam,
} from '@/lib/marchMadnessTypes';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient();
  const bracketId = params.id;

  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('bracket_id', bracketId)
    .single();

  const { data: gamesData } = await supabase
    .from('tournament_games')
    .select('*');

  const { data: picksData } = await supabase
    .from('picks')
    .select('*')
    .eq('bracket_id', bracketId);

  const { data: teamsData } = await supabase
    .from('v_tournament_teams')
    .select('*');

  const openingRoundGames: TournamentGame[] =
    (gamesData ?? []).filter((g) => g.round === 0) as TournamentGame[];

  const regionalGamesByRegion: Record<string, TournamentGame[]> = {};
  (gamesData ?? [])
    .filter((g) => (g.round ?? 0) >= 1)
    .forEach((g) => {
      const region = g.region ?? 'Unknown';
      if (!regionalGamesByRegion[region]) regionalGamesByRegion[region] = [];
      regionalGamesByRegion[region].push(g as TournamentGame);
    });

  return NextResponse.json({
    bracket,
    openingRoundGames,
    regionalGames: regionalGamesByRegion,
    picks: picksData ?? [],
    teams: (teamsData ?? []) as TournamentTeam[],
  });
}

export async function PUT(req: Request, { params }: Params) {
  const supabase = createClient();
  const bracketId = params.id;
  const body = await req.json();

  const { bracket_name, icon, tiebreaker_score } = body;

  const { error } = await supabase
    .from('brackets')
    .update({
      bracket_name,
      icon,
      tiebreaker_score,
    })
    .eq('bracket_id', bracketId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
