import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    // -----------------------------------------------------
    // 1. Sleeper Player Metadata
    // -----------------------------------------------------
    const playersRes = await fetch("https://api.sleeper.app/v1/players/nfl", {
      headers: {
        "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
      },
    });

    const playersJson = await playersRes.json();

    if (!playersJson || typeof playersJson !== "object") {
      console.error("Sleeper metadata error:", playersJson);
      return NextResponse.json({
        status: "error",
        message: "Invalid Sleeper player metadata response",
      });
    }

    // Filter active players only
    const activePlayers = Object.values(playersJson)
      .filter((p: any) => p && p.full_name && p.position && p.status === "Active")
      .map((p: any) => ({
        espn_id: p.player_id,
        name: p.full_name,
        team: p.team || "FA",
        position: p.position,
      }));

    // Upsert players
    const { error: playersError } = await supabase
      .from("nfl_players")
      .upsert(activePlayers, { onConflict: "espn_id" });

    if (playersError) {
      console.error("Supabase player upsert error:", playersError);
      return NextResponse.json({
        status: "error",
        message: playersError.message,
      });
    }

    // -----------------------------------------------------
    // 2. Sleeper Weekly Projections
    // -----------------------------------------------------
    const currentYear = new Date().getFullYear();
    const currentWeek = 1; // You can make this dynamic later

    const projectionsRes = await fetch(
      `https://api.sleeper.app/v1/projections/nfl/${currentYear}/${currentWeek}`,
      {
        headers: {
          "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
        },
      }
    );

    const projectionsJson = await projectionsRes.json();

    if (!Array.isArray(projectionsJson)) {
      console.error("Sleeper projections error:", projectionsJson);
      return NextResponse.json({
        status: "error",
        message: "Invalid Sleeper projections response",
      });
    }

    const projections = projectionsJson.map((p: any) => ({
      espn_id: p.player_id,
      week: currentWeek,
      projected_points: p.fantasy_points || 0,
      projected_pass_yards: p.pass_yd || 0,
      projected_rush_yards: p.rush_yd || 0,
      projected_rec_yards: p.rec_yd || 0,
      projected_tds: p.pass_td + p.rush_td + p.rec_td || 0,
    }));

    const { error: projError } = await supabase
      .from("nfl_player_projections")
      .upsert(projections, { onConflict: "espn_id,week" });

    if (projError) {
      console.error("Supabase projections error:", projError);
      return NextResponse.json({
        status: "error",
        message: projError.message,
      });
    }

    // -----------------------------------------------------
    // 3. Sleeper Weekly Stats
    // -----------------------------------------------------
    const statsRes = await fetch(
      `https://api.sleeper.app/v1/stats/nfl/${currentYear}/${currentWeek}`,
      {
        headers: {
          "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
        },
      }
    );

    const statsJson = await statsRes.json();

    if (!Array.isArray(statsJson)) {
      console.error("Sleeper stats error:", statsJson);
      return NextResponse.json({
        status: "error",
        message: "Invalid Sleeper stats response",
      });
    }

    const weeklyStats = statsJson.map((s: any) => ({
      espn_id: s.player_id,
      week: currentWeek,
      fantasy_points: s.fantasy_points || 0,
      pass_yards: s.pass_yd || 0,
      rush_yards: s.rush_yd || 0,
      rec_yards: s.rec_yd || 0,
      touchdowns: (s.pass_td || 0) + (s.rush_td || 0) + (s.rec_td || 0),
      interceptions: s.pass_int || 0,
      fumbles: s.fumbles || 0,
    }));

    const { error: statsError } = await supabase
      .from("nfl_player_weekly_stats")
      .upsert(weeklyStats, { onConflict: "espn_id,week" });

    if (statsError) {
      console.error("Supabase weekly stats error:", statsError);
      return NextResponse.json({
        status: "error",
        message: statsError.message,
      });
    }

    // -----------------------------------------------------
    // Done
    // -----------------------------------------------------
    return NextResponse.json({
      status: "ok",
      players: activePlayers.length,
      projections: projections.length,
      weeklyStats: weeklyStats.length,
    });
  } catch (err: any) {
    console.error("Sleeper ingestion failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown ingestion error",
    });
  }
}
