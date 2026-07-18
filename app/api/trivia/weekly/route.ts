import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Determine the current week's start date (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const weekStart = monday.toISOString().split("T")[0];

    // 2. Load weekly set (array of question IDs)
    const { data: weeklySet, error: setError } = await supabase
      .from("trivia_weekly_sets")
      .select("question_ids, theme")
      .eq("week_start", weekStart)
      .maybeSingle();

    if (setError) {
      console.error("Weekly set error:", setError);
      return NextResponse.json({ error: "Weekly set error" });
    }

    if (!weeklySet || !weeklySet.question_ids || weeklySet.question_ids.length === 0) {
      return NextResponse.json({ error: "No weekly questions available" });
    }

    // 3. Fetch all questions in the weekly set
    const { data: questions, error: questionsError } = await supabase
      .from("trivia_questions")
      .select("*")
      .in("id", weeklySet.question_ids);

    if (questionsError) {
      console.error("Weekly questions fetch error:", questionsError);
      return NextResponse.json({ error: "Failed to fetch weekly questions" });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "Weekly questions not found" });
    }

    // 4. Return the full weekly challenge object
    return NextResponse.json({
      weekStart,
      theme: weeklySet.theme ?? null,
      questions,
    });

  } catch (err) {
    console.error("Trivia weekly route crashed:", err);
    return NextResponse.json({ error: "Route crashed" });
  }
}
