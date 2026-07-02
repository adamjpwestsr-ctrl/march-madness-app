import { NextRequest, NextResponse } from "next/server";

const LEAGUES = {
  MLB: "baseball/mlb",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",

  // GOLF REMOVED FROM HERE — handled separately
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

// ⭐ PGA FIX — ONLY THIS FEED WORKS FOR GOLF
async function fetchGolf() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();

    // ⭐ Normalize golf tournaments so ticker can render them
    return (
      data?.events?.map((e: any) => ({
        id: e.id,
        label: e.label,
        startDate: e.startDate,
        endDate: e.endDate,
        league: { slug: "pga" },
      })) || []
    );
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const results = await Promise.all([
    // ⭐ Fetch all non-golf leagues
    ...Object.entries(LEAGUES).map(async ([key, path]) => {
      const events = await fetchLeague(path);
      console.log(`${key}: ${events.length}`);
      return events;
    }),

    // ⭐ Fetch golf separately
    fetchGolf(),
  ]);

  const allEvents = results.flat();

  return NextResponse.json({ events: allEvents });
}
