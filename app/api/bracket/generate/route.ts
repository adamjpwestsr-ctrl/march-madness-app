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

  const bracket = generateBracketStructure(teams);
  return Response.json(bracket);
}
