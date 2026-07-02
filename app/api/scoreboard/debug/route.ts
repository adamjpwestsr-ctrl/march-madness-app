import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/scoreboard/all`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch /api/scoreboard/all" }, { status: 500 });
  }

  const data = await res.json();
  const events = data?.events || [];

  // Group by league slug/name so we can see what’s actually coming through
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
}
