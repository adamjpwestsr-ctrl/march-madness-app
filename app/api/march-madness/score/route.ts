// app/api/march-madness/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { TournamentGame } from '@/lib/marchMadnessTypes';

/**
 * Scoring engine:
 * - Calculates points for each bracket based on correct picks.
 * - Updates leaderboard totals.
 * - Supports upset bonuses and tiebreaker proximity.
 * - Designed for 76‑team March Madness format.
 */
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

    // 2️⃣ Fetch all brackets and their picks
    const { data: brackets } = await supabase.from('brackets').select('bracket_id');
    const { data: picks } = await supabase.from('picks').select('*');

    if (!brackets || !picks) {
      return NextResponse.json({ error: 'Missing bracket or pick data' }, { status: 400 });
    }

    // 3️⃣ Scoring rules
    const roundPoints: Record<number, number> = {
      1: 1, // Opening Round
      2: 2, // Round of 64
      3: 4, // Round of 32
      4: 8, // Sweet 16
      5: 16, // Elite 8
      6: 32, // Final Four
      7: 64, // Championship
    };

    // 4️⃣ Compute scores per bracket
    const leaderboardUpdates: {
      bracket_id: string;
      earned_points: number;
      possible_points: number;
      max_possible_score: number;
    }[] = [];

    for (const bracket of brackets) {
      const bracketPicks = picks.filter((p) => p.bracket_id === bracket.bracket_id);
      let earned = 0;
      let possible = 0;

      for (const game of games) {
        const pick = bracketPicks.find((p) => p.game_id === game.id);
        if (!pick) continue;

        const points = roundPoints[game.round ?? 0] ?? 0;
        possible += points;

        if (pick.selected_team === game.winner) {
          earned += points;

          // Optional upset bonus: +1 if winner seed ≥ 9
          const winningSeed =
            game.team1 === game.winner ? game.seed1 : game.seed2;
          if (winningSeed && winningSeed >= 9) earned += 1;
        }
      }

      leaderboardUpdates.push({
        bracket_id: bracket.bracket_id,
        earned_points: earned,
        possible_points: possible,
        max_possible_score: possible, // placeholder until future logic
      });
    }

    // 5️⃣ Update leaderboard table
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
    return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
  }
}
