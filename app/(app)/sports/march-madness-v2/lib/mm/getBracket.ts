import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// --- FIX: Add proper region typing ---
type RegionKey = "east" | "west" | "south" | "midwest";

type RegionRounds = {
  round64: any[];
  round32: any[];
  sweet16: any[];
  elite8: any[];
};

/**
 * Loads the full March Madness bracket structure from Supabase.
 * Returns a fully formatted bracket object ready for useBracketState.
 */
export async function getBracket(seasonYear: number) {
  const supabase = await createSupabaseServerClient();

  // Load teams
  const { data: teams, error: teamsError } = await supabase
    .from("mm_teams")
    .select("*")
    .eq("season_year", seasonYear);

  if (teamsError || !teams) {
    throw new Error("Failed to load teams");
  }

  const teamsById: Record<string, any> = {};
  teams.forEach((t) => (teamsById[t.id] = t));

  // Load games
  const { data: games, error: gamesError } = await supabase
    .from("mm_games")
    .select("*")
    .eq("season_year", seasonYear)
    .order("round", { ascending: true });

  if (gamesError || !games) {
    throw new Error("Failed to load games");
  }

  // Helper to map game rows into UI-ready objects
  const mapGame = (g: any) => ({
    id: g.id,
    round: g.round,
    region: g.region,
    home: teamsById[g.home_team_id],
    away: teamsById[g.away_team_id],
    selectedTeamId: null,
    selectedTeamName: null,
  });

  // --- FIX: Typed regions object ---
  const regions: Record<RegionKey, RegionRounds> = {
    east: { round64: [], round32: [], sweet16: [], elite8: [] },
    west: { round64: [], round32: [], sweet16: [], elite8: [] },
    south: { round64: [], round32: [], sweet16: [], elite8: [] },
    midwest: { round64: [], round32: [], sweet16: [], elite8: [] },
  };

  const finalFour: any[] = [];
  let championship: any = null;

  games.forEach((g) => {
    const mapped = mapGame(g);

    // --- FIX: Ensure region key is typed ---
    const regionKey = g.region as RegionKey;

    switch (g.round) {
      case 64:
        regions[regionKey].round64.push(mapped);
        break;
      case 32:
        regions[regionKey].round32.push(mapped);
        break;
      case 16:
        regions[regionKey].sweet16.push(mapped);
        break;
      case 8:
        regions[regionKey].elite8.push(mapped);
        break;
      case 4:
        finalFour.push(mapped);
        break;
      case 2:
        championship = mapped;
        break;
    }
  });

  return {
    seasonYear,
    regions,
    finalFour,
    championship,
  };
}
