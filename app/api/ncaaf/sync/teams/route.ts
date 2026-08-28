import { NextResponse } from "next/server";
import { espnFetch } from "@/lib/espnApi";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const data = await espnFetch("teams");

  const payload = data.sports[0].leagues[0].teams.map((t: any) => ({
    id: t.team.id.toString(),
    name: t.team.displayName,
    abbreviation: t.team.abbreviation,
    conference: t.team.groups?.[0]?.name ?? null,
    logo_url: t.team.logos?.[0]?.href ?? null,
  }));

  const { error } = await supabase.from("ncaaf_teams").upsert(payload);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ count: payload.length });
}
