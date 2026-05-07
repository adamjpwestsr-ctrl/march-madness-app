import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Check if today's challenge already exists
  let { data: challenge } = await supabase
    .from("daily_challenge")
    .select("*")
    .eq("challenge_date", today)
    .single();

  // 2. If not, create one using the RPC
  if (!challenge) {
    const { data: randomQ } = await supabase
      .rpc("get_random_trivia_id")
      .single<{ id: number }>();   // <-- FIXED HERE

    if (!randomQ) {
      return NextResponse.json(
        { error: "No trivia questions available for daily challenge" },
        { status: 400 }
      );
    }

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

  // 3. Fetch the actual question
  const { data: question } = await supabase
    .from("trivia_questions")
    .select("*")
    .eq("id", challenge.question_id)
    .single();

  return NextResponse.json(question);
}
