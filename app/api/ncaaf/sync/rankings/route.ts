import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    const poll = data?.rankings?.find((r: any) => r.name === "AP Top 25");

    return NextResponse.json({
      success: true,
      rankings: poll?.ranks ?? [],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}
