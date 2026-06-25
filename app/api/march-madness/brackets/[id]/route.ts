import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';


export default async function BracketViewPage({ params }: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/march-madness/brackets/${params.id}`,
    { cache: 'no-store' }
  );

  const data = await res.json();

  console.log("BRACKET PAGE DATA:", JSON.stringify(data, null, 2));

  return (
    ...
  );
}


export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.id;

  // Fetch bracket
  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

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

  return NextResponse.json({
    bracket: bracket ?? null,
    openingRoundGames: openingRoundGames ?? [],
    regionalGames,
    picks: picks ?? [],
    teams: teams ?? [],
  });
}
