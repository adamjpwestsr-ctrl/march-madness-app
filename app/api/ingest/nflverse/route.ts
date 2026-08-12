import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * nflverse ingestion route
 * Pulls advanced NFL analytics from the nflverse GitHub data repo.
 * Ingests:
 *  - Weekly advanced stats
 *  - Season totals
 *  - Snap counts
 *  - Target share
 *  - Red zone usage
 *
 * All data is free, public, and updated weekly by nflverse.
 */

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const season = new Date().getFullYear();
    const week = 1; // You can make this dynamic later

    // -----------------------------------------------------
    // 1. Weekly Advanced Stats (fantasy-friendly)
    // -----------------------------------------------------
    const weeklyUrl = `https://raw.githubusercontent.com/nflverse/nflverse-data/master/data/nflfastR/stats/weekly_stats_${season}.csv`;

    const weeklyRes = await fetch(weeklyUrl);
    const weeklyCsv = await weeklyRes.text();

    const weeklyRows = parseCsv(weeklyCsv);

    const weeklyStats = weeklyRows
      .filter((r) => Number(r.week) === week)
      .map((r) => ({
        espn_id: r.player_id,
        week,
        season,
        team: r.posteam || null,
        position: r.position || null,
        fantasy_points: Number(r.fantasy_points) || 0,
        pass_yards: Number(r.passing_yards) || 0,
        rush_yards: Number(r.rushing_yards) || 0,
        rec_yards: Number(r.receiving_yards) || 0,
        touchdowns:
          Number(r.passing_tds || 0) +
          Number(r.rushing_tds || 0) +
          Number(r.receiving_tds || 0),
        interceptions: Number(r.interceptions) || 0,
        fumbles: Number(r.fumbles) || 0,
      }));

    const { error: weeklyError } = await supabase
      .from("nfl_player_weekly_advanced")
      .upsert(weeklyStats, { onConflict: "espn_id,week" });

    if (weeklyError) {
      console.error("Weekly advanced stats error:", weeklyError);
      return NextResponse.json({
        status: "error",
        message: weeklyError.message,
      });
    }

    // -----------------------------------------------------
    // 2. Season Totals
    // -----------------------------------------------------
    const seasonUrl = `https://raw.githubusercontent.com/nflverse/nflverse-data/master/data/nflfastR/stats/player_stats_${season}.csv`;

    const seasonRes = await fetch(seasonUrl);
    const seasonCsv = await seasonRes.text();

    const seasonRows = parseCsv(seasonCsv);

    const seasonStats = seasonRows.map((r) => ({
      espn_id: r.player_id,
      season,
      games: Number(r.games) || 0,
      pass_yards: Number(r.passing_yards) || 0,
      rush_yards: Number(r.rushing_yards) || 0,
      rec_yards: Number(r.receiving_yards) || 0,
      touchdowns:
        Number(r.passing_tds || 0) +
        Number(r.rushing_tds || 0) +
        Number(r.receiving_tds || 0),
      fantasy_points: Number(r.fantasy_points) || 0,
    }));

    const { error: seasonError } = await supabase
      .from("nfl_player_season_totals")
      .upsert(seasonStats, { onConflict: "espn_id,season" });

    if (seasonError) {
      console.error("Season totals error:", seasonError);
      return NextResponse.json({
        status: "error",
        message: seasonError.message,
      });
    }

    // -----------------------------------------------------
    // 3. Snap Counts
    // -----------------------------------------------------
    const snapsUrl = `https://raw.githubusercontent.com/nflverse/nflverse-data/master/data/snap_counts/snap_counts_${season}.csv`;

    const snapsRes = await fetch(snapsUrl);
    const snapsCsv = await snapsRes.text();

    const snapsRows = parseCsv(snapsCsv);

    const snapCounts = snapsRows
      .filter((r) => Number(r.week) === week)
      .map((r) => ({
        espn_id: r.player_id,
        week,
        season,
        snaps: Number(r.snaps) || 0,
        snap_pct: Number(r.snap_pct) || 0,
      }));

    const { error: snapsError } = await supabase
      .from("nfl_player_snap_counts")
      .upsert(snapCounts, { onConflict: "espn_id,week" });

    if (snapsError) {
      console.error("Snap counts error:", snapsError);
      return NextResponse.json({
        status: "error",
        message: snapsError.message,
      });
    }

    // -----------------------------------------------------
    // 4. Target Share
    // -----------------------------------------------------
    const targetUrl = `https://raw.githubusercontent.com/nflverse/nflverse-data/master/data/target_share/target_share_${season}.csv`;

    const targetRes = await fetch(targetUrl);
    const targetCsv = await targetRes.text();

    const targetRows = parseCsv(targetCsv);

    const targetShare = targetRows
      .filter((r) => Number(r.week) === week)
      .map((r) => ({
        espn_id: r.player_id,
        week,
        season,
        targets: Number(r.targets) || 0,
        target_share: Number(r.target_share) || 0,
      }));

    const { error: targetError } = await supabase
      .from("nfl_player_target_share")
      .upsert(targetShare, { onConflict: "espn_id,week" });

    if (targetError) {
      console.error("Target share error:", targetError);
      return NextResponse.json({
        status: "error",
        message: targetError.message,
      });
    }

    // -----------------------------------------------------
    // 5. Red Zone Usage
    // -----------------------------------------------------
    const redzoneUrl = `https://raw.githubusercontent.com/nflverse/nflverse-data/master/data/redzone/redzone_${season}.csv`;

    const redzoneRes = await fetch(redzoneUrl);
    const redzoneCsv = await redzoneRes.text();

    const redzoneRows = parseCsv(redzoneCsv);

    const redzoneUsage = redzoneRows
      .filter((r) => Number(r.week) === week)
      .map((r) => ({
        espn_id: r.player_id,
        week,
        season,
        redzone_targets: Number(r.redzone_targets) || 0,
        redzone_carries: Number(r.redzone_carries) || 0,
      }));

    const { error: redzoneError } = await supabase
      .from("nfl_player_redzone_usage")
      .upsert(redzoneUsage, { onConflict: "espn_id,week" });

    if (redzoneError) {
      console.error("Red zone error:", redzoneError);
      return NextResponse.json({
        status: "error",
        message: redzoneError.message,
      });
    }

    // -----------------------------------------------------
    // Done
    // -----------------------------------------------------
    return NextResponse.json({
      status: "ok",
      weeklyAdvanced: weeklyStats.length,
      seasonTotals: seasonStats.length,
      snapCounts: snapCounts.length,
      targetShare: targetShare.length,
      redzoneUsage: redzoneUsage.length,
    });
  } catch (err: any) {
    console.error("nflverse ingestion failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown ingestion error",
    });
  }
}

/**
 * Simple CSV parser for nflverse GitHub data.
 */
function parseCsv(csv: string) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = cols[i];
    });
    return row;
  });
}
