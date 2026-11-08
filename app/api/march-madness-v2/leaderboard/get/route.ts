import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Load enriched leaderboard rows
  const { data, error } = await supabase
    .from("bracket_leaderboard")
    .select(
      "bracket_id, user_id, total_points, previous_points, rank, previous_rank, name, avatar_url, groups"
    )
    .order("total_points", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `Failed to load leaderboard: ${error.message}` },
      { status: 500 }
    );
  }

  // Compute dynamic values
  const enriched = data.map((row) => {
    const momentum = row.total_points - (row.previous_points ?? row.total_points);
    const rankChange =
      row.previous_rank != null ? row.previous_rank - row.rank : 0;

    return {
      rank: row.rank,
      rankChange,
      momentum,

      userId: row.user_id,
      bracketId: row.bracket_id,
      score: row.total_points,

      name: row.name ?? "Unknown",
      avatarUrl: row.avatar_url ?? "/default-avatar.png",
      groups: row.groups ?? [],
    };
  });

  return NextResponse.json(
    {
      success: true,
      leaderboard: enriched,
    },
    { status: 200 }
  );
}
