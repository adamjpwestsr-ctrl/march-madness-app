import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { BracketSummary } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  const { data: bracketsData } = await supabase
    .from('brackets')
    .select('*')
    .eq('sport', 'ncaab');

  const { data: submissionsData } = await supabase
    .from('bracket_submissions')
    .select('bracket_id');

  const submittedSet = new Set(submissionsData?.map((s) => s.bracket_id) ?? []);

  const brackets: BracketSummary[] =
    bracketsData?.map((b) => ({
      bracket_id: b.bracket_id,
      bracket_name: b.bracket_name,
      icon: b.icon,
      created_at: b.created_at,
      tiebreaker_score: b.tiebreaker_score,
      mulligans_remaining: b.mulligans_remaining,
      submitted: submittedSet.has(b.bracket_id),
    })) ?? [];

  return NextResponse.json(brackets);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { bracket_name, icon, tiebreaker_score } = body;

  // 🔐 Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, fallback to anonymous UUID
  const user_id = user?.id ?? '00000000-0000-0000-0000-000000000000';

  // 🧮 Count brackets for this user (limit 4)
  const { count } = await supabase
    .from('brackets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);

  if ((count ?? 0) >= 4) {
    return NextResponse.json(
      { error: 'You have reached the maximum of 4 brackets.' },
      { status: 400 }
    );
  }

  // 🧩 Insert new bracket (ONLY valid columns)
  const { data, error } = await supabase
    .from('brackets')
    .insert({
      bracket_name,
      icon,
      tiebreaker_score,
      sport: 'ncaab',
      mulligans_remaining: 2,
      user_id, // ⭐ Add this column to your schema if you want per-user brackets
    })
    .select()
    .single();

  if (error) {
    console.error('BRACKET CREATE ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // ⭐ Optional: mark user active
  if (user?.id) {
    await supabase
      .from('users')
      .update({ is_active: true })
      .eq('auth_id', user.id);
  }

  return NextResponse.json(data);
}
