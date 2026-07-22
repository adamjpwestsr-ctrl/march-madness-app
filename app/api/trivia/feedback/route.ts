import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { cookies } from "next/headers";

/* -------------------- GET: Fetch all feedback -------------------- */
export async function GET() {
  try {
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
);

    const { data, error } = await supabase
      .from("trivia_feedback")
      .select(
        "id, email, type, body, enhancement_requested, enhancement_text, shout_out, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch feedback error:", error);
      return NextResponse.json(
        { error: "Failed to load feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { feedback: data || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /feedback error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

/* -------------------- POST: Submit new feedback -------------------- */
export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
);

    const body = await req.json();
    const {
      email,
      type,
      body: feedbackBody,
      enhancement_requested,
      enhancement_text,
      shout_out,
    } = body;

    if (!email || !type || !feedbackBody) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("trivia_feedback").insert({
      email,
      type,
      body: feedbackBody,
      enhancement_requested: !!enhancement_requested,
      enhancement_text: enhancement_requested ? enhancement_text || null : null,
      shout_out: !!shout_out,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Insert feedback error:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /feedback error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

