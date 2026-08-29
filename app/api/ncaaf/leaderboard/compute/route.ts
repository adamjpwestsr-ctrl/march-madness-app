import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { seasonYear, week } = await req.json();

  // Load games for the week
  const { data: games } = await supabase
    .from("ncaaf_games")
    .select("*")
    .eq("season_year", seasonYear)
    .eq("week", week);

  // Build winner map
  const winners: Record<string, string | null> = {};

  (games ?? []).forEach((g) => {
    if (g.home_team_score > g.away_team_score) {
      winners[g.game_id] = g.home_team_id;
    } else if (g.away_team_score > g.home_team_score) {
      winners[g.game_id] = g.away_team_id;
    } else {
      winners[g.game_id] = null;
    }
  });

  // Load all picks for the week
  const { data: picks } = await supabase
    .from("ncaaf_picks")
    .select("*")
    .eq("season_year", seasonYear)
    .eq("week", week);

  // Group picks by user + group
  const grouped: Record<string, any[]> = {};
  (picks ?? []).forEach((p) => {
    const key = `${p.user_id}-${p.group_id ?? "GLOBAL"}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  // Compute scores
  const payload = Object.entries(grouped).map(([key, userPicks]) => {
    const [userId, groupIdRaw] = key.split("-");
    const groupId = groupIdRaw === "GLOBAL" ? null : parseInt(groupIdRaw);

    const correct = userPicks.filter(
      (p) => winners[p.game_id] === p.picked_team_id
    ).length;

    return {
      user_id: parseInt(userId),
      group_id: groupId,
      season_year: seasonYear,
      week,
      correct_picks: correct,
      total_games: (games ?? []).length,
    };
  });

  await supabase.from("ncaaf_scores").upsert(payload);

  return NextResponse.json({ success: true, computed: payload.length });
}
