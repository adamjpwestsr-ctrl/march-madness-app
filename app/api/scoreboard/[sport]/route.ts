import { NextRequest, NextResponse } from "next/server";

const SPORTS = {
  NBA: "basketball/nba",
  NFL: "football/nfl",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { sport: string } }
) {
  const sport = params.sport;
  const key = sport.toUpperCase() as keyof typeof SPORTS;

  if (!SPORTS[key]) {
    return NextResponse.json(
      { error: `Unsupported sport: ${sport}` },
      { status: 400 }
    );
  }

  let url: string;

  if (key === "MLB") {
    // Use the MLB-only endpoint you confirmed works
    url = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard";
  } else {
    const now = new Date();
    const eastern = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const date = eastern.toISOString().slice(0, 10);

    url = `https://site.api.espn.com/apis/v2/sports/${SPORTS[key]}/scoreboard?dates=${date}&limit=300&useMap=true`;
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
