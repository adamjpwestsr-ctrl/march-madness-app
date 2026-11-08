import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const teams = body.teams;

    if (!teams || !Array.isArray(teams)) {
      return NextResponse.json(
        { error: "Invalid payload: 'teams' must be an array." },
        { status: 400 }
      );
    }

    // Basic validation
    if (teams.length !== 88) {
      return NextResponse.json(
        { error: `You must submit exactly 88 teams. Received ${teams.length}.` },
        { status: 400 }
      );
    }

    // Validate each team entry
    for (const t of teams) {
      if (
        !t.base_team_id ||
        !t.team_name ||
        !t.region ||
        !t.seed ||
        !t.record
      ) {
        return NextResponse.json(
          {
            error:
              "Each team must include base_team_id, team_name, region, seed, and record.",
          },
          { status: 400 }
        );
      }

      if (t.seed < 1 || t.seed > 22) {
        return NextResponse.json(
          { error: `Invalid seed for ${t.team_name}. Seed must be 1–22.` },
          { status: 400 }
        );
      }
    }

    // Clear existing tournament teams
    const { error: clearErr } = await supabase
      .from("tournament_teams")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

    if (clearErr) {
      console.error("Failed to clear tournament_teams:", clearErr);
      return NextResponse.json(
        { error: "Failed to clear existing tournament teams." },
        { status: 500 }
      );
    }

    // Insert new teams
    const { error: insertErr } = await supabase
      .from("tournament_teams")
      .insert(
        teams.map((t: any) => ({
          id: crypto.randomUUID(),
          team_name: t.team_name,
          region: t.region,
          seed: t.seed,
          true_seed: t.true_seed ?? null,
          record: t.record,
        }))
      );

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert tournament teams." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tournament teams saved successfully.",
      count: teams.length,
    });
  } catch (err: any) {
    console.error("select-teams route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
