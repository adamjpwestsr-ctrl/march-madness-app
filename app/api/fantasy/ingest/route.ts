import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Sleeper NFL players endpoint (public, no auth required)
    const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
      headers: {
        "User-Agent": "BracketBoss/1.0 (https://bracketboss-theta.vercel.app)",
      },
    });

    const data = await res.json();

    // Sleeper returns a giant object keyed by player_id
    if (!data || typeof data !== "object") {
      console.error("Unexpected Sleeper response:", data);
      return NextResponse.json({
        status: "error",
        message: "Sleeper API returned unexpected structure",
      });
    }

    const players: any[] = [];

    // Convert object → array
    for (const key of Object.keys(data)) {
      const p = data[key];

      // Skip invalid or non‑fantasy entries
      if (!p || !p.full_name) continue;
      if (!p.position) continue; // filters out weird entries
      if (p.status && p.status !== "Active") continue; // only active players

      players.push({
        espn_id: p.player_id, // using Sleeper ID as our primary key
        name: p.full_name,
        team: p.team || "FA",
        position: p.position,
      });
    }

    let insertedCount = 0;

    // Insert players into Supabase
    for (const p of players) {
      const { data: existing } = await supabase
        .from("nfl_players")
        .select("id")
        .eq("espn_id", p.espn_id)
        .maybeSingle();

      if (existing?.id) continue;

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

      if (newPlayer) insertedCount++;
    }

    return NextResponse.json({
      status: "ok",
      count: insertedCount,
    });
  } catch (err: any) {
    console.error("Sleeper ingestion failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown ingestion error",
    });
  }
}
