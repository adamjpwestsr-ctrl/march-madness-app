import { NextRequest, NextResponse } from "next/server";

const LEAGUES = {
  MLB: "baseball/mlb",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",

  GOLF: "golf/pga",

  TENNIS_ATP: "tennis/atp",

  EPL: "soccer/eng.1",
  MLS: "soccer/usa.1",
  UCL: "soccer/uefa.1",
  FIFA: "soccer/fifa.worldcup",

  F1: "racing/f1",
  INDY: "racing/indycar",
  NASCAR: "racing/nascar.cup",
} as const;

type LeagueKey = keyof typeof LEAGUES;

async function fetchLeague(path: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.events || [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const allEvents: any[] = [];

  for (const key of Object.keys(LEAGUES) as LeagueKey[]) {
    const events = await fetchLeague(LEAGUES[key]);
    allEvents.push(...events);
  }

  return NextResponse.json({ events: allEvents });
}
