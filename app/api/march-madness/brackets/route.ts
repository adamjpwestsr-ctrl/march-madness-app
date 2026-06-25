// app/api/march-madness/brackets/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { BracketSummary } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient(); // IMPORTANT FIX

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
  const supabase = await createClient(); // IMPORTANT FIX
  const body = await req.json();

  const { bracket_name, icon, tiebreaker_score } = body;

  const { data, error } = await supabase
    .from('brackets')
    .insert({
      bracket_name,
      icon,
      tiebreaker_score,
      sport: 'ncaab',
      mulligans_remaining: 2,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
