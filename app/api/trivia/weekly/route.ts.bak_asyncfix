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

export async async function GET() {
  const supabase = await createSupabaseServerClient();
  const weekStart = getWeekStart();

  try {
    // ------------------------------------------------------------
    // 1. Fetch existing weekly set
    // ------------------------------------------------------------
    let { data: weeklySet, error: fetchError } = await supabase
      .from("trivia_weekly_sets")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();

    if (fetchError) {
      console.error("Weekly set fetch error:", fetchError.message);
    }

    // ------------------------------------------------------------
    // 2. Create weekly set if missing
    // ------------------------------------------------------------
    if (!weeklySet) {
      type TriviaIdRow = { question_id: number };

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

      const shuffled = randomQs.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);
      const ids = selected.map((q) => q.question_id);

      // ------------------------------------------------------------
      // 2a. Cast JS array → bigint[] using RPC
      // ------------------------------------------------------------
      const { data: castedIds, error: castError } = await supabase.rpc(
        "to_bigint_array",
        { items: ids }
      );

      if (castError) {
        console.error("Array cast error:", castError.message);
      }

      // ------------------------------------------------------------
      // 2b. Insert weekly set
      // ------------------------------------------------------------
      const { data: newSet, error: insertError } = await supabase
        .from("trivia_weekly_sets")
        .insert({
          week_start: weekStart,
          question_ids: castedIds,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("Insert weekly set error:", insertError.message);
      }

      weeklySet = newSet;
    }

    // ------------------------------------------------------------
    // 3. Fetch questions for the weekly set
    // ------------------------------------------------------------
    const ids = Array.isArray(weeklySet?.question_ids)
      ? weeklySet.question_ids
      : [];

    if (ids.length === 0) {
      console.warn("Weekly set has no question_ids.");
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
    console.error("Weekly set route crashed:", err);
    return NextResponse.json(
      { weekStart: null, questions: [], error: "Server error" },
      { status: 200 }
    );
  }
}
