// app/api/march-madness/brackets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import {
  TournamentGame,
  TournamentTeam,
} from '@/lib/marchMadnessTypes';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Handle both direct and Promise‑wrapped params for Next.js 16 compatibility
  const params =
    'then' in context.params
      ? await context.params
      : context.params;

  const supabase = createClient();
  const bracketId = params.id;

  // Fetch bracket data
  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('id', bracketId)
    .maybeSingle();

  const { data: openingRoundGames } = await supabase
    .from('games')
    .select('*')
    .eq('round', 'Opening');

  const { data: regionalGames } = await supabase
    .from('games')
    .select('*')
    .neq('round', 'Opening');

  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('bracket_id', bracketId);

  const { data: teams } = await supabase
    .from('teams')
    .select('*');

  return NextResponse.json({
    bracket,
    openingRoundGames: openingRoundGames as TournamentGame[],
    regionalGames: regionalGames?.reduce<Record<string, TournamentGame[]>>(
      (acc, game) => {
        const region = game.region ?? 'Unknown';
        acc[region] = acc[region] || [];
        acc[region].push(game);
        return acc;
      },
      {}
    ),
    picks,
    teams: teams as TournamentTeam[],
  });
}
