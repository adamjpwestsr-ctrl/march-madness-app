// app/api/march-madness/brackets/[id]/picks/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const supabase = createClient();
  const bracketId = params.id;
  const body = await req.json();

  const picks = body.picks as { game_id: number; selected_team: string }[];

  const { data: submission } = await supabase
    .from('bracket_submissions')
    .select('*')
    .eq('bracket_id', bracketId)
    .maybeSingle();

  if (submission) {
    return NextResponse.json(
      { error: 'Bracket already submitted' },
      { status: 400 },
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
