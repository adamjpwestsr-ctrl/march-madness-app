import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return null;
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  if (!supabase) return null;
  const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  // Server action passed into PlayoffClient
  async function onSave(bracket: any) {
    "use server";

    const supabase = await createClient();
    if (!supabase) return;

    await supabase.from("playoff_brackets").upsert({
      season: 2024,
      bracket,
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-12 p-6">
      {/* Bracket UI */}
      <PlayoffClient
        teams={teams || []}
        initialBracket={initialBracket}
        onSave={onSave}
      />

      {/* Leaderboard UI */}
      <PlayoffLeaderboard />
    </div>
  );
}
