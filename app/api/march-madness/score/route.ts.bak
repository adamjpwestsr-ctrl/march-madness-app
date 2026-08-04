// app/api/march-madness/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame } from '@/lib/marchMadnessTypes';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // 1️⃣ Fetch all completed games with winners
    const { data: completedGames, error: gamesError } = await supabase
      .from('tournament_games')
      .select('id, round, winner, seed1, seed2, team1, team2')
      .eq('completed', true);

    if (gamesError) {
      return NextResponse.json({ error: gamesError.message }, { status: 400 });
    }

    const games = (completedGames ?? []) as TournamentGame[];

    // 2️⃣ Fetch all brackets and their picks (UUID-safe)
    const { data: brackets, error: bracketsError } = await supabase
      .from('brackets')
      .select('bracket_id');

    if (bracketsError) {
      return NextResponse.json({ error: bracketsError.message }, { status: 400 });
    }

    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('*');

    if (picksError) {
      return NextResponse.json({ error: picksError.message }, { status: 400 });
    }

    if (!brackets || !picks) {
      return NextResponse.json(
        { error: 'Missing bracket or pick data' },
        { status: 400 }
      );
    }

    // 3️⃣ Scoring rules
    const roundPoints: Record<number, number> = {
      1: 1,
      2: 2,
      3: 4,
      4: 8,
      5: 16,
      6: 32,
      7: 64,
    };

    // 4️⃣ Compute scores per bracket
    const leaderboardUpdates: {
      bracket_id: string;
      earned_points: number;
      possible_points: number;
      max_possible_score: number;
    }[] = [];

    for (const bracket of brackets) {
      const bracketPicks = picks.filter(
        (p) => p.bracket_id === bracket.bracket_id
      );

      let earned = 0;
      let possible = 0;

      for (const game of games) {
        // game.id is UUID, picks.game_id must also be UUID
        const pick = bracketPicks.find((p) => p.game_id === game.id);
        if (!pick) continue;

        const points = roundPoints[game.round ?? 0] ?? 0;
        possible += points;

        if (pick.selected_team === game.winner) {
          earned += points;

          const winningSeed =
            game.team1 === game.winner ? game.seed1 : game.seed2;

          if (winningSeed && winningSeed >= 9) {
            earned += 1;
          }
        }
      }

      leaderboardUpdates.push({
        bracket_id: bracket.bracket_id,
        earned_points: earned,
        possible_points: possible,
        max_possible_score: possible,
      });
    }

    // 5️⃣ Update leaderboard
    const { error: updateError } = await supabase
      .from('leaderboard')
      .upsert(leaderboardUpdates, { onConflict: 'bracket_id' });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      updated: leaderboardUpdates.length,
    });
  } catch (err) {
    console.error('Error calculating scores:', err);
    return NextResponse.json(
      { error: 'Failed to calculate scores' },
      { status: 500 }
    );
  }
}
