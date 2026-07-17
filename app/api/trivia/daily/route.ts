import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Load daily rows (select * so we can detect schema)
    const { data: dailyRows, error: dailyError } = await supabase
      .from("trivia_daily_questions_dummy")   // <-- your test table
      .select("*");

    if (dailyError) {
      console.error("Daily list error:", dailyError);
      return NextResponse.json({ error: "Daily list error" });
    }

    if (!dailyRows || dailyRows.length === 0) {
      return NextResponse.json({ error: "No daily questions available" });
    }

    // 2. Pick a random row
    const randomRow = dailyRows[Math.floor(Math.random() * dailyRows.length)];

    // 3. Detect table type
    const hasFullFields =
      typeof randomRow.question === "string" &&
      typeof randomRow.correct_answer === "string";

    const hasReferenceId =
      typeof randomRow.question_id === "number" ||
      typeof randomRow.question === "number";

    // 4A. FULL QUESTION TABLE → return row directly
    if (hasFullFields && !hasReferenceId) {
      return NextResponse.json({
        question: {
          id: randomRow.id,
          sport: randomRow.sport ?? "General",
          question: randomRow.question,
          difficulty: randomRow.difficulty ?? "Easy",
          points: randomRow.points ?? 1,
          category_tag: randomRow.category_tag ?? null,
          correct_answer: randomRow.correct_answer,
          choices: randomRow.choices ?? [
            randomRow.choice_a,
            randomRow.choice_b,
            randomRow.choice_c,
            randomRow.choice_d,
          ].filter(Boolean),
          choice_a: randomRow.choice_a,
          choice_b: randomRow.choice_b,
          choice_c: randomRow.choice_c,
          choice_d: randomRow.choice_d,
        },
      });
    }

    // 4B. REFERENCE TABLE → fetch from trivia_questions
    const questionId =
      randomRow.question_id ??
      (typeof randomRow.question === "number" ? randomRow.question : null);

    if (!questionId) {
      return NextResponse.json({
        error: "Invalid daily question reference",
      });
    }

    const { data: question, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .eq("id", questionId)
      .maybeSingle();

    if (questionError) {
      console.error("Daily question fetch error:", questionError);
      return NextResponse.json({ error: "Failed to fetch daily question" });
    }

    if (!question) {
      return NextResponse.json({ error: "Daily question not found" });
    }

    return NextResponse.json({ question });

  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json({ error: "Route crashed" });
  }
}
