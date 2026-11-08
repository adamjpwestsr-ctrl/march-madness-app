import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();
    const regions = ["East", "West", "South", "Midwest"];
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate tournament_teams
    const { data: teams, error: teamsErr } = await supabase
      .from("tournament_teams")
      .select("*");

    if (teamsErr) {
      return NextResponse.json(
        { error: "Failed to load tournament_teams." },
        { status: 500 }
      );
    }

    if (!teams || teams.length !== 88) {
      errors.push(`tournament_teams must have 88 teams. Found ${teams?.length ?? 0}.`);
    }

    // per‑region + seed checks
    const regionMap: Record<string, any[]> = {
      East: [],
      West: [],
      South: [],
      Midwest: [],
    };

    for (const t of teams) {
      if (!regions.includes(t.region)) {
        errors.push(`Team ${t.team_name} has invalid region: ${t.region}`);
        continue;
      }
      regionMap[t.region].push(t);

      if (t.seed < 1 || t.seed > 22) {
        errors.push(`Team ${t.team_name} has invalid seed: ${t.seed}`);
      }
    }

    for (const r of regions) {
      if (regionMap[r].length !== 22) {
        errors.push(`Region ${r} must have 22 teams. Found ${regionMap[r].length}.`);
      }

      const seenSeeds = new Set<number>();
      for (const t of regionMap[r]) {
        if (seenSeeds.has(t.seed)) {
          errors.push(`Duplicate seed ${t.seed} in region ${r}.`);
        }
        seenSeeds.add(t.seed);
      }
    }

    // 2. Validate opening‑round games (round 0)
    const { data: opening, error: openingErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 0);

    if (openingErr) {
      errors.push("Failed to load opening‑round games.");
    } else {
      if (!opening || opening.length !== 12) {
        errors.push(`Opening round must have 12 games. Found ${opening?.length ?? 0}.`);
      }
    }

    // 3. Validate Round of 64 (round 1)
    const { data: round64, error: r64Err } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 1);

    if (r64Err) {
      errors.push("Failed to load Round of 64 games.");
    } else {
      if (!round64 || round64.length !== 32) {
        errors.push(`Round of 64 must have 32 games. Found ${round64?.length ?? 0}.`);
      }
    }

    // 4. Validate Round of 32 (round 2)
    const { data: round32, error: r32Err } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 2);

    if (r32Err) {
      errors.push("Failed to load Round of 32 games.");
    } else {
      if (!round32 || round32.length !== 16) {
        errors.push(`Round of 32 must have 16 games. Found ${round32?.length ?? 0}.`);
      }
    }

    // 5. Validate Sweet 16 (round 3)
    const { data: sweet16, error: s16Err } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 3);

    if (s16Err) {
      errors.push("Failed to load Sweet 16 games.");
    } else {
      if (!sweet16 || sweet16.length !== 8) {
        errors.push(`Sweet 16 must have 8 games. Found ${sweet16?.length ?? 0}.`);
      }
    }

    // 6. Validate Elite 8 (round 4)
    const { data: elite8, error: e8Err } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 4);

    if (e8Err) {
      errors.push("Failed to load Elite 8 games.");
    } else {
      if (!elite8 || elite8.length !== 4) {
        errors.push(`Elite 8 must have 4 games. Found ${elite8?.length ?? 0}.`);
      }
    }

    // 7. Validate Final Four (round 5)
    const { data: finalFour, error: ffErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 5);

    if (ffErr) {
      errors.push("Failed to load Final Four games.");
    } else {
      if (!finalFour || finalFour.length !== 2) {
        errors.push(`Final Four must have 2 games. Found ${finalFour?.length ?? 0}.`);
      }
    }

    // 8. Validate Championship (round 6)
    const { data: champ, error: champErr } = await supabase
      .from("tournament_games")
      .select("*")
      .eq("round", 6);

    if (champErr) {
      errors.push("Failed to load Championship game.");
    } else {
      if (!champ || champ.length !== 1) {
        errors.push(`Championship must have 1 game. Found ${champ?.length ?? 0}.`);
      }
    }

    // 9. Basic chain sanity (winner_to_game_id presence)
    const chainRounds = [1, 2, 3, 4, 5]; // each should point to next round
    for (const r of chainRounds) {
      const { data: games, error: chainErr } = await supabase
        .from("tournament_games")
        .select("*")
        .eq("round", r);

      if (chainErr || !games) {
        errors.push(`Failed to load games for round ${r} during chain validation.`);
        continue;
      }

      for (const g of games) {
        if (!g.winner_to_game_id && r < 6) {
          warnings.push(
            `Game ${g.game_number} (round ${r}) has no winner_to_game_id wired.`
          );
        }
      }
    }

    const ok = errors.length === 0;

    return NextResponse.json({
      ok,
      errors,
      warnings,
      summary: ok
        ? "Tournament structure looks valid."
        : "Tournament has structural issues. See errors.",
    });
  } catch (err: any) {
    console.error("tournament validate route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
