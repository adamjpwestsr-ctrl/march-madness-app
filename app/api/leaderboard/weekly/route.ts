export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("weekly_leaderboard");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows =
    data?.map((row: any, idx: number) => ({
      rank: idx + 1,
      name: row.display_name ?? "Player",
      points: row.points,
    })) ?? [];

  return NextResponse.json({ rows });
}
