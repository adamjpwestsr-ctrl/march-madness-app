"use server";

import { supabaseServerClient } from "../../../lib/supabaseServerClient";

const REGIONS = ["East", "West", "South", "Midwest"] as const;
type Region = (typeof REGIONS)[number];

// ------------------------------------------------------------
// LOAD ALL TEAMS (for dropdowns)
// ------------------------------------------------------------
export async function loadAllTeams() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("teams")
    .select("id, team_name, logo_url, conference")
    .order("team_name", { ascending: true });

  if (error || !data) return [];

  return data.map((t) => ({
    id: t.id,
    name: t.team_name,
    logo: t.logo_url,
    conference: t.conference,
  }));
}

// ------------------------------------------------------------
// OPENING ROUND (ROUND 0)
// ------------------------------------------------------------
export async function loadOpeningRoundGames() {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from("tournament_games")
    .select("id, game_number, team1_id, team2_id")
    .eq("round", 0)
    .order("game_number", { ascending: true });

  return data || [];
}

export async function saveOpeningRoundGames(
  games: { team1_id: number | null; team2_id: number | null }[]
) {
  const supabase = supabaseServerClient();

  // Clear existing Opening Round
  await supabase.from("tournament_games").delete().eq("round", 0);

  const rows = games.map((g, idx) => ({
    round: 0,
    region: "Opening Round",
    game_number: idx + 1,
    team1_id: g.team1_id,
    team2_id: g.team2_id,
    winner: null,
    winner_to_game_id: null,
  }));

  const { error } = await supabase.from("tournament_games").insert(rows);
  if (error) throw new Error("Failed to save Opening Round games.");
}

// ------------------------------------------------------------
// ROUND OF 64 (ROUND 1)
// ------------------------------------------------------------
export async function loadRoundOf64Games(region: Region) {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from("tournament_games")
    .select("id, game_number, team1_id, team2_id, team1, team2")
    .eq("round", 1)
    .eq("region", region)
    .order("game_number", { ascending: true });

  return data || [];
}

export async function saveRoundOf64Games(
  region: Region,
  games: { team1: string; team2: string }[]
) {
  const supabase = supabaseServerClient();

  // Clear existing region games
  await supabase
    .from("tournament_games")
    .delete()
    .eq("round", 1)
    .eq("region", region);

  const normalize = (val: string | null) => {
    if (!val) return { team_id: null, text: null };

    // Opening Round Winner (OR-#)
    if (val.startsWith("OR-")) {
      return { team_id: null, text: val };
    }

    // Regular team ID
    return { team_id: Number(val), text: null };
  };

  const rows = games.map((g, idx) => {
    const t1 = normalize(g.team1);
    const t2 = normalize(g.team2);

    return {
      round: 1,
      region,
      game_number: idx + 1,
      team1_id: t1.team_id,
      team2_id: t2.team_id,
      team1: t1.text, // OR-# stored here
      team2: t2.text, // OR-# stored here
      winner: null,
      winner_to_game_id: null,
    };
  });

  const { error } = await supabase.from("tournament_games").insert(rows);
  if (error) throw new Error("Failed to save Round of 64 games.");
}

// ------------------------------------------------------------
// GENERATE REMAINING ROUNDS (2–6)
// ------------------------------------------------------------
export async function generateRemainingRounds() {
  const supabase = supabaseServerClient();

  // Remove previously generated rounds
  await supabase.from("tournament_games").delete().gte("round", 2);

  // Load Round of 64
  const { data: r64 } = await supabase
    .from("tournament_games")
    .select("id, region, game_number")
    .eq("round", 1);

  if (!r64) return { message: "No Round of 64 games found." };

  // Organize by region
  const byRegion: Record<Region, { id: number; game_number: number }[]> = {
    East: [],
    West: [],
    South: [],
    Midwest: [],
  };

  for (const g of r64) {
    if (REGIONS.includes(g.region as Region)) {
      byRegion[g.region as Region].push({
        id: g.id,
        game_number: g.game_number,
      });
    }
  }

  // Sort each region
  REGIONS.forEach((r) =>
    byRegion[r].sort((a, b) => a.game_number - b.game_number)
  );

  const inserts: any[] = [];

  // Build rounds 2–4 per region
  for (const region of REGIONS) {
    const games = byRegion[region];
    if (games.length !== 8) continue;

    // Round 2 (Round of 32)
    inserts.push(
      { round: 2, region, game_number: 1, team1_id: null, team2_id: null },
      { round: 2, region, game_number: 2, team1_id: null, team2_id: null },
      { round: 2, region, game_number: 3, team1_id: null, team2_id: null },
      { round: 2, region, game_number: 4, team1_id: null, team2_id: null }
    );

    // Round 3 (Sweet 16)
    inserts.push(
      { round: 3, region, game_number: 1, team1_id: null, team2_id: null },
      { round: 3, region, game_number: 2, team1_id: null, team2_id: null }
    );

    // Round 4 (Elite 8)
    inserts.push({
      round: 4,
      region,
      game_number: 1,
      team1_id: null,
      team2_id: null,
    });
  }

  // Final Four (Round 5)
  inserts.push(
    {
      round: 5,
      region: "Final Four",
      game_number: 1,
      team1_id: null,
      team2_id: null,
    },
    {
      round: 5,
      region: "Final Four",
      game_number: 2,
      team1_id: null,
      team2_id: null,
    }
  );

  // Championship (Round 6)
  inserts.push({
    round: 6,
    region: "Championship",
    game_number: 1,
    team1_id: null,
    team2_id: null,
  });

  const { error } = await supabase.from("tournament_games").insert(inserts);
  if (error) throw new Error("Failed to generate remaining rounds.");

  return { message: "Remaining rounds generated successfully." };
}

// ------------------------------------------------------------
// LEADERBOARD SUPPORT
// ------------------------------------------------------------
export async function getLeaderboardScores() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("leaderboard_with_rank_change")
    .select("bracket_id, total_points, user_id, username")
    .order("total_points", { ascending: false });

  if (error || !data) return [];

  return data;
}

// ------------------------------------------------------------
// LOCK TIME + PUBLISH
// ------------------------------------------------------------
export async function updateLockTime(lockTime: string) {
  const supabase = supabaseServerClient();

  await supabase
    .from("tournament_settings")
    .update({ lock_time: lockTime })
    .neq("id", "");
}

export async function publishTournament() {
  const supabase = supabaseServerClient();

  const { data: games } = await supabase
    .from("tournament_games")
    .select("id")
    .limit(1);

  if (!games || games.length === 0)
    return { message: "Cannot publish — no games exist." };

  const { data: settings } = await supabase
    .from("tournament_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) return { message: "Tournament settings not found." };
  if (!settings.lock_time)
    return { message: "Cannot publish — lock time is not set." };

  const now = new Date();
  const lock = new Date(settings.lock_time);

  if (lock <= now)
    return { message: "Cannot publish — lock time must be in the future." };

  await supabase
    .from("tournament_settings")
    .update({
      is_published: true,
      published_at: now.toISOString(),
    })
    .neq("id", "");

  return { message: "Tournament published successfully!" };
}

