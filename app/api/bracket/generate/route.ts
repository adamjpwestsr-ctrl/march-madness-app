import { supabase } from "@/lib/supabaseClient";
import { generateBracketStructure } from "@/lib/bracketUtils";
import { Team } from "@/lib/bracketTypes";

export async function GET() {
  const client = supabase!; // keep your existing fix

  // Load teams with full data (including conference + record)
  const { data: teams, error } = await client
    .from("teams")
    .select("*")
    .order("seed", { ascending: true });

  if (error || !teams) {
    console.error("Error loading teams:", error);
    return Response.json({ error: "Failed to load teams" }, { status: 500 });
  }

  // Ensure correct typing
  const typedTeams = teams as Team[];

  // Generate full bracket structure
  const bracket = generateBracketStructure(typedTeams);

  return Response.json(bracket);
}
