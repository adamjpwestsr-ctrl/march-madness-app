import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return;
    const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  if (!supabase) return;
    const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  // This function will be passed into PlayoffClient
  async function onSave(bracket: any) {
    "use server";

    const supabase = await createClient();


        param($match)

        $indent = $match.Groups[1].Value
        $awaitPart = $match.Groups[2].Value

        # Look backwards to see if null guard already exists
        $before = $content.Substring(0, $match.Index)
        $lines = $before -split "`n"
        $lastNonEmpty = ($lines | Where-Object { import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return;
    const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  if (!supabase) return;
    const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  // This function will be passed into PlayoffClient
  async function onSave(bracket: any) {
    "use server";

    const supabase = await createClient();


        param($match)

        $indent = $match.Groups[1].Value
        $awaitPart = $match.Groups[2].Value

        # Look backwards to see if null guard already exists
        $before = $content.Substring(0, $match.Index)
        $lines = $before -split "`n"
        $lastNonEmpty = ($lines | Where-Object { import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return;
    const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  if (!supabase) return;
    const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  // This function will be passed into PlayoffClient
  async function onSave(bracket: any) {
    "use server";

    const supabase = await createClient();


        param($match)

        $indent = $match.Groups[1].Value
        $awaitPart = $match.Groups[2].Value

        # Look backwards to see if null guard already exists
        $before = $content.Substring(0, $match.Index)
        $lines = $before -split "`n"
        $lastNonEmpty = ($lines | Where-Object { import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";
import PlayoffLeaderboard from "./PlayoffLeaderboard";

export default async function PlayoffPage() {
  const supabase = await createClient();

  // Load teams
  if (!supabase) return;
    const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load saved playoff bracket
  if (!supabase) return;
    const { data: bracketRow } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024)
    .single();

  const initialBracket = bracketRow?.bracket || {};

  // This function will be passed into PlayoffClient
  async function onSave(bracket: any) {
    "use server";

    const supabase = await createClient();

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
.Trim() -ne "" } | Select-Object -Last 1)

        if ($lastNonEmpty -match "if\s*\(!supabase\)") {
            return $match.Value
        }

        return "$indent" + "if (!supabase) return;" + "`n" + $match.Value
    "playoff_brackets").upsert({
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

.Trim() -ne "" } | Select-Object -Last 1)

        if ($lastNonEmpty -match "if\s*\(!supabase\)") {
            return $match.Value
        }

        # Insert null guard above the call
        return "$indent" + "if (!supabase) return;" + "`n" + $match.Value
    "playoff_brackets").upsert({
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
.Trim() -ne "" } | Select-Object -Last 1)

        if ($lastNonEmpty -match "if\s*\(!supabase\)") {
            return $match.Value
        }

        return "$indent" + "if (!supabase) return;" + "`n" + $match.Value
    "playoff_brackets").upsert({
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


