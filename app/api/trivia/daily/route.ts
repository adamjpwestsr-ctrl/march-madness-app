import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
);

    // Determine today's date (UTC)
    const today = new Date().toISOString().split("T")[0];

    // Fetch daily questions
    const { data: questions, error } = await supabase
      .from("trivia_daily_questions")
      .select("id, question, choices, correctIndex, points")
      .eq("day", today)
      .order("id", { ascending: true });

    if (error) {
      console.error("Daily trivia fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load daily questions." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        day: today,
        questions: questions || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Daily trivia API error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

