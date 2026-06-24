import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("GOLF scoreboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch golf scores" },
      { status: 500 }
    );
  }
}
