import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";

type EspnScoreboard = {
  events: {
    id: string;
    date: string;
    week?: { number: number };
    competitions: {
      id: string;
      date: string;
      competitors: {
        homeAway: "home" | "away";
        team: {
          id: string;
          displayName: string;
          abbreviation: string;
          logo?: string;
        };
        score?: string;
      }[];
      status: {
        type: {
          name: string;
          state: string;
          completed: boolean;
          detail: string;
          shortDetail: string;
        };
      };
    }[];
  }[];
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const weekParam = url.searchParams.get("week");
  const week = weekParam ? parseInt(weekParam, 10) : undefined;

  if (!week || Number.isNaN(week)) {
    return NextResponse.json(
      { error: "Missing or invalid ?week= query parameter" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fetch ESPN scoreboard for this week, regular season (seasontype=2)
  const espnRes = await fetch(
    `${ESPN_SCOREBOARD_URL}?week=${week}&seasontype=2`,
    {
      headers: {
        // ESPN doesn’t require auth for this endpoint
        "User-Agent": "BracketBoss-NCAAF/1.0",
      },
    }
  );

  if (!espnRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch ESPN scoreboard", status: espnRes.status },
      { status: 502 }
    );
  }

  const data = (await espnRes.json()) as EspnScoreboard;

  const gamesToUpsert = data.events.flatMap((event) => {
    const competition = event.competitions[0];
    if (!competition) return [];

    const home = competition.competitors.find(
      (c) => c.homeAway === "home"
    );
    const away = competition.competitors.find(
      (c) => c.homeAway === "away"
    );

    if (!home || !away) return [];

    const homeScore = home.score ? parseInt(home.score, 10) : null;
    const awayScore = away.score ? parseInt(away.score, 10) : null;

    const seasonYear = new Date(competition.date).getUTCFullYear();

    return [
      {
        season_year: seasonYear,
        week,
        game_id: event.id, // ESPN event id
        home_team_id: home.team.id, // must match ncaaf_teams.id
        away_team_id: away.team.id,
        home_team_score: homeScore,
        away_team_score: awayScore,
        start_time: competition.date, // ISO timestamp
        conference: null, // can be enriched later
        is_top25: null, // can be enriched later
        home_rank: null,
        away_rank: null,
      },
    ];
  });

  if (gamesToUpsert.length === 0) {
    return NextResponse.json(
      { message: "No games found for this week", week },
      { status: 200 }
    );
  }

  const { error } = await supabase
    .from("ncaaf_games")
    .upsert(gamesToUpsert, {
      onConflict: "game_id",
    });

  if (error) {
    return NextResponse.json(
      { error: "Failed to upsert games", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Scoreboard synced",
    week,
    count: gamesToUpsert.length,
  });
}
