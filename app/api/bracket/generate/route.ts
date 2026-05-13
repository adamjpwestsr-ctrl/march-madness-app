import { generateBracketStructure } from '@/lib/bracket/generateBracketStructure';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*')
    .order('seed', { ascending: true });

const { data: teams, error } = await supabase
  .from("teams")
  .select("*")
  .order("seed", { ascending: true });

if (error || !teams) {
  return Response.json({ error: "Failed to load teams" }, { status: 500 });
}

const bracket = generateBracketStructure(teams);
return Response.json(bracket);
}
