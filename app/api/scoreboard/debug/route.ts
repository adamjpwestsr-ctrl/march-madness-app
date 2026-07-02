import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Build absolute URL for both local and deployed environments
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    // Ensure we’re calling the API route, not the app root
    const apiUrl = `${baseUrl}/api/scoreboard/all`;

    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${apiUrl}: ${res.status}`);
    }

    const data = await res.json();
    const events = data?.events || [];

    const summary: Record<string, number> = {};

    for (const game of events) {
      const comp = game.competitions?.[0];
      const slugCandidates = [
        game?.league?.slug,
        game?.league?.name,
        comp?.league?.slug,
        comp?.league?.name,
        comp?.sport?.slug,
        comp?.sport?.name,
      ].filter(Boolean);
      const key = slugCandidates[0] || "unknown";
      summary[key] = (summary[key] || 0) + 1;
    }

    return NextResponse.json({
      count: events.length,
      summary,
      sample: events.slice(0, 5),
    });
  } catch (err: any) {
    console.error("DEBUG ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
