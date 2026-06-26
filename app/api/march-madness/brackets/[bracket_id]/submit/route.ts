// app/api/march-madness/brackets/[bracket_id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  request: NextRequest,
  context:
    | { params: { bracket_id: string } }
    | { params: Promise<{ bracket_id: string }> }
) {
  // Handle both direct and Promise‑wrapped params for Next.js 16
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.bracket_id;

  try {
    const body = await request.json();
    const { tiebreaker_score } = body;

    // Mark bracket as submitted
    const { error } = await supabase
      .from('bracket_submissions')
      .insert({
        bracket_id: bracketId,
        tiebreaker_score,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error submitting bracket:', err);
    return NextResponse.json(
      { error: 'Failed to submit bracket' },
      { status: 500 }
    );
  }
}
