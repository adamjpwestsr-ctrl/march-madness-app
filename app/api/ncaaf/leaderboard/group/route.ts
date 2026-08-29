import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const groupId = parseInt(searchParams.get("groupId") || "0");

  const { data: rows } = await supabase
    .from("ncaaf_scores")
    .select("user_id, season_year, week, correct_picks")
    .eq("group_id", groupId);

  const { data: users } = await supabase
    .from("ncaaf_users")
    .select("id, email");

  const byUser: Record<number, number> = {};

  (rows ?? []).forEach((r) => {
    byUser[r.user_id] = (byUser[r.user_id] ?? 0) + r.correct_picks;
  });

  const leaderboard = Object.entries(byUser)
    .map(([userId, score]) => ({
      userId: parseInt(userId),
      email: users?.find((u) => u.id === parseInt(userId))?.email ?? null,
      score,
    }))
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ leaderboard });
}
