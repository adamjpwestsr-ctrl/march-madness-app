import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  return (
    <div className="flex flex-col gap-12 p-6">
      {/* Bracket UI */}
      <PlayoffClient teams={teams || []} initialBracket={initialBracket} />

      {/* Leaderboard UI */}
      <PlayoffLeaderboard />
    </div>
  );
}
