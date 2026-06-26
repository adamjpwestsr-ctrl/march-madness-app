// app/api/march-madness/brackets/[bracket_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

console.log("🔥 API HIT: /api/march-madness/brackets/[bracket_id]");


export async function GET(
  request: NextRequest,
  context:
    | { params: { bracket_id: string } }
    | { params: Promise<{ bracket_id: string }> }
) {
  // Handle both direct and Promise‑wrapped params for Next.js 16
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.bracket_id;

  // Fetch bracket
  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  // If no bracket found, return 404
  if (!bracket) {
    return NextResponse.json(
      { error: 'Bracket not found' },
      { status: 404 }
    );
  }

  // Opening round = round 0
  const { data: openingRoundGames } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('round', 0);

  // All other rounds
  const { data: allGames } = await supabase
    .from('tournament_games')
    .select('*')
    .neq('round', 0);

  // Picks
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('bracket_id', bracketId);

  // Teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*');

  // Group regional games
  const regionalGames = (allGames ?? []).reduce<
    Record<string, TournamentGame[]>
  >((acc, game) => {
    const region = game.region ?? 'Unknown';
    acc[region] = acc[region] || [];
    acc[region].push(game);
    return acc;
  }, {});

  // Return the exact shape the page expects
  return NextResponse.json({
    bracket,
    openingRoundGames: openingRoundGames ?? [],
    regionalGames,
    picks: picks ?? [],
    teams: teams ?? [],
  });
}
