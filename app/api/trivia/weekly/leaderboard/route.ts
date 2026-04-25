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

  const { data: leaderboard } = await supabase
    .from("weekly_challenge_results")
    .select("*")
    .eq("week_start", weekStart)
    .order("score", { ascending: false })
    .limit(10);

  return NextResponse.json({
    weekStart,
    leaderboard,
  });
}
