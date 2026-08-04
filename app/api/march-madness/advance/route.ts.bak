// app/api/march-madness/advance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame } from '@/lib/marchMadnessTypes';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // 1. Fetch all completed games that have a winner_to_game_id
    const { data: completedGames, error: completedError } = await supabase
      .from('tournament_games')
      .select('*')
      .eq('completed', true)
      .not('winner_to_game_id', 'is', null);

    if (completedError) {
      return NextResponse.json(
        { error: completedError.message },
        { status: 400 }
      );
    }

    const games = (completedGames ?? []) as TournamentGame[];

    if (games.length === 0) {
      return NextResponse.json({ message: 'No completed games to advance' });
    }

    // 2. Build a map of next games to update (UUID keys)
    const nextGameUpdates: Record<
      string,
      { team1_id?: string | null; team2_id?: string | null }
    > = {};

    for (const game of games) {
      if (!game.winner_to_game_id || !game.winner) continue;

      const nextId = game.winner_to_game_id; // UUID

      if (!nextGameUpdates[nextId]) {
        nextGameUpdates[nextId] = {};
      }

      // Fetch the next game to determine placement
      const { data: nextGame } = await supabase
        .from('tournament_games')
        .select('id, team1_id, team2_id')
        .eq('id', nextId)
        .maybeSingle();

      if (!nextGame) continue;

      // Winner fills team1_id if empty, otherwise team2_id
      if (!nextGame.team1_id) {
        nextGameUpdates[nextId].team1_id = game.winner;
      } else if (!nextGame.team2_id) {
        nextGameUpdates[nextId].team2_id = game.winner;
      }
    }

    // 3. Apply updates to next‑round games (UUID-safe)
    const updates = Object.entries(nextGameUpdates).map(([id, payload]) => ({
      id, // UUID — DO NOT convert to number
      ...payload,
    }));

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('tournament_games')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      advanced_games: updates.length,
    });
  } catch (err) {
    console.error('Error advancing winners:', err);
    return NextResponse.json(
      { error: 'Failed to advance winners' },
      { status: 500 }
    );
  }
}
