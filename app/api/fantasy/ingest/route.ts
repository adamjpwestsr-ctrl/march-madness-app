import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const res = await fetch(
      "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes",
      {
        headers: {
          "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
        },
      }
    );

    const data = await res.json();

    if (!data || !Array.isArray(data.items)) {
      console.error("Unexpected ESPN response:", data);
      return NextResponse.json({
        status: "error",
        message: "ESPN API returned unexpected structure",
      });
    }

    const players: any[] = [];

    for (const athlete of data.items) {
      const athleteRes = await fetch(athlete.$ref);
      const athleteData = await athleteRes.json();

      const name = athleteData.fullName?.trim();
      const team = athleteData.team?.displayName || "Free Agent";

      // ✅ Skip invalid or placeholder entries
      if (!name || name.startsWith("[") || team === "Free Agent") continue;

      players.push({
        espn_id: athleteData.id,
        name,
        team,
        position: athleteData.position?.abbreviation || "UNK",
        stats: athleteData.stats || {},
      });
    }

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
          continue;
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
