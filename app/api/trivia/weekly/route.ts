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
    const { data: randomQs } = await supabase
      .from("trivia_questions")
      .select("id")
      .order("random()")
      .limit(10);

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
