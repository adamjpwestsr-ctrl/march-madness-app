import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // ✅ Stable ESPN Fantasy endpoint
    const res = await fetch(
      "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1",
      {
        headers: {
          "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
        },
      }
    );

    const data = await res.json();

    // ✅ Defensive guard: ensure data.players exists and is iterable
    if (!data || !Array.isArray(data.players)) {
      console.error("Unexpected ESPN fantasy response:", data);
      return NextResponse.json({
        status: "error",
        message: "ESPN Fantasy API returned unexpected structure",
      });
    }

    // Flatten players
    const players: any[] = data.players.map((p: any) => ({
      espn_id: p.id,
      name: p.player.fullName,
      team: p.player.proTeamId,
      position: p.player.defaultPositionId,
      stats: p.player.stats || {},
    }));

    // Insert players + stats
    for (const p of players) {
      const { data: existing } = await supabase
        .from("nfl_players")
        .select("id")
        .eq("espn_id", p.espn_id)
        .maybeSingle();

      let playerId = existing?.id;

      if (!playerId) {
        const { data: newPlayer } = await supabase
          .from("nfl_players")
          .insert({
            espn_id: p.espn_id,
            name: p.name,
            team: p.team,
            position: p.position,
          })
          .select("id")
          .single();

        if (!newPlayer) {
          console.error("Failed to insert new player:", p);
          continue; // Skip this player safely
        }

        playerId = newPlayer.id;
      }

      await supabase.from("nfl_stats_weekly").insert({
        player_id: playerId,
        week: 1,
        passing_yards: p.stats.passing?.yards || 0,
        rushing_yards: p.stats.rushing?.yards || 0,
        receiving_yards: p.stats.receiving?.yards || 0,
        touchdowns: p.stats.touchdowns || 0,
        interceptions: p.stats.interceptions || 0,
        fumbles: p.stats.fumbles || 0,
      });
    }

    return NextResponse.json({ status: "ok", count: players.length });
  } catch (err: any) {
    console.error("Ingestion failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown ingestion error",
    });
  }
}
