import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Load daily question IDs (column is "question", not "question_id")
    const { data: dailyRows, error: dailyError } = await supabase
      .from("trivia_daily_questions")
      .select("question");

    if (dailyError) {
      console.error("Daily list error:", dailyError);
      return NextResponse.json({ error: "Daily list error" });
    }

    if (!dailyRows || dailyRows.length === 0) {
      return NextResponse.json({ error: "No daily questions available" });
    }

    // 2. Pick a random daily question ID
    const randomRow = dailyRows[Math.floor(Math.random() * dailyRows.length)];
    const randomId = randomRow?.question;

    if (!randomId) {
      return NextResponse.json({ error: "Invalid daily question reference" });
    }

    // 3. Fetch the actual trivia question
    const { data: question, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .eq("id", randomId)
      .maybeSingle();

    if (questionError) {
      console.error("Daily question fetch error:", questionError);
      return NextResponse.json({ error: "Failed to fetch daily question" });
    }

    if (!question) {
      return NextResponse.json({ error: "Daily question not found" });
    }

    // 4. Return the valid question object
    return NextResponse.json({ question });

  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json({ error: "Route crashed" });
  }
}
