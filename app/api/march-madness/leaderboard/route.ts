// app/api/march-madness/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { LeaderboardRow } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  // 1. Scores
  const { data: scores } = await supabase
    .from('bracket_potential_scores')
    .select('*');

  // 2. Brackets + user flags
  const { data: brackets } = await supabase
    .from('brackets')
    .select(`
      bracket_id,
      bracket_name,
      icon,
      email,
      user_id,
      users:auth_id (
        has_paid,
        is_active
      )
    `)
    .eq('sport', 'ncaab');

  const bracketMap = new Map(
    (brackets ?? []).map((b) => [
      b.bracket_id,
      {
        bracket_name: b.bracket_name,
        icon: b.icon,
        email: b.email,
        has_paid: b.users?.[0]?.has_paid ?? false,
	is_active: b.users?.[0]?.is_active ?? false,
      },
    ])
  );

  // 3. Build leaderboard rows
  const leaderboard: LeaderboardRow[] = (scores ?? []).map((row) => {
    const meta = bracketMap.get(row.bracket_id);

    return {
      bracket_id: row.bracket_id,
      bracket_name: meta?.bracket_name ?? 'Unknown',
      icon: meta?.icon ?? null,
      earned_points: Number(row.earned_points ?? 0),
      possible_points: Number(row.possible_points ?? 0),
      max_possible_score: Number(row.max_possible_score ?? 0),
      mulligans_used: 0,

      email: meta?.email ?? null,
      has_paid: meta?.has_paid ?? false,
      is_active: meta?.is_active ?? false,
    };
  });

  // 4. Sort leaderboard
  leaderboard.sort((a, b) => {
    if (b.earned_points !== a.earned_points) {
      return b.earned_points - a.earned_points;
    }
    return b.max_possible_score - a.max_possible_score;
  });

  return NextResponse.json(leaderboard);
}
