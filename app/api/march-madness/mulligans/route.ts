// app/api/march-madness/mulligans/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { MulliganSummary } from '@/lib/marchMadnessTypes';

export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const bracketId = url.searchParams.get('bracket_id');

  if (!bracketId) {
    return NextResponse.json(
      { error: 'Missing bracket_id' },
      { status: 400 },
    );
  }

  const { data } = await supabase
    .from('bracket_mulligans')
    .select('*')
    .eq('bracket_id', bracketId);

  const mulligans: MulliganSummary[] = (data ?? []) as MulliganSummary[];

  return NextResponse.json(mulligans);
}

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const { bracket_id, game_id, original_team, replacement_team, email } = body;

  if (!bracket_id || !game_id || !original_team || !replacement_team) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  // Check mulligans remaining
  const { data: bracket } = await supabase
    .from('brackets')
    .select('mulligans_remaining')
    .eq('bracket_id', bracket_id)
    .single();

  if (!bracket || (bracket.mulligans_remaining ?? 0) <= 0) {
    return NextResponse.json(
      { error: 'No mulligans remaining' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('mulligan_requests')
    .insert({
      bracket_id,
      game_id,
      original_team,
      replacement_team,
      email,
      status: 'pending',
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
