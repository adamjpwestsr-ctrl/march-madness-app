import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const game = body.championship;

    if (!game) {
      return NextResponse.json({ error: 'Missing championship payload' }, { status: 400 });
    }

    const formatted = {
      game_number: game.game_number,
      round: 2,
      region: null,
      team1_id: game.team1_source?.value ?? null,
      team2_id: game.team2_source?.value ?? null,
      status: 'pre',
      completed: false,
    };

    const { error } = await supabase
      .from('tournament_games')
      .upsert([formatted], { onConflict: 'game_number' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save Championship error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
