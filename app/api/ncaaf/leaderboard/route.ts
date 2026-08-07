import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Get all points
  const { data: points } = await supabase
    .from("ncaaf_points")
    .select("user_id, season, week, points");

  if (!points) return NextResponse.json([]);

  // Get usernames
  const { data: users } = await supabase
    .from("users")
    .select("user_id, username");

  const nameMap: Record<string, string> = {};

  // ⭐ FIX — type "u"
  users?.forEach((u: any) => (nameMap[u.user_id] = u.username));

  // Aggregate totals
  const totals: Record<
    string,
    { username: string; total: number; weekly: Record<number, number> }
  > = {};

  // ⭐ FIX — type "p"
  points.forEach((p: any) => {
    if (!totals[p.user_id]) {
      totals[p.user_id] = {
        username: nameMap[p.user_id] ?? "Unknown",
        total: 0,
        weekly: {},
      };
    }

    totals[p.user_id].total += p.points;
    totals[p.user_id].weekly[p.week] = p.points;
  });

  const rows = Object.entries(totals)
    .map(([user_id, info]) => ({
      user_id,
      username: info.username,
      total: info.total,
      weekly: info.weekly,
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json(rows);
}
