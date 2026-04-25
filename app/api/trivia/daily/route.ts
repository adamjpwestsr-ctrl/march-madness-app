import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const today = new Date().toISOString().slice(0, 10);

  let { data: challenge } = await supabase
    .from("daily_challenge")
    .select("*")
    .eq("challenge_date", today)
    .single();

  if (!challenge) {
    const { data: randomQ } = await supabase
      .from("trivia_questions")
      .select("id")
      .order("random()")
      .limit(1)
      .single();

    const { data: newChallenge } = await supabase
      .from("daily_challenge")
      .insert({
        question_id: randomQ.id,
        challenge_date: today,
      })
      .select()
      .single();

    challenge = newChallenge;
  }

  const { data: question } = await supabase
    .from("trivia_questions")
    .select("*")
    .eq("id", challenge.question_id)
    .single();

  return NextResponse.json(question);
}
