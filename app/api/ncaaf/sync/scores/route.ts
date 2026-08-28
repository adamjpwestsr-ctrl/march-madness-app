import { NextResponse } from "next/server";
import { espnFetch } from "@/lib/espnApi";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const data = await espnFetch("scoreboard");

  const updates = data.events.map((e: any) => {
    const comp = e.competitions[0];
    const home = comp.competitors.find((c: any) => c.homeAway === "home");
    const away = comp.competitors.find((c: any) => c.homeAway === "away");
    return {
      game_id: e.id.toString(),
      home_team_score: home.score ? parseInt(home.score) : null,
      away_team_score: away.score ? parseInt(away.score) : null,
    };
  });

  for (const u of updates) {
    await supabase
      .from("ncaaf_games")
      .update({
        home_team_score: u.home_team_score,
        away_team_score: u.away_team_score,
      })
      .eq("game_id", u.game_id);
  }

  return NextResponse.json({ updated: updates.length });
}
