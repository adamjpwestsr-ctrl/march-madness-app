import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const weekStart = getWeekStart();

  try {
    const { data: leaderboard, error } = await supabase
      .from("weekly_challenge_results")
      .select("*")
      .eq("week_start", weekStart)
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Weekly leaderboard fetch error:", error);
      return NextResponse.json(
        { weekStart, leaderboard: [], error: "Failed to load leaderboard" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      weekStart,
      leaderboard: leaderboard ?? [],
    });
  } catch (err) {
    console.error("Weekly leaderboard route crashed:", err);
    return NextResponse.json(
      { weekStart, leaderboard: [], error: "Server error" },
      { status: 500 }
    );
  }
}
