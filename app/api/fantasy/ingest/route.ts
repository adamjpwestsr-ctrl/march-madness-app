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

    // Validate structure
    if (!data || typeof data !== "object") {
      console.error("Unexpected Sleeper response:", data);
      return NextResponse.json({
        status: "error",
        message: "Sleeper API returned unexpected structure",
      });
    }

    // Filter and map players
    const filteredPlayers = Object.values(data)
      .filter(
        (p: any) =>
          p &&
          p.full_name &&
          p.position &&
          (!p.status || p.status === "Active")
      )
      .map((p: any) => ({
        espn_id: p.player_id,
        name: p.full_name,
        team: p.team || "FA",
        position: p.position,
      }));

    // Batch insert (upsert avoids duplicates)
    const { data: inserted, error } = await supabase
      .from("nfl_players")
      .upsert(filteredPlayers, { onConflict: "espn_id" })
      .select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ status: "error", message: error.message });
    }

    return NextResponse.json({
      status: "ok",
      count: inserted?.length || filteredPlayers.length,
    });
  } catch (err: any) {
    console.error("Sleeper ingestion failed:", err);
    return NextResponse.json({
      status: "error",
      message: err.message || "Unknown ingestion error",
    });
  }
}
