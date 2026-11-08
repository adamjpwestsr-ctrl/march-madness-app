import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Load all tournament teams
    const { data: teams, error: teamsErr } = await supabase
      .from("tournament_teams")
      .select("*");

    if (teamsErr) {
      console.error("Failed to load tournament teams:", teamsErr);
      return NextResponse.json(
        { error: "Failed to load tournament teams." },
        { status: 500 }
      );
    }

    if (!teams || teams.length !== 88) {
      return NextResponse.json(
        {
          error: `Tournament must have exactly 88 teams. Found ${teams?.length ?? 0}.`,
        },
        { status: 400 }
      );
    }

    // 2. Group teams by region
    const regions = ["East", "West", "South", "Midwest"];
    const regionMap: Record<string, any[]> = {
      East: [],
      West: [],
      South: [],
      Midwest: [],
    };

    for (const t of teams) {
      if (!regions.includes(t.region)) {
        return NextResponse.json(
          { error: `Invalid region for team ${t.team_name}: ${t.region}` },
          { status: 400 }
        );
      }
      regionMap[t.region].push(t);
    }

    // 3. Validate each region has 22 seeds
    for (const region of regions) {
      if (regionMap[region].length !== 22) {
        return NextResponse.json(
          {
            error: `Region ${region} must have 22 teams. Found ${regionMap[region].length}.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Clear existing Round of 64 games (round = 1)
    const { error: clearErr } = await supabase
      .from("tournament_games")
      .delete()
      .eq("round", 1);

    if (clearErr) {
      console.error("Failed to clear Round of 64 games:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing Round of 64 games." },
        { status: 500 }
      );
    }

    // 5. Build Round of 64 games
    const round64Games: any[] = [];
    let gameNumber = 1;

    for (const region of regions) {
      const regionTeams = regionMap[region];

      // Seeds 1–16 go directly into Round of 64
      const directSeeds = regionTeams.filter((t) => t.seed >= 1 && t.seed <= 16);

      // Seeds 17–22 are opening-round winners → placeholders
      const openingSeeds = regionTeams.filter((t) => t.seed >= 17 && t.seed <= 22);

      // Matchups follow standard bracket logic:
      // 1 vs 16, 2 vs 15, 3 vs 14, ..., 8 vs 9
      const matchups = [
        [1, 16],
        [8, 9],
        [5, 12],
        [4, 13],
        [6, 11],
        [3, 14],
        [7, 10],
        [2, 15],
      ];

      for (const [seedA, seedB] of matchups) {
        const teamA = directSeeds.find((t) => t.seed === seedA);
        const teamB = directSeeds.find((t) => t.seed === seedB);

        round64Games.push({
          id: crypto.randomUUID(),
          game_number: gameNumber,
          round: 1,
          region,
          team1_id: teamA?.id ?? null,
          team2_id: teamB?.id ?? null,
          home_score: 0,
          away_score: 0,
          winner: null,
          status: "pre",
          is_placeholder: !teamA || !teamB,
          completed: false,
          winner_to_game_id: null, // will be wired in Round of 32 generator
          bracket_id: null,
        });

        gameNumber++;
      }
    }

    // 6. Insert Round of 64 games
    const { error: insertErr } = await supabase
      .from("tournament_games")
      .insert(round64Games);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert Round of 64 games." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Round of 64 generated successfully.",
      games_created: round64Games.length,
    });
  } catch (err: any) {
    console.error("round64 route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
