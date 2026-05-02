import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const tournament_id = Number(searchParams.get("tournament_id"));

  const { data: picks } = await supabase
    .from("golf_weekly_picks")
    .select("user_id, points_awarded")
    .eq("tournament_id", tournament_id);

  const totals: Record<number, number> = {};
  for (const p of picks || []) {
    totals[p.user_id] = (totals[p.user_id] || 0) + p.points_awarded;
  }

  const userIds = Object.keys(totals).map(Number);

  const { data: users } = await supabase
    .from("users")
    .select("user_id, name, email")
    .in("user_id", userIds);

  const leaderboard = (users || [])
    .map((u) => ({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      points: totals[u.user_id] || 0,
    }))
    .sort((a, b) => b.points - a.points);

  return NextResponse.json({ leaderboard });
}
