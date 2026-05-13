import { supabase } from "@/lib/supabaseClient";
import { generateBracketStructure } from "@/lib/bracketUtils";
import { Team } from "@/lib/bracketTypes";

export async function GET() {
  console.log("✅ /api/bracket/generate route hit");

  try {
    const client = supabase!;
    if (!client) {
      console.error("❌ Supabase client is null");
      return Response.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    // ✅ FIXED: Removed invalid .order("seed")
    const { data: teams, error } = await client.from("teams").select("*");

    if (error) {
      console.error("❌ Supabase query error:", error);
      return Response.json({ error: "Failed to load teams from Supabase" }, { status: 500 });
    }

    if (!teams || teams.length === 0) {
      console.error("❌ No teams found in Supabase");
      return Response.json({ error: "No teams found in Supabase" }, { status: 500 });
    }

    console.log("✅ Team count:", teams.length);
    console.log("✅ First team sample:", teams[0]);

    const typedTeams = teams as Team[];

    let bracket;
    try {
      bracket = generateBracketStructure(typedTeams);
    } catch (genError) {
      console.error("❌ Error generating bracket structure:", genError);
      return Response.json({ error: "Bracket generation failed" }, { status: 500 });
    }

    console.log("✅ Bracket generation successful");
    return Response.json(bracket);
  } catch (outerError) {
    console.error("❌ Unexpected error in /api/bracket/generate:", outerError);
    return Response.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
