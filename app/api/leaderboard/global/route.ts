import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("user_totals")
    .select("total_points, profiles (id, display_name)")
    .order("total_points", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows =
    data?.map((row: any, idx: number) => ({
      rank: idx + 1,
      name: row.profiles.display_name ?? "Player",
      points: row.total_points,
    })) ?? [];

  return NextResponse.json({ rows });
}
