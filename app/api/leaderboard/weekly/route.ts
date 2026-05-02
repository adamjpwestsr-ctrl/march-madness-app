import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase.rpc("weekly_leaderboard");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows =
    data?.map((row: any, idx: number) => ({
      rank: idx + 1,
      name: row.display_name ?? "Player",
      points: row.points,
    })) ?? [];

  return NextResponse.json({ rows });
}
