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
    .select("*, streak:correct_count - wrong_count")
    .order("streak", { ascending: false })
    .limit(1)
    .single();

  const { data: mostRuns } = await supabase
    .from("trivia_rounds")
    .select("display_name, count:count(*)")
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
