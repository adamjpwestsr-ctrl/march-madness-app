"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

interface SubmitRoundInput {
  displayName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  passedCount: number;
  durationSec: number;
}

export async function submitRound(input: SubmitRoundInput) {
  const supabase = await createSupabaseServerClient();

  const {
    displayName,
    score,
    correctCount,
    wrongCount,
    passedCount,
    durationSec,
  } = input;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.user_metadata?.user_id ?? null;

  const { error } = await supabase.from("trivia_rounds").insert({
    user_id: userId,
    display_name: displayName,
    score,
    correct_count: correctCount,
    wrong_count: wrongCount,
    passed_count: passedCount,
    duration_sec: durationSec,
  });

  if (error) {
    // Fail silently for now; you can add logging later
  }

  const { data: leaderboard } = await supabase
    .from("trivia_rounds")
    .select("id, display_name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(10);

  return leaderboard || [];
}
