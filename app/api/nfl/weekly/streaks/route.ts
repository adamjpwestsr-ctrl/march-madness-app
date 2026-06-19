import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: rows } = await supabase
    .from("nfl_streaks_view")
    .select("*")
    .eq("user_id", user.id)
    .order("week_number", { ascending: true });

  let currentStreak = 0;
  let longestStreak = 0;

  for (const r of rows ?? []) {
    if (r.correct_picks > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return NextResponse.json({
    currentStreak,
    longestStreak,
    totalCorrect: rows?.filter((r) => r.correct_picks > 0).length ?? 0,
    perfectWeeks: rows?.filter((r) => r.perfect_week).length ?? 0,
  });
}


