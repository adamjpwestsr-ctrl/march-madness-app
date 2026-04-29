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
    // ------------------------------------------------------------
    // 1. Fetch existing weekly challenge
    // ------------------------------------------------------------
    let { data: challenge, error: challengeError } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("week_start", weekStart)
      .single();

    if (challengeError) {
      console.error("Weekly challenge fetch error:", challengeError.message);
    }

    // ------------------------------------------------------------
    // 2. If no challenge exists, create one
    // ------------------------------------------------------------
    if (!challenge) {
      type TriviaIdRow = { id: number };

      const { data: randomQs, error: randomError } = await supabase.rpc(
        "get_random_trivia_ids",
        { limit_count: 10 }
      ) as { data: TriviaIdRow[] | null; error?: any };

      if (randomError) {
        console.error("RPC get_random_trivia_ids error:", randomError.message);
      }

      if (!randomQs || randomQs.length === 0) {
        console.warn("No trivia questions returned from RPC.");
        return NextResponse.json(
          { weekStart, questions: [], error: "No trivia available" },
          { status: 200 }
        );
      }

      const { data: newChallenge, error: insertError } = await supabase
        .from("weekly_challenges")
        .insert({
          week_start: weekStart,
          question_ids: randomQs.map((q) => q.id),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert weekly challenge error:", insertError.message);
      }

      challenge = newChallenge;
    }

    // ------------------------------------------------------------
    // 3. Fetch questions for the challenge
    // ------------------------------------------------------------
    const ids = Array.isArray(challenge?.question_ids)
      ? challenge.question_ids
      : [];

    if (ids.length === 0) {
      console.warn("Weekly challenge has no question_ids.");
      return NextResponse.json(
        { weekStart, questions: [] },
        { status: 200 }
      );
    }

    const { data: questions, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .in("id", ids);

    if (questionError) {
      console.error("Trivia question fetch error:", questionError.message);
    }

    return NextResponse.json({
      weekStart,
      questions: questions || [],
    });

  } catch (err) {
    console.error("Weekly challenge route crashed:", err);
    return NextResponse.json(
      { weekStart: null, questions: [], error: "Server error" },
      { status: 200 }
    );
  }
}
