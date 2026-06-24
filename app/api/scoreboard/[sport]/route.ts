import { NextResponse } from "next/server";

const SPORTS = {
  NBA: "basketball/nba",
  NFL: "football/nfl",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
};

export async function GET(
  req: Request,
  { params }: { params: { sport: keyof typeof SPORTS } }
) {
  const sport = params.sport.toUpperCase() as keyof typeof SPORTS;
  const date = new Date().toISOString().slice(0, 10);
  const url = `https://site.api.espn.com/apis/v2/sports/${SPORTS[sport]}/scoreboard?dates=${date}&limit=300&useMap=true`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
