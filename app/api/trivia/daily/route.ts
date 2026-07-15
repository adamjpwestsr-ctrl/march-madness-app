import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Load daily question IDs
    const { data: dailyRows, error: dailyError } = await supabase
      .from("trivia_daily_questions")
      .select("question_id");

    if (dailyError) {
      console.error("Daily list error:", dailyError);
      return NextResponse.json(null);
    }

    if (!dailyRows || dailyRows.length === 0) {
      return NextResponse.json(null);
    }

    // 2. Pick a random ID
    const randomRow =
      dailyRows[Math.floor(Math.random() * dailyRows.length)];

    const randomId = randomRow?.question_id;

    if (!randomId) {
      return NextResponse.json(null);
    }

    // 3. Fetch the question
    const { data: question, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .eq("id", randomId)
      .maybeSingle();

    if (questionError) {
      console.error("Daily question fetch error:", questionError);
      return NextResponse.json(null);
    }

    if (!question) {
      return NextResponse.json(null);
    }

    // 4. Return valid question object
    return NextResponse.json(question);

  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json(null);
  }
}
