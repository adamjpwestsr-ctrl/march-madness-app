import { NextRequest, NextResponse } from "next/server";

const SPORTS = {
  NBA: "basketball/nba",
  NFL: "football/nfl",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",
  GOLF: "golf/pga",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sport: string }> }
) {
  const { sport } = await context.params;
  const key = sport.toUpperCase() as keyof typeof SPORTS;

  if (!SPORTS[key]) {
    return NextResponse.json({ error: `Unsupported sport: ${sport}` }, { status: 400 });
  }

  // Convert to US‑Eastern date
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const date = eastern.toISOString().slice(0, 10);

  const url = `https://site.api.espn.com/apis/v2/sports/${SPORTS[key]}/scoreboard?dates=${date}&limit=300&useMap=true`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    // Fallback to yesterday if ESPN returns code 404 or no events
    if (data?.code === 404 || !data?.events?.length) {
      const yesterday = new Date(eastern);
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().slice(0, 10);
      const yUrl = `https://site.api.espn.com/apis/v2/sports/${SPORTS[key]}/scoreboard?dates=${yDate}&limit=300&useMap=true`;
      const yRes = await fetch(yUrl, { cache: "no-store" });
      const yData = await yRes.json();
      return NextResponse.json(yData);
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
