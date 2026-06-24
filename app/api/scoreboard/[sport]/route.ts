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
    return NextResponse.json(
      { error: `Unsupported sport: ${sport}` },
      { status: 400 }
    );
  }

  // Golf uses a different structure — handle separately
  if (key === "GOLF") {
    const url =
      "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch golf scores" },
        { status: 500 }
      );
    }
  }

  // All other sports use the standard site/v2 endpoint
  const url = `https://site.api.espn.com/apis/site/v2/sports/${SPORTS[key]}/scoreboard`;

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
