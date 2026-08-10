import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Example ESPN endpoint for week 1 stats
    const res = await fetch(
      "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/types/2/weeks/1/games",
      {
        headers: {
          "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
        },
      }
    );

    const data = await res.json();

    // ✅ Defensive guard: ensure data.items exists and is iterable
    if (!data || !Array.isArray(data.items)) {
      console.error("Unexpected ESPN response:", data);
      return NextResponse.json({
        status: "error",
        message: "ESPN API returned unexpected structure",
      });
    }

    // Flatten players from all games
    const players: any[] = [];

    for (const game of data.items) {
      const gameRes = await fetch(game.$ref);
      const gameData = await gameRes.json();

      if (!gameData?.competitors) continue;

      for (const competitor of gameData.competitors) {
        if (!competitor?.athletes) continue;

        for (const athlete of competitor.athletes) {
          const athleteRes = await fetch(athlete.$ref);
          const athleteData = await athleteRes.json();

          players.push({
            espn_id: athleteData.id,
            name: athleteData.fullName,
            team: competitor.team.displayName,
            position: athleteData.position?.abbreviation || "UNK",
            stats: athleteData.stats || {},
          });
        }
      }
    }

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
