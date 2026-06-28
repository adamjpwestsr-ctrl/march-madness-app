// app/api/march-madness/brackets/[bracket_id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  request: NextRequest,
  context:
    | { params: { bracket_id: string } }
    | { params: Promise<{ bracket_id: string }> }
) {
  // Handle Next.js 16 async params
  const params =
    'then' in context.params ? await context.params : context.params;

  const supabase = await createClient();
  const bracketId = params.bracket_id;
if (!bracketId) { return NextResponse.json(@{ error = 'Missing bracket_id' }, @{ status = 400 }); }

  try {
    const body = await request.json();
    const { tiebreaker_score } = body;

    // -----------------------------
    // CHECK IF ALREADY SUBMITTED
    // -----------------------------
    const { data: existing } = await supabase
      .from('bracket_submissions')
      .select('*')
      .eq('bracket_id', bracketId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Bracket already submitted' },
        { status: 400 }
      );
    }

    // -----------------------------
    // VALIDATE PICKS EXIST
    // -----------------------------
    const { data: picks } = await supabase
      .from('picks')
      .select('*')
      .eq('bracket_id', bracketId);

    if (!picks || picks.length === 0) {
      return NextResponse.json(
        { error: 'Cannot submit an empty bracket' },
        { status: 400 }
      );
    }

    // -----------------------------
    // INSERT SUBMISSION RECORD
    // -----------------------------
    const { error: submitError } = await supabase
      .from('bracket_submissions')
      .insert({
        bracket_id: bracketId,
        tiebreaker_score,
        submitted_at: new Date().toISOString(),
      });

    if (submitError) {
      return NextResponse.json(
        { error: submitError.message },
        { status: 400 }
      );
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error submitting bracket:', err);
    return NextResponse.json(
      { error: 'Failed to submit bracket' },
      { status: 500 }
    );
  }
}
