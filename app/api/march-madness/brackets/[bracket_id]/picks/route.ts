// app/api/march-madness/brackets/[bracket_id]/picks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  request: NextRequest,
  context:
    | { params: { bracket_id: string } }
    | { params: Promise<{ bracket_id: string }> }
) {
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = createSupabaseServerClient();
  const bracketId = params.bracket_id;

  if (!bracketId) {
    return NextResponse.json({ error: 'Missing bracket_id' }, { status: 400 });
  }

  const body = await request.json();

  // UUID-safe picks
  const picks = body.picks as { game_id: string; selected_team: string }[];
  const tiebreaker = body.tiebreaker_score ?? null;

  // Check if already submitted
  const { data: submission } = await supabase
    .from('bracket_submissions')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  if (submission) {
    return NextResponse.json(
      { error: 'Bracket already submitted' },
      { status: 400 }
    );
  }

  if (!Array.isArray(picks) || picks.length === 0) {
    return NextResponse.json({ error: 'No picks submitted' }, { status: 400 });
  }

  // UUID-safe upserts
  const upserts = picks.map((p) => ({
    bracket_id: bracketId,
    game_id: p.game_id, // UUID
    selected_team: p.selected_team,
  }));

  const { error: pickError } = await supabase
    .from('picks')
    .upsert(upserts, { onConflict: 'bracket_id,game_id' });

  if (pickError) {
    return NextResponse.json({ error: pickError.message }, { status: 400 });
  }

  // Save tiebreaker
  const { error: tiebreakerError } = await supabase
    .from('bracket_submissions')
    .upsert(
      {
        bracket_id: bracketId,
        tiebreaker_score: tiebreaker,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'bracket_id' }
    );

  if (tiebreakerError) {
    return NextResponse.json(
      { error: tiebreakerError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
