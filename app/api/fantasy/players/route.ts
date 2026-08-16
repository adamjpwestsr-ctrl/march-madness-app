// app/api/fantasy/players/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Optional filters
    const position = searchParams.get("position");
    const team = searchParams.get("team");

    // Optional sorting
    const sort = searchParams.get("sort") || "projected_points"; // default sort
    const direction = searchParams.get("direction") === "desc" ? false : true;

    let query = supabase
      .from("nfl_player_merged") // ✅ use merged table
      .select(`
        id,
        espn_id,
        name,
        team,
        position,
        projected_points,
        last_week_points,
        season_points,
        snap_pct,
        target_share,
        redzone_usage,
        defense_rank,
        matchup_difficulty,
        headshot_url,
        opponent_team,
        is_home,
        kickoff_time,
        badge_tier,
        badge_role,
        badge_archetype
      `);

    // Apply filters
    if (position) query = query.eq("position", position.toUpperCase());
    if (team) query = query.eq("team", team.toUpperCase());

    // Apply sorting
    query = query.order(sort, { ascending: direction });

    const { data, error } = await query;

    if (error) {
      console.error("Player fetch error:", error);
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      count: data?.length || 0,
      players: data || [],
    });
  } catch (err: any) {
    console.error("Players API failure:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
