import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(req.url);
  const seasonYear = Number(searchParams.get("seasonYear"));
  const week = searchParams.get("week") ? Number(searchParams.get("week")) : null;
  const groupId = searchParams.get("groupId") ? Number(searchParams.get("groupId")) : null;

  // Load picks
  const { data: picks } = await supabase
    .from("ncaaf_picks")
    .select("user_id, game_id, picked_team_id, week")
    .eq("season_year", seasonYear)
    .match(groupId ? { group_id: groupId } : {})
    .order("week");

  if (!picks) return NextResponse.json([]);

  // Load games
  const { data: games } = await supabase
    .from("ncaaf_games")
    .select("id, home_team_id, away_team_id, home_team_score, away_team_score, week")
    .eq("season_year", seasonYear);

  if (!games) return NextResponse.json([]);

  // Winner lookup
  const winners: Record<number, string> = {};
  games.forEach((g) => {
    if (g.home_team_score === null || g.away_team_score === null) return;
    winners[g.id] =
      g.home_team_score > g.away_team_score ? g.home_team_id : g.away_team_id;
  });

  // Aggregate points
  const totals: Record<
    string,
    { user_id: number; weekly: Record<number, number>; season: number }
  > = {};

  picks.forEach((p) => {
    const winner = winners[p.game_id];
    const correct = winner && winner === p.picked_team_id;

    if (!totals[p.user_id]) {
      totals[p.user_id] = {
        user_id: p.user_id,
        weekly: {},
        season: 0,
      };
    }

    if (!totals[p.user_id].weekly[p.week]) {
      totals[p.user_id].weekly[p.week] = 0;
    }

    if (correct) {
      totals[p.user_id].weekly[p.week] += 1;
      totals[p.user_id].season += 1;
    }
  });

  // Load usernames
  const { data: users } = await supabase
    .from("ncaaf_users")
    .select("id, username");

  const nameMap: Record<number, string> = {};
  users?.forEach((u) => (nameMap[u.id] = u.username));

  // Build leaderboard rows
  const rows = Object.values(totals)
    .map((t) => ({
      user_id: t.user_id,
      username: nameMap[t.user_id] ?? "Unknown",
      weekly_points: week ? t.weekly[week] ?? 0 : null,
      season_points: t.season,
    }))
    .sort((a, b) => b.season_points - a.season_points);

  return NextResponse.json(rows);
}
