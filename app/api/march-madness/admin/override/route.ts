// app/api/march-madness/admin/override/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await createClient(); // IMPORTANT: await the async client
  const body = await req.json();

  const { game_id, winner_team } = body;

  if (!game_id || !winner_team) {
    return NextResponse.json(
      { error: 'Missing game_id or winner_team' },
      { status: 400 }
    );
  }

  // 1. Update winner
  const { error: updateError } = await supabase
    .from('tournament_games')
    .update({ winner: winner_team, completed: true })
    .eq('id', game_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // 2. Fetch game to find next slot
  const { data: game } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('id', game_id)
    .single();

  if (game?.winner_to_game_id) {
    const nextGameId = game.winner_to_game_id;

    // Determine if winner goes into team1 or team2
    const { data: nextGame } = await supabase
      .from('tournament_games')
      .select('*')
      .eq('id', nextGameId)
      .single();

    const updateField =
      nextGame.team1_id === null
        ? 'team1'
        : nextGame.team2_id === null
        ? 'team2'
        : null;

    if (updateField) {
      await supabase
        .from('tournament_games')
        .update({ [updateField]: winner_team })
        .eq('id', nextGameId);
    }
  }

  return NextResponse.json({ success: true });
}
