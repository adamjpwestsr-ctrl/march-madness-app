import { supabase } from "@/lib/supabaseClient";
import { generateBracketStructure } from "@/lib/bracketUtils";

export async function GET() {
  const client = supabase!; // <-- fixes TS null warning

  const { data: teams, error } = await client
    .from("teams")
    .select("*")
    .order("seed", { ascending: true });

  if (error || !teams) {
    return Response.json({ error: "Failed to load teams" }, { status: 500 });
  }

  const bracket = generateBracketStructure(teams);
  return Response.json(bracket);
}
