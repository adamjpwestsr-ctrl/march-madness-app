// app/admin/tournament-setup/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const REGIONS = ["East", "West", "South", "Midwest"] as const;
type Region = (typeof REGIONS)[number];

type RegionTeam = {
  seed: number;
  team: string;
};

export async function saveRegionTeams(region: Region, teams: RegionTeam[]) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("tournament_teams").delete().eq("region", region);

  const rows = teams.map((t) => ({
    region,
    seed: t.seed,
    team: t.team,
  }));

  await supabase.from("tournament_teams").insert(rows);
}

export async function clearRegion(region: Region) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("tournament_teams").delete().eq("region", region);
}

export async function loadRegionTeams(region: Region) {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("tournament_teams")
    .select("*")
    .eq("region", region)
    .order("seed");

  return data ?? [];
}

//
// ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
// ⭐  FULLY CORRECTED ESPN‑STYLE BRACKET GENERATOR
// ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
//
export async function generateBracket() {
  const supabase = await createSupabaseServerClient();

  const { data: teams, error: teamErr } = await supabase
    .from("tournament_teams")
    .select("*");

  if (teamErr) return { message: "Error loading teams." };

  // Validate 16 teams per region
  for (const region of REGIONS) {
    const regionTeams = teams.filter((t: any) => t.region === region);
    if (regionTeams.length !== 16) {
      return { message: `Region ${region} must have exactly 16 teams.` };
    }
  }

  // Clear existing games
  await supabase.from("games").delete().neq("game_id", -1);

  let gameId = 1;
  const gameRows: any[] = [];

  const addGame = ({
    round,
    region,
    team1,
    seed1,
    team2,
    seed2,
    source_game1,
    source_game2,
  }: any) => {
    gameRows.push({
      game_id: gameId++,
      round,
      region,
      game_number: null,
      team1,
      seed1,
      team2,
      seed2,
      winner: null,
      source_game1,
      source_game2,
      final_score: null,
    });
  };

  // -----------------------------
  // ROUND OF 64 — 32 games
  // -----------------------------
  for (const region of REGIONS) {
    const regionTeams = teams
      .filter((t: any) => t.region === region)
      .sort((a: any, b: any) => a.seed - b.seed);

    const matchups: [number, number][] = [
      [1, 16],
      [8, 9],
      [5, 12],
      [4, 13],
      [6, 11],
      [3, 14],
      [7, 10],
      [2, 15],
    ];

    for (const [s1, s2] of matchups) {
      const t1 = regionTeams.find((t: any) => t.seed === s1);
      const t2 = regionTeams.find((t: any) => t.seed === s2);

      addGame({
        round: 1,
        region,
        team1: t1.team,
        seed1: t1.seed,
        team2: t2.team,
        seed2: t2.seed,
        source_game1: null,
        source_game2: null,
      });
    }
  }

  // -----------------------------
  // ROUND OF 32 — 16 games (4 per region)
  // -----------------------------
  for (const region of REGIONS) {
    const regionRound1Games = gameRows.filter(
      (g) => g.round === 1 && g.region === region
    );

    for (let i = 0; i < 4; i++) {
      const g1 = regionRound1Games[i * 2];
      const g2 = regionRound1Games[i * 2 + 1];

      addGame({
        round: 2,
        region,
        team1: null,
        seed1: null,
        team2: null,
        seed2: null,
        source_game1: g1.game_id,
        source_game2: g2.game_id,
      });
    }
  }

  // -----------------------------
  // SWEET 16 — 8 games (2 per region)
  // -----------------------------
  for (const region of REGIONS) {
    const regionRound2Games = gameRows.filter(
      (g) => g.round === 2 && g.region === region
    );

    for (let i = 0; i < 2; i++) {
      const g1 = regionRound2Games[i * 2];
      const g2 = regionRound2Games[i * 2 + 1];

      addGame({
        round: 3,
        region,
        team1: null,
        seed1: null,
        team2: null,
        seed2: null,
        source_game1: g1.game_id,
        source_game2: g2.game_id,
      });
    }
  }

  // -----------------------------
  // ELITE 8 — 4 games (1 per region)
  // -----------------------------
  for (const region of REGIONS) {
    const regionRound3Games = gameRows.filter(
      (g) => g.round === 3 && g.region === region
    );

    addGame({
      round: 4,
      region,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      source_game1: regionRound3Games[0].game_id,
      source_game2: regionRound3Games[1].game_id,
    });
  }

  // -----------------------------
  // FINAL FOUR — 2 games
  // -----------------------------
  const elite8 = gameRows.filter((g) => g.round === 4);

  // East vs West
  addGame({
    round: 5,
    region: "Final Four",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: elite8[0].game_id,
    source_game2: elite8[1].game_id,
  });

  // South vs Midwest
  addGame({
    round: 5,
    region: "Final Four",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: elite8[2].game_id,
    source_game2: elite8[3].game_id,
  });

  // -----------------------------
  // CHAMPIONSHIP — 1 game
  // -----------------------------
  const finalFour = gameRows.filter((g) => g.round === 5);

  addGame({
    round: 6,
    region: "Championship",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: finalFour[0].game_id,
    source_game2: finalFour[1].game_id,
  });

  await supabase.from("games").insert(gameRows);

  return { message: "Tournament bracket generated successfully!" };
}

export async function publishTournament() {
  const supabase = await createSupabaseServerClient();

  const { data: games } = await supabase
    .from("games")
    .select("game_id")
    .limit(1);

  if (!games || games.length === 0) {
    return { message: "Cannot publish — no games exist." };
  }

  const { data: settings } = await supabase
    .from("tournament_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return { message: "Tournament settings not found." };
  }

  if (!settings.lock_time) {
    return { message: "Cannot publish — lock time is not set." };
  }

  const now = new Date();
  const lock = new Date(settings.lock_time);

  if (lock <= now) {
    return { message: "Cannot publish — lock time must be in the future." };
  }

  await supabase
    .from("tournament_settings")
    .update({
      is_published: true,
      published_at: now.toISOString(),
    })
    .neq("id", "");

  return { message: "Tournament published successfully!" };
}

export async function updateLockTime(lockTime: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("tournament_settings")
    .update({ lock_time: lockTime })
    .neq("id", "");
}
