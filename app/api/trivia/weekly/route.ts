import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const weekStart = getWeekStart();

  try {
    const { data: challenge } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();

    // If challenge exists → fetch questions
    if (challenge?.question_ids?.length) {
      const { data: questions } = await supabase
        .from("trivia_questions")
        .select("id, question, correct_answer, points")
        .in("id", challenge.question_ids);

      return NextResponse.json({
        weekStart,
        questions: questions ?? [],
      });
    }

    // No challenge exists → generate one
    const { data: allQuestions } = await supabase
      .from("trivia_questions")
      .select("id, question, correct_answer, points");

    if (!allQuestions?.length) {
      return NextResponse.json({ weekStart, questions: [] });
    }

    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10).map((q) => q.id);

    const { data: newChallenge } = await supabase
      .from("weekly_challenges")
      .insert({ week_start: weekStart, question_ids: selected })
      .select()
      .maybeSingle();

    const finalIds = newChallenge?.question_ids ?? selected;

    const { data: questions } = await supabase
      .from("trivia_questions")
      .select("id, question, correct_answer, points")
      .in("id", finalIds);

    return NextResponse.json({
      weekStart,
      questions: questions ?? [],
    });
  } catch (err) {
    console.error("Weekly route crashed:", err);
    return NextResponse.json({ weekStart, questions: [] });
  }
}
