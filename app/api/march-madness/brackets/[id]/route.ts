import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Handle both direct and Promise‑wrapped params for Next.js 16 compatibility
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.id;

  // ✅ Correct column name
  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  // ✅ Correct table name and numeric round
  const { data: openingRoundGames } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('round', 0);

  // ✅ All other games
  const { data: allGames } = await supabase
    .from('tournament_games')
    .select('*')
    .neq('round', 0);

  // ✅ Picks for this bracket
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('bracket_id', bracketId);

  // ✅ Teams table
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*');

  // ✅ Group regional games safely
  const regionalGames = (allGames ?? []).reduce<Record<string, TournamentGame[]>>(
    (acc, game) => {
      const region = game.region ?? 'Unknown';
      acc[region] = acc[region] || [];
      acc[region].push(game);
      return acc;
    },
    {}
  );

  return NextResponse.json({
    bracket,
    openingRoundGames: openingRoundGames as TournamentGame[],
    regionalGames,
    picks,
    teams: teams as TournamentTeam[],
  });
}
