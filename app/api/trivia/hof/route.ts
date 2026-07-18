import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const safe = (row: any, defaults: any) => row ?? defaults;

  const defaultHighest = { display_name: "—", score: 0 };
  const defaultMostCorrect = { display_name: "—", correct_count: 0 };
  const defaultLongest = { display_name: "—", streak: 0 };
  const defaultMostRuns = { display_name: "—", count: 0 };

  try {
    // Highest Score
    const { data: highestScore } = await supabase
      .from("trivia_rounds")
      .select("display_name, score")
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Most Correct Answers
    const { data: mostCorrect } = await supabase
      .from("trivia_rounds")
      .select("display_name, correct_count")
      .order("correct_count", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Longest Streak (correct_count - wrong_count)
    const { data: longestStreak } = await supabase
      .from("trivia_rounds")
      .select("display_name, (correct_count - wrong_count) as streak")
      .order("streak", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Most Runs Played
    const { data: mostRuns } = await supabase
      .from("trivia_rounds")
      .select("display_name, count(*)")
      .group("display_name")
      .order("count", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      highestScore: safe(highestScore, defaultHighest),
      mostCorrect: safe(mostCorrect, defaultMostCorrect),
      longestStreak: safe(longestStreak, defaultLongest),
      mostRuns: safe(mostRuns, defaultMostRuns),
    });
  } catch (err) {
    console.error("HOF Stats API error:", err);

    return NextResponse.json({
      highestScore: defaultHighest,
      mostCorrect: defaultMostCorrect,
      longestStreak: defaultLongest,
      mostRuns: defaultMostRuns,
    });
  }
}
