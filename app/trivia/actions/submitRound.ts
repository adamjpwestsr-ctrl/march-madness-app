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

  // No auth required — trivia is public
  const userId = null;

  // Insert the round result
  const { error: insertError } = await supabase.from("trivia_rounds").insert({
    user_id: userId,
    display_name: displayName,
    score,
    correct_count: correctCount,
    wrong_count: wrongCount,
    passed_count: passedCount,
    duration_sec: durationSec,
  });

if (insertError) {
  console.error("Insert error:", insertError);
  throw insertError; // ⭐ TEMPORARY
}


  // Fetch updated leaderboard
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from("trivia_rounds")
    .select("id, display_name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(10);

if (leaderboardError) {
  console.error("Leaderboard fetch error:", leaderboardError);
  throw leaderboardError; // ⭐ TEMPORARY
}

  return leaderboard || [];
}
