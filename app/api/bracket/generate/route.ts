import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateBracketStructure } from "@/lib/bracketUtils";

/**
 * POST /api/bracket/generate
 * Generates the full 75‑game bracket using:
 *  - admin‑provided true‑seed list (1–76)
 *  - v_tournament_teams metadata
 *  - pure generator (bracketUtils)
 *  - inserts into Supabase `games` table
 */
export async function POST() {
  const supabase = createClient();

  // ---------------------------------------------------------
  // 1. Load true‑seed list (admin input)
  // ---------------------------------------------------------
  const { data: seedRows, error: seedError } = await supabase
    .from("true_seed_list")
    .select("team_name")
    .order("true_seed", { ascending: true });

  if (seedError) {
    console.error("❌ Error loading true_seed_list:", seedError);
    return NextResponse.json(
      { error: "Failed to load true seed list" },
      { status: 500 }
    );
  }

  if (!seedRows || seedRows.length !== 76) {
    return NextResponse.json(
      {
        error: "true_seed_list must contain exactly 76 rows",
        count: seedRows?.length ?? 0,
      },
      { status: 400 }
    );
  }

  const orderedTeams = seedRows.map((r) => r.team_name);

  // ---------------------------------------------------------
  // 2. Load v_tournament_teams metadata
  // ---------------------------------------------------------
  const { data: teamData, error: teamError } = await supabase
    .from("v_tournament_teams")
    .select("*");

  if (teamError) {
    console.error("❌ Error loading v_tournament_teams:", teamError);
    return NextResponse.json(
      { error: "Failed to load tournament team metadata" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------
  // 3. Generate bracket structure (pure function)
  // ---------------------------------------------------------
  let bracket;
  try {
    bracket = generateBracketStructure(orderedTeams, teamData);
  } catch (genError: any) {
    console.error("❌ Error generating bracket structure:", genError);
    return NextResponse.json(
      { error: "Bracket generation failed", details: genError.message },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------
  // 4. Clear existing games table
  // ---------------------------------------------------------
  const { error: clearError } = await supabase.from("games").delete().neq("game_id", -1);

  if (clearError) {
    console.error("❌ Error clearing games table:", clearError);
    return NextResponse.json(
      { error: "Failed to clear games table" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------
  // 5. Insert new bracket rows
  // ---------------------------------------------------------
  const { error: insertError } = await supabase.from("games").insert(bracket);

  if (insertError) {
    console.error("❌ Error inserting bracket:", insertError);
    return NextResponse.json(
      { error: "Failed to insert bracket", details: insertError.message },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------
  // 6. Success
  // ---------------------------------------------------------
  return NextResponse.json({
    success: true,
    message: "Bracket generated successfully",
    gamesInserted: bracket.length,
  });
}
