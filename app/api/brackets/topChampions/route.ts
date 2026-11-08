import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("brackets")
    .select("champion_team")
    .not("champion_team", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // aggregate counts in JS
  const counts: Record<string, number> = {};
  for (const row of data) {
    const team = row.champion_team;
    if (!team) continue;
    counts[team] = (counts[team] || 0) + 1;
  }

  const result = Object.entries(counts)
    .map(([champion_team, selection_count]) => ({ champion_team, selection_count }))
    .sort((a, b) => b.selection_count - a.selection_count)
    .slice(0, 5);

  return NextResponse.json(result);
}
