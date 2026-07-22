import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { cookies } from "next/headers";

/* -------------------- GET: Fetch list of sports -------------------- */
export async function GET() {
  try {
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
);

    const { data, error } = await supabase
      .from("trivia_sports")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Fetch sports error:", error);
      return NextResponse.json(
        { error: "Failed to load sports." },
        { status: 500 }
      );
    }

    const sports = data?.map((s) => s.name) || [];

    return NextResponse.json(
      { sports },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /sports error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

