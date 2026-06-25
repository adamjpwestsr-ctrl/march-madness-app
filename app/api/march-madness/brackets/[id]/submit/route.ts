// app/api/march-madness/brackets/[id]/submit/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const supabase = createClient();
  const bracketId = params.id;
  const body = await req.json();

  const { tiebreaker_score } = body;

  const { data: existing } = await supabase
    .from('bracket_submissions')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Bracket already submitted' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('bracket_submissions')
    .insert({
      bracket_id: bracketId,
      tiebreaker: tiebreaker_score,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
