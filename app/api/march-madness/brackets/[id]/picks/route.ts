import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Handle both direct and Promise‑wrapped params for Next.js 16 compatibility
  const params =
    'then' in context.params
      ? await context.params
      : context.params;

  const supabase = createClient();
  const bracketId = params.id;

  const body = await request.json();
  const picks = body.picks as { game_id: number; selected_team: string }[];

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

  const upserts = picks.map((p) => ({
    bracket_id: bracketId,
    game_id: p.game_id,
    selected_team: p.selected_team,
  }));

  const { error } = await supabase
    .from('picks')
    .upsert(upserts, { onConflict: 'bracket_id,game_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
