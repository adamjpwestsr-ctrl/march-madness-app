import { NextResponse } from "next/server";
import { espnFetch } from "@/lib/espnApi";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const data = await espnFetch("rankings");

  const payload: any[] = [];
  data.rankings.forEach((poll: any) => {
    poll.ranks.forEach((r: any) => {
      payload.push({
        season_year: new Date().getFullYear(),
        week: poll.week.number,
        poll: poll.name,
        team_id: r.team.id.toString(),
        rank: r.rank,
      });
    });
  });

  const { error } = await supabase.from("ncaaf_rankings").upsert(payload);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ count: payload.length });
}
