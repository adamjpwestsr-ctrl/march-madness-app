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
  const sport = params.sport.toUpperCase() as keyof typeof SPORTS;

  if (!SPORTS[sport]) {
    return NextResponse.json(
      { error: `Unsupported sport: ${sport}` },
      { status: 400 }
    );
  }

  // Use the reliable site/v2 endpoint
  const url = `https://site.api.espn.com/apis/site/v2/sports/${SPORTS[sport]}/scoreboard`;

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
