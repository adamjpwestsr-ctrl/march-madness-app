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
  console.log("WEEKLY ROUTE HIT");

  const supabase = await createSupabaseServerClient();
  const weekStart = getWeekStart();

  try {
    // -----------------------------
    // 1. Try to load existing weekly challenge
    // -----------------------------
    const { data: challenge } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();

    // -----------------------------
    // 2. If exists → fetch questions and return
    // -----------------------------
    if (challenge) {
      const { data: questions } = await supabase
        .from("trivia_questions")
        .select("*")
        .in("id", challenge.question_ids);

      return NextResponse.json({
        weekStart,
        questions: questions ?? [],
      });
    }

    // -----------------------------
    // 3. No challenge exists → generate one safely
    // -----------------------------
    const { data: allQuestions } = await supabase
      .from("trivia_questions")
      .select("id");

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json({
        weekStart,
        questions: [],
        error: "No trivia questions available",
      });
    }

    // Pick 10 random IDs
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10).map((q) => q.id);

    // -----------------------------
    // 4. Try inserting weekly challenge
    //    If RLS blocks it → fallback safely
    // -----------------------------
    const { data: newChallenge, error: insertError } = await supabase
      .from("weekly_challenges")
      .insert({
        week_start: weekStart,
        question_ids: selected,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Weekly insert blocked by RLS:", insertError);

      // Fallback: return questions without storing challenge
      const { data: questions } = await supabase
        .from("trivia_questions")
        .select("*")
        .in("id", selected);

      return NextResponse.json({
        weekStart,
        questions: questions ?? [],
        error: "Weekly challenge not saved due to RLS",
      });
    }

    // -----------------------------
    // 5. Return newly created challenge
    // -----------------------------
    const { data: questions } = await supabase
      .from("trivia_questions")
      .select("*")
      .in("id", newChallenge.question_ids);

    return NextResponse.json({
      weekStart,
      questions: questions ?? [],
    });

  } catch (err) {
    console.error("Weekly route crashed:", err);
    return NextResponse.json(
      { weekStart: null, questions: [], error: "Server error" },
      { status: 500 }
    );
  }
}
