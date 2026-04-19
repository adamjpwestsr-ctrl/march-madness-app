import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("golf_weekly_picks")
    .select("user_id, points_awarded")
    .gt("points_awarded", 0);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pointsByUser: Record<number, number> = {};

  for (const row of data || []) {
    pointsByUser[row.user_id] =
      (pointsByUser[row.user_id] || 0) + row.points_awarded;
  }

  const userIds = Object.keys(pointsByUser).map((id) => Number(id));

  const { data: users } = await supabase
    .from("users")
    .select("user_id, name, email")
    .in("user_id", userIds);

  const leaderboard = (users || [])
    .map((u) => ({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      points: pointsByUser[u.user_id] || 0,
    }))
    .sort((a, b) => b.points - a.points);

  return NextResponse.json({ leaderboard });
}
