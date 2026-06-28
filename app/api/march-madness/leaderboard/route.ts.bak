// app/api/march-madness/leaderboard?bracket_id=\/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { LeaderboardRow } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  // 1️⃣ Fetch scoring results (from scoring engine)
  const { data: scores, error: scoreError } = await supabase
    .from('leaderboard')
    .select('*');

  if (scoreError) {
    return NextResponse.json({ error: scoreError.message }, { status: 400 });
  }

  // 2️⃣ Fetch bracket metadata + user flags
  const { data: brackets, error: bracketError } = await supabase
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

  if (bracketError) {
    return NextResponse.json({ error: bracketError.message }, { status: 400 });
  }

  // Map bracket metadata
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

  // 3️⃣ Build leaderboard rows
  const leaderboard: LeaderboardRow[] = (scores ?? []).map((row) => {
    const meta = bracketMap.get(row.bracket_id);

    return {
      bracket_id: row.bracket_id,
      bracket_name: meta?.bracket_name ?? 'Unknown',
      icon: meta?.icon ?? null,

      earned_points: Number(row.earned_points ?? 0),
      possible_points: Number(row.possible_points ?? 0),
      max_possible_score: Number(row.max_possible_score ?? 0),
      mulligans_used: Number(row.mulligans_used ?? 0),

      email: meta?.email ?? null,
      has_paid: meta?.has_paid ?? false,
      is_active: meta?.is_active ?? false,
    };
  });

  // 4️⃣ Sort leaderboard
  leaderboard.sort((a, b) => {
    // Primary: earned points
    if (b.earned_points !== a.earned_points) {
      return b.earned_points - a.earned_points;
    }

    // Secondary: max possible score
    if (b.max_possible_score !== a.max_possible_score) {
      return b.max_possible_score - a.max_possible_score;
    }

    // Tertiary: mulligans used (fewer is better)
    return a.mulligans_used - b.mulligans_used;
  });

  return NextResponse.json(leaderboard);
}

