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

  // -----------------------------
  // 1. Validate payload
  // -----------------------------
  if (!displayName || !weekStart) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // -----------------------------
  // 2. Insert weekly challenge result
  // -----------------------------
  const { error: insertError } = await supabase
    .from("weekly_challenge_results")
    .insert({
      display_name: displayName,
      week_start: weekStart,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      passed_count: passedCount,
    });

  if (insertError) {
    console.error("Insert weekly result error:", insertError);
    return NextResponse.json(
      { error: "Failed to save weekly challenge result" },
      { status: 500 }
    );
  }

  // -----------------------------
  // 3. Fetch streak row
  // -----------------------------
  const { data: streakRow, error: streakFetchError } = await supabase
    .from("weekly_streaks")
    .select("*")
    .eq("display_name", displayName)
    .maybeSingle();

  if (streakFetchError) {
    console.error("Streak fetch error:", streakFetchError);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }

  // -----------------------------
  // 4. Create streak if none exists
  // -----------------------------
  if (!streakRow) {
    const { error: createStreakError } = await supabase
      .from("weekly_streaks")
      .insert({
        display_name: displayName,
        streak: 1,
        last_week: weekStart,
      });

    if (createStreakError) {
      console.error("Create streak error:", createStreakError);
      return NextResponse.json(
        { error: "Failed to create streak" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  // -----------------------------
  // 5. Update streak if week changed
  // -----------------------------
  if (streakRow.last_week !== weekStart) {
    const { error: updateError } = await supabase
      .from("weekly_streaks")
      .update({
        streak: streakRow.streak + 1,
        last_week: weekStart,
      })
      .eq("display_name", displayName);

    if (updateError) {
      console.error("Update streak error:", updateError);
      return NextResponse.json(
        { error: "Failed to update streak" },
        { status: 500 }
      );
    }
  }

  // -----------------------------
  // 6. Done
  // -----------------------------
  return NextResponse.json({ success: true });
}
