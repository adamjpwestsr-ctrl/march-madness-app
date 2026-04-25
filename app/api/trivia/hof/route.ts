import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: highestScore } = await supabase
    .from("trivia_rounds")
    .select("*")
    .order("score", { ascending: false })
    .limit(1)
    .single();

  const { data: mostCorrect } = await supabase
    .from("trivia_rounds")
    .select("*")
    .order("correct_count", { ascending: false })
    .limit(1)
    .single();

  const { data: longestStreak } = await supabase
    .from("trivia_rounds")
    .select("*, (correct_count - wrong_count) as streak")
    .order("streak", { ascending: false })
    .limit(1)
    .single();

  const { data: mostRuns } = await supabase
    .from("trivia_rounds")
    .select("display_name, count(*)")
    .group("display_name")
    .order("count", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    highestScore,
    mostCorrect,
    longestStreak,
    mostRuns,
  });
}
