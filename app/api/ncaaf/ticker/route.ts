import { NextResponse } from "next/server";

export async async function GET() {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    const events = data?.events ?? [];

    const normalized = events.map((e: any) => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

      return {
        id: e.id,
        start: e.date,
        status: e.status?.type?.state ?? "scheduled",

        home_team: home?.team?.displayName,
        home_rank: home?.rank ?? null,
        home_score: home?.score ?? null,

        away_team: away?.team?.displayName,
        away_rank: away?.rank ?? null,
        away_score: away?.score ?? null,
      };
    });

    return NextResponse.json({ events: normalized });
  } catch (err) {
    console.error("NCAAF ticker error:", err);
    return NextResponse.json({ events: [] });
  }
}
