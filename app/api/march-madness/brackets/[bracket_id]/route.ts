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
  // Handle Next.js 16 async params
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.bracket_id;

  // -----------------------------
  // FETCH BRACKET
  // -----------------------------
  const { data: bracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  if (!bracket) {
    return NextResponse.json(
      { error: 'Bracket not found' },
      { status: 404 }
    );
  }

  // -----------------------------
  // FETCH ALL GAMES
  // -----------------------------
  const { data: allGames } = await supabase
    .from('tournament_games')
    .select('*')
    .order('round', { ascending: true })
    .order('game_number', { ascending: true });

  // Opening Round = round 1 (76‑team format)
  const openingRoundGames = (allGames ?? []).filter(
    (g) => g.round === 1
  );

  // Regional games = rounds 2+
  const regionalGames = (allGames ?? [])
    .filter((g) => g.round && g.round >= 2)
    .reduce<Record<string, TournamentGame[]>>((acc, game) => {
      const region = game.region ?? 'Unknown';
      if (!acc[region]) acc[region] = [];
      acc[region].push(game);
      return acc;
    }, {});

  // -----------------------------
  // FETCH PICKS
  // -----------------------------
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('bracket_id', bracketId);

  // -----------------------------
  // FETCH TEAMS
  // -----------------------------
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*');

  // -----------------------------
  // LIVE SUMMARY (placeholder)
  // ESPN integration will populate this
  // -----------------------------
  const liveSummary = []; // TODO: ESPN API integration

  // -----------------------------
  // RETURN FULL PAYLOAD
  // -----------------------------
  return NextResponse.json({
    bracket,
    openingRoundGames,
    regionalGames,
    picks: picks ?? [],
    teams: teams ?? [],
    liveSummary,
  });
}
