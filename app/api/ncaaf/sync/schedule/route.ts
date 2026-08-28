import { NextResponse } from "next/server";
import { espnFetch } from "@/lib/espnApi";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const data = await espnFetch("scoreboard");

  const payload = data.events.map((e: any) => ({
    season_year: new Date().getFullYear(),
    week: data.week.number,
    game_id: e.id.toString(),
    home_team_id: e.competitions[0].competitors.find((c: any) => c.homeAway === "home").id.toString(),
    away_team_id: e.competitions[0].competitors.find((c: any) => c.homeAway === "away").id.toString(),
    start_time: e.date,
    conference: e.competitions[0].conference ?? null,
    home_rank: e.competitions[0].competitors.find((c: any) => c.homeAway === "home").curatedRank?.current ?? null,
    away_rank: e.competitions[0].competitors.find((c: any) => c.homeAway === "away").curatedRank?.current ?? null,
    is_top25: !!(
      e.competitions[0].competitors.find((c: any) => c.homeAway === "home").curatedRank?.current ||
      e.competitions[0].competitors.find((c: any) => c.homeAway === "away").curatedRank?.current
    ),
  }));

  const { error } = await supabase.from("ncaaf_games").upsert(payload);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ count: payload.length });
}
