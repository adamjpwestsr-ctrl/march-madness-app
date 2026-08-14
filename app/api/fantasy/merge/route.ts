import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Hybrid merge logic
 * Combines Sleeper + nflverse + schedule data into unified player objects.
 * Output table: nfl_player_merged
 */

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const season = new Date().getFullYear();
    const week = 1; // TODO: make dynamic later

    // -----------------------------------------------------
    // 0. Clear existing merged data
    // -----------------------------------------------------
    const { error: clearErr } = await supabase
      .from("nfl_player_merged")
      .delete()
      .neq("espn_id", "");
    if (clearErr) throw new Error(`Failed to clear existing data: ${clearErr.message}`);

// -----------------------------------------------------
// 1. Load Active + FA Players (exclude retired)
// -----------------------------------------------------
const { data: sleeperPlayers, error: sleeperErr } = await supabase
  .from("nfl_players")
  .select("id, espn_id, name, team, position, status")
  .or("team.not.eq.FA,status.not.eq.Retired")
  .not("espn_id", "is", null);

if (sleeperErr) throw new Error(`Sleeper players load error: ${sleeperErr.message}`);


    // -----------------------------------------------------
    // 2. Load all supporting datasets
    // -----------------------------------------------------
    const results = await Promise.all([
      supabase.from("nfl_stats_weekly").select("*").eq("week", week),
      supabase.from("nfl_player_weekly_advanced").select("*").eq("week", week),
      supabase.from("nfl_player_season_totals").select("*").eq("season", season),
      supabase.from("nfl_player_snap_counts").select("*").eq("week", week),
      supabase.from("nfl_player_target_share").select("*").eq("week", week),
      supabase.from("nfl_player_redzone_usage").select("*").eq("week", week),
      supabase.from("nfl_defense_rankings").select("*").eq("week", week),
      supabase.from("nfl_schedule").select("*").eq("week", week),
    ]);

    const [
      { data: weeklyStats },
      { data: advancedWeekly },
      { data: seasonTotals },
      { data: snaps },
      { data: targets },
      { data: redzone },
      { data: defenseRanks },
      { data: schedule },
    ] = results;

    // -----------------------------------------------------
    // 3. Helper functions
    // -----------------------------------------------------
    const computeDifficulty = (rank: number | null) => {
      if (!rank && rank !== 0) return "medium";
      if (rank >= 20) return "easy";
      if (rank >= 10) return "medium";
      return "hard";
    };

    const computeTierBadge = (projected: number, seasonPoints: number) => {
      if (projected >= 18 || seasonPoints >= 200) return "Elite";
      if (projected >= 12) return "Starter";
      if (projected >= 8) return "Flex";
      return "Depth";
    };

    const computeRoleBadge = (
      snapPct: number,
      targetShare: number,
      redzoneUsage: number,
      rushYds: number,
      recYds: number,
      tds: number
    ) => {
      if (snapPct >= 80) return "Workhorse";
      if (targetShare >= 0.22) return "Target Hog";
      if (redzoneUsage >= 3) return "Red Zone Threat";
      if (rushYds >= 40 && recYds >= 40) return "Dual-Threat";
      if (recYds >= 80 && tds >= 1) return "Deep Threat";
      return null;
    };

    const computeArchetypeBadge = (pos: string, rushYds: number, recYds: number, passYds: number) => {
      switch (pos) {
        case "QB":
          return rushYds >= 40 ? "Scrambler" : "Pocket Passer";
        case "RB":
          return recYds >= 40 ? "Receiving Back" : "Power Back";
        case "WR":
          return recYds >= 80 ? "Field-Stretcher" : "Slot WR";
        case "TE":
          return recYds >= 40 ? "Volume TE" : "Red Zone TE";
        default:
          return null;
      }
    };

    // -----------------------------------------------------
    // 4. Merge Everything
    // -----------------------------------------------------
    const merged = sleeperPlayers.map((player) => {
      const pid = player.espn_id;

      const wk = weeklyStats?.find((p) => p.espn_id === pid);
      const adv = advancedWeekly?.find((p) => p.espn_id === pid);
      const season = seasonTotals?.find((p) => p.espn_id === pid);
      const snap = snaps?.find((p) => p.espn_id === pid);
      const tgt = targets?.find((p) => p.espn_id === pid);
      const rz = redzone?.find((p) => p.espn_id === pid);

      const def = defenseRanks?.find((d) => d.team === player.team);
      const defRank = def?.defense_rank || 16;

      const game = schedule?.find(
        (g) => g.home_team === player.team || g.away_team === player.team
      );

      const opponent = game
        ? game.home_team === player.team
          ? game.away_team
          : game.home_team
        : null;

      const isHome = game?.home_team === player.team;

      const headshot = `https://sleepercdn.com/content/nfl/players/${pid}.jpg`;

      const projected = wk?.fantasy_points || 0;
      const seasonPoints = season?.fantasy_points || 0;

      const rushYds = adv?.rush_yards || 0;
      const recYds = adv?.rec_yards || 0;
      const passYds = adv?.pass_yards || 0;
      const tds = adv?.touchdowns || 0;

      const snapPct = snap?.snap_pct || 0;
      const targetShare = tgt?.target_share || 0;
      const redzoneUsage = (rz?.redzone_targets || 0) + (rz?.redzone_carries || 0);

      return {
        id: pid,
        espn_id: pid,
        name: player.name,
        team: player.team,
        position: player.position,
        projected_points: projected,
        last_week_points: wk?.fantasy_points || 0,
        season_points: seasonPoints,
        pass_yards: passYds,
        rush_yards: rushYds,
        rec_yards: recYds,
        touchdowns: tds,
        snap_pct: snapPct,
        target_share: targetShare,
        redzone_usage: redzoneUsage,
        defense_rank: defRank,
        matchup_difficulty: computeDifficulty(defRank),
        headshot_url: headshot,
        opponent_team: opponent,
        is_home: isHome,
        kickoff_time: game?.kickoff || null,
        badge_tier: computeTierBadge(projected, seasonPoints),
        badge_role: computeRoleBadge(snapPct, targetShare, redzoneUsage, rushYds, recYds, tds),
        badge_archetype: computeArchetypeBadge(player.position, rushYds, recYds, passYds),
      };
    });

    // -----------------------------------------------------
    // 5. Upsert merged data
    // -----------------------------------------------------
    const { error: mergeErr } = await supabase
      .from("nfl_player_merged")
      .upsert(merged, { onConflict: "espn_id" });

    if (mergeErr) throw new Error(`Merge upsert error: ${mergeErr.message}`);

    return NextResponse.json({ status: "ok", mergedCount: merged.length });
  } catch (err: any) {
    console.error("Hybrid merge failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown merge error",
    });
  }
}
