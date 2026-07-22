import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
);

    const body = await req.json();
    const { mode, score, streak } = body;

    if (!mode || typeof score !== "number") {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Insert round record
    const { error: insertError } = await supabase
      .from("trivia_rounds")
      .insert({
        user_id: userId,
        mode,
        score,
        streak: mode === "weekly" ? streak : null,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save round." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Round saved successfully.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Trivia rounds API error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}


