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

  let { data: challenge } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("week_start", weekStart)
    .single();

  if (!challenge) {

    // ⭐ Add this type
    type TriviaIdRow = { id: number };

    const { data: randomQs } = await supabase.rpc("get_random_trivia_ids", {
      limit_count: 10
    }) as { data: TriviaIdRow[] | null };

    if (!randomQs || randomQs.length === 0) {
      return NextResponse.json(
        { error: "No trivia questions available for weekly challenge" },
        { status: 400 }
      );
    }

    const { data: newChallenge } = await supabase
      .from("weekly_challenges")
      .insert({
        week_start: weekStart,
        question_ids: randomQs.map((q) => q.id),
      })
      .select()
      .single();

    challenge = newChallenge;
  }

  const { data: questions } = await supabase
    .from("trivia_questions")
    .select("*")
    .in("id", challenge.question_ids);

  return NextResponse.json({
    weekStart,
    questions,
  });
}
