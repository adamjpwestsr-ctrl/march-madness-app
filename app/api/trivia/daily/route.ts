import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  console.log("DAILY ROUTE HIT");

  const supabase = await createSupabaseServerClient();

  try {
    // -----------------------------
    // 1. Get ALL daily question IDs
    // -----------------------------
    const { data: dailyRows, error: dailyError } = await supabase
      .from("trivia_daily_questions")
      .select("question_id");

    if (dailyError) {
      console.error("Daily list error:", dailyError);
      return NextResponse.json(
        { error: "Failed to load daily question list" },
        { status: 500 }
      );
    }

    if (!dailyRows || dailyRows.length === 0) {
      return NextResponse.json(
        { error: "No daily trivia questions available" },
        { status: 404 }
      );
    }

    // -----------------------------
    // 2. Pick a random ID
    // -----------------------------
    const randomRow =
      dailyRows[Math.floor(Math.random() * dailyRows.length)];

    const randomId = randomRow.question_id;

    // -----------------------------
    // 3. Fetch that question
    // -----------------------------
    const { data: question, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .eq("id", randomId)
      .maybeSingle();

    if (questionError) {
      console.error("Daily question fetch error:", questionError);
      return NextResponse.json(
        { error: "Failed to fetch daily trivia question" },
        { status: 500 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Daily trivia question not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // 4. Return the question
    // -----------------------------
    return NextResponse.json(question);

  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
