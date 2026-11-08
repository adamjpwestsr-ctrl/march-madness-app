import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Scoring rules:
 * Opening Round → 1 point (NO seed bonus)
 * Round of 64  → 1 + seed
 * Round of 32  → 2 + seed
 * Sweet 16     → 4 + seed
 * Elite 8      → 8 + seed
 * Final Four   → 16 + seed
 * Championship → 32 + seed
 */
const ROUND_POINTS: Record<number, number> = {
  1: 1,   // Round of 64
  2: 2,   // Round of 32
  3: 4,   // Sweet 16
  4: 8,   // Elite 8
  5: 16,  // Final Four
  6: 32,  // Championship
};

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

  // Load team seeds
  const { data: teams } = await supabase
    .from("mm_teams")
    .select("id, seed");

  if (!teams) throw new Error("Failed to load team seeds");

  const teamSeedMap: Record<string, number> = {};
  teams.forEach((t) => {
    teamSeedMap[t.id] = t.seed;
  });

  // Aggregate scores
  const scores: Record<string, number> = {};

  picks.forEach((p) => {
    const result = gameResults[p.game_id];
    if (!result) return;

    const isCorrect = p.selected_team_id === result.winning_team_id;
    if (!isCorrect) return;

    let points = 0;

    if (result.round === 0) {
      // Opening Round: fixed 1 point
      points = 1;
    } else {
      const base = ROUND_POINTS[result.round] || 0;
      const seed = teamSeedMap[result.winning_team_id] || 0;
      points = base + seed;
    }

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
