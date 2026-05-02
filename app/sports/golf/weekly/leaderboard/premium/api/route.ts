import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get premium tournaments
  const { data: premium } = await supabase
    .from("golf_tournaments")
    .select("id")
    .eq("is_premium_event", true);

  const premiumIds = (premium || []).map((t) => t.id);

  if (premiumIds.length === 0)
    return NextResponse.json({ leaderboard: [] });

  // Get picks only from premium events
  const { data: picks } = await supabase
    .from("golf_weekly_picks")
    .select("user_id, points_awarded, tournament_id")
    .in("tournament_id", premiumIds);

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
