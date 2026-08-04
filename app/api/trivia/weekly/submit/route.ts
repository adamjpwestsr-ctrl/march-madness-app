import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const {
    displayName,
    weekStart,
    score,
    correctCount,
    wrongCount,
    passedCount,
  } = body;

  await supabase.from("weekly_challenge_results").insert({
    display_name: displayName,
    week_start: weekStart,
    score,
    correct_count: correctCount,
    wrong_count: wrongCount,
    passed_count: passedCount,
  });

  const { data: streakRow } = await supabase
    .from("weekly_streaks")
    .select("*")
    .eq("display_name", displayName)
    .single();

  if (!streakRow) {
    await supabase.from("weekly_streaks").insert({
      display_name: displayName,
      streak: 1,
      last_week: weekStart,
    });
  } else {
    if (streakRow.last_week !== weekStart) {
      await supabase
        .from("weekly_streaks")
        .update({
          streak: streakRow.streak + 1,
          last_week: weekStart,
        })
        .eq("display_name", displayName);
    }
  }

  return NextResponse.json({ success: true });
}
