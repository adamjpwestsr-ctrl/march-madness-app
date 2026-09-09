import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Scoring rules (customizable):
 * Round of 64  → 1 point
 * Round of 32  → 2 points
 * Sweet 16     → 4 points
 * Elite 8      → 8 points
 * Final Four   → 16 points
 * Championship → 32 points
 */
const ROUND_POINTS: Record<number, number> = {
  64: 1,
  32: 2,
  16: 4,
  8: 8,
  4: 16,
  2: 32,
};

/**
 * Calculates scores for all users in a group (or global if groupId = null)
 */
export async function calculateScores(seasonYear: number, groupId: string | null) {
  const supabase = await createSupabaseServerClient();

  // Load actual game results
  const { data: games } = await supabase
    .from("mm_games")
    .select("id, round, winning_team_id")
    .eq("season_year", seasonYear);

  if (!games) throw new Error("Failed to load games");

  const gameResults: Record<string, { round: number; winning_team_id: string }> = {};
  games.forEach((g) => {
    gameResults[g.id] = {
      round: g.round,
      winning_team_id: g.winning_team_id,
    };
  });

  // Load user picks
  const { data: picks } = await supabase
    .from("mm_picks")
    .select("user_id, game_id, selected_team_id")
    .eq("season_year", seasonYear)
    .eq("group_id", groupId);

  if (!picks) throw new Error("Failed to load picks");

  // Aggregate scores
  const scores: Record<string, number> = {};

  picks.forEach((p) => {
    const result = gameResults[p.game_id];
    if (!result) return;

    const isCorrect = p.selected_team_id === result.winning_team_id;
    if (!isCorrect) return;

    const points = ROUND_POINTS[result.round] || 0;

    scores[p.user_id] = (scores[p.user_id] || 0) + points;
  });

  // Save scores to mm_scores table
  await supabase
    .from("mm_scores")
    .delete()
    .eq("season_year", seasonYear)
    .eq("group_id", groupId);

  const rows = Object.entries(scores).map(([userId, score]) => ({
    user_id: userId,
    season_year: seasonYear,
    group_id: groupId,
    score,
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("mm_scores").insert(rows);
    if (error) throw new Error("Failed to save scores");
  }

  return scores;
}
