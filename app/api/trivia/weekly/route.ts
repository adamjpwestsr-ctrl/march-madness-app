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
    // 1. Try loading existing weekly challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();

    if (challengeError) {
      console.error("Weekly challenge fetch error:", challengeError);
    }

    // 2. If challenge exists → fetch questions
    if (challenge?.question_ids?.length > 0) {
      const { data: questions, error: qErr } = await supabase
        .from("trivia_questions")
        .select("*")
        .in("id", challenge.question_ids);

      if (qErr) {
        console.error("Weekly question fetch error:", qErr);
      }

      return NextResponse.json({
        weekStart,
        questions: questions ?? [],
      });
    }

    // 3. No challenge exists → generate one
    const { data: allQuestions, error: allErr } = await supabase
      .from("trivia_questions")
      .select("id");

    if (allErr) {
      console.error("Fetch all trivia questions error:", allErr);
      return NextResponse.json({
        weekStart,
        questions: [],
      });
    }

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json({
        weekStart,
        questions: [],
      });
    }

    // Pick 10 random IDs
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10).map((q) => q.id);

    // 4. Try inserting weekly challenge
    const { data: newChallenge, error: insertError } = await supabase
      .from("weekly_challenges")
      .insert({
        week_start: weekStart,
        question_ids: selected,
      })
      .select()
      .maybeSingle();

    // If RLS blocks insert → fallback
    const finalIds = newChallenge?.question_ids ?? selected;

    const { data: questions, error: qErr2 } = await supabase
      .from("trivia_questions")
      .select("*")
      .in("id", finalIds);

    if (qErr2) {
      console.error("Weekly fallback question fetch error:", qErr2);
    }

    return NextResponse.json({
      weekStart,
      questions: questions ?? [],
    });

  } catch (err) {
    console.error("Weekly route crashed:", err);
    return NextResponse.json({
      weekStart,
      questions: [],
    });
  }
}
