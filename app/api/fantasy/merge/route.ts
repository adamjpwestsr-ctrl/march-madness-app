import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Hybrid merge logic
 * Combines Sleeper + nflverse + schedule data into unified player objects.
 *
 * Output table: nfl_player_merged
 */

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const season = new Date().getFullYear();
    const week = 1; // You can make this dynamic later

    // -----------------------------------------------------
    // 1. Load Sleeper Players
    // -----------------------------------------------------
    const { data: sleeperPlayers, error: sleeperErr } = await supabase
      .from("nfl_players")
      .select("*");

    if (sleeperErr) {
      console.error("Sleeper players load error:", sleeperErr);
      return NextResponse.json({ status: "error", message: sleeperErr.message });
    }

    // -----------------------------------------------------
    // 2. Load Sleeper Projections
    // -----------------------------------------------------
    const { data: projections, error: projErr } = await supabase
      .from("nfl_player_projections")
      .select("*")
      .eq("week", week);

    if (projErr) {
      console.error("Sleeper projections load error:", projErr);
      return NextResponse.json({ status: "error", message: projErr.message });
    }

    // -----------------------------------------------------
    // 3. Load Sleeper Weekly Stats
    // -----------------------------------------------------
    const { data: weeklyStats, error: weeklyErr } = await supabase
      .from("nfl_player_weekly_stats")
      .select("*")
      .eq("week", week);

    if (weeklyErr) {
      console.error("Sleeper weekly stats load error:", weeklyErr);
      return NextResponse.json({ status: "error", message: weeklyErr.message });
    }

    // -----------------------------------------------------
    // 4. Load nflverse Weekly Advanced Stats
    // -----------------------------------------------------
    const { data: advancedWeekly, error: advErr } = await supabase
      .from("nfl_player_weekly_advanced")
      .select("*")
      .eq("week", week);

    if (advErr) {
      console.error("nflverse weekly advanced error:", advErr);
      return NextResponse.json({ status: "error", message: advErr.message });
    }

    // -----------------------------------------------------
    // 5. Load nflverse Season Totals
    // -----------------------------------------------------
    const { data: seasonTotals, error: seasonErr } = await supabase
      .from("nfl_player_season_totals")
      .select("*")
      .eq("season", season);

    if (seasonErr) {
      console.error("nflverse season totals error:", seasonErr);
      return NextResponse.json({ status: "error", message: seasonErr.message });
    }

    // -----------------------------------------------------
    // 6. Load Snap Counts
    // -----------------------------------------------------
    const { data: snaps, error: snapsErr } = await supabase
      .from("nfl_player_snap_counts")
      .select("*")
      .eq("week", week);

    if (snapsErr) {
      console.error("Snap counts error:", snapsErr);
      return NextResponse.json({ status: "error", message: snapsErr.message });
    }

    // -----------------------------------------------------
    // 7. Load Target Share
    // -----------------------------------------------------
    const { data: targets, error: targetErr } = await supabase
      .from("nfl_player_target_share")
      .select("*")
      .eq("week", week);

    if (targetErr) {
      console.error("Target share error:", targetErr);
      return NextResponse.json({ status: "error", message: targetErr.message });
    }

    // -----------------------------------------------------
    // 8. Load Red Zone Usage
    // -----------------------------------------------------
    const { data: redzone, error: redErr } = await supabase
      .from("nfl_player_redzone_usage")
      .select("*")
      .eq("week", week);

    if (redErr) {
      console.error("Red zone error:", redErr);
      return NextResponse.json({ status: "error", message: redErr.message });
    }

    // -----------------------------------------------------
    // 9. Load Defensive Rankings
    // -----------------------------------------------------
    const { data: defenseRanks, error: defErr } = await supabase
      .from("nfl_defense_rankings")
      .select("*")
      .eq("week", week);

    if (defErr) {
      console.error("Defense rankings load error:", defErr);
      return NextResponse.json({ status: "error", message: defErr.message });
    }

    // -----------------------------------------------------
    // 10. Load Schedule (Opponent + Game Info)
    // -----------------------------------------------------
    const { data: schedule, error: schedErr } = await supabase
      .from("nfl_schedule")
      .select("*")
      .eq("week", week);

    if (schedErr) {
      console.error("Schedule load error:", schedErr);
      return NextResponse.json({ status: "error", message: schedErr.message });
    }

    // Difficulty logic
    const computeDifficulty = (rank: number | null) => {
      if (!rank && rank !== 0) return "medium";
      if (rank >= 20) return "easy";
      if (rank >= 10) return "medium";
      return "hard";
    };

    // ⭐ NEW BADGE LOGIC
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

    const computeArchetypeBadge = (
      pos: string,
      rushYds: number,
      recYds: number,
      passYds: number
    ) => {
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
    // 11. Merge Everything
    // -----------------------------------------------------
    const merged = sleeperPlayers.map((player) => {
      const pid = player.espn_id;

      const proj = projections.find((p) => p.espn_id === pid);
      const wk = weeklyStats.find((p) => p.espn_id === pid);
      const adv = advancedWeekly.find((p) => p.espn_id === pid);
      const season = seasonTotals.find((p) => p.espn_id === pid);
      const snap = snaps.find((p) => p.espn_id === pid);
      const tgt = targets.find((p) => p.espn_id === pid);
      const rz = redzone.find((p) => p.espn_id === pid);

      // Defensive rank lookup
      const def = defenseRanks.find((d) => d.team === player.team);
      const defRank = def?.defense_rank || 16;

      // Opponent lookup
      const game = schedule.find(
        (g) => g.home_team === player.team || g.away_team === player.team
      );

      const opponent =
        game?.home_team === player.team ? game?.away_team : game?.home_team;

      const isHome = game?.home_team === player.team;

      // Sleeper headshot URL
      const headshot = `https://sleepercdn.com/content/nfl/players/${pid}.jpg`;

      // ⭐ NEW: badge inputs
      const projected = proj?.projected_points || 0;
      const seasonPoints = season?.fantasy_points || 0;

      const rushYds = adv?.rush_yards || 0;
      const recYds = adv?.rec_yards || 0;
      const passYds = adv?.pass_yards || 0;
      const tds = adv?.touchdowns || 0;

      const snapPct = snap?.snap_pct || 0;
      const targetShare = tgt?.target_share || 0;
      const redzoneUsage =
        (rz?.redzone_targets || 0) + (rz?.redzone_carries || 0);

      return {
        espn_id: pid,
        name: player.name,
        team: player.team,
        position: player.position,

        // Sleeper projections
        projected_points: projected,

        // Sleeper weekly stats
        last_week_points: wk?.fantasy_points || 0,

        // nflverse season totals
        season_points: seasonPoints,

        // nflverse advanced stats
        pass_yards: passYds,
        rush_yards: rushYds,
        rec_yards: recYds,
        touchdowns: tds,

        // Snap counts
        snap_pct: snapPct,

        // Target share
        target_share: targetShare,

        // Red zone usage
        redzone_usage: redzoneUsage,

        // matchup difficulty
        defense_rank: defRank,
        matchup_difficulty: computeDifficulty(defRank),

        // headshot
        headshot_url: headshot,

        // opponent + game info
        opponent_team: opponent || null,
        is_home: isHome,
        kickoff_time: game?.kickoff || null,

        // ⭐ NEW BADGES
        badge_tier: computeTierBadge(projected, seasonPoints),
        badge_role: computeRoleBadge(
          snapPct,
          targetShare,
          redzoneUsage,
          rushYds,
          recYds,
          tds
        ),
        badge_archetype: computeArchetypeBadge(
          player.position,
          rushYds,
          recYds,
          passYds
        ),
      };
    });

    // -----------------------------------------------------
    // 12. Upsert merged data
    // -----------------------------------------------------
    const { error: mergeErr } = await supabase
      .from("nfl_player_merged")
      .upsert(merged, { onConflict: "espn_id" });

    if (mergeErr) {
      console.error("Merge upsert error:", mergeErr);
      return NextResponse.json({ status: "error", message: mergeErr.message });
    }

    return NextResponse.json({
      status: "ok",
      mergedCount: merged.length,
    });
  } catch (err: any) {
    console.error("Hybrid merge failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown merge error",
    });
  }
}
