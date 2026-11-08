import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const games = body.sweet16 ?? [];

    const formatted = games.map((g: any) => ({
      game_number: g.game_number,
      round: 16,
      region: g.region,
      team1_id: g.team1_source?.value ?? null,
      team2_id: g.team2_source?.value ?? null,
      status: 'pre',
      completed: false,
    }));

    const { error } = await supabase
      .from('tournament_games')
      .upsert(formatted, { onConflict: 'game_number' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save Sweet 16 error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
