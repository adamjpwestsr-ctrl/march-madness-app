// app/admin/tournament-setup/actions.ts
"use server";

import { createClient } from "../../../lib/supabaseServerClient";

const REGIONS = ["East", "West", "South", "Midwest"] as const;
type Region = (typeof REGIONS)[number];

type RegionTeam = {
  seed: number;
  team: string;
};

export async function saveRegionTeams(region: Region, teams: RegionTeam[]) {
  const supabase = createClient();

  await supabase.from("tournament_teams").delete().eq("region", region);

  const rows = teams.map((t) => ({
    region,
    seed: t.seed,
    team: t.team,
  }));

  await supabase.from("tournament_teams").insert(rows);
}

export async function clearRegion(region: Region) {
  const supabase = createClient();
  await supabase.from("tournament_teams").delete().eq("region", region);
}

export async function loadRegionTeams(region: Region) {
  const supabase = createClient();

  const { data } = await supabase
    .from("tournament_teams")
    .select("*")
    .eq("region", region)
    .order("seed");

  return data ?? [];
}

export async function generateBracket() {
  const supabase = createClient();

  const { data: teams, error: teamErr } = await supabase
    .from("tournament_teams")
    .select("*");

  if (teamErr) return { message: "Error loading teams." };

  for (const region of REGIONS) {
    const regionTeams = teams.filter((t: any) => t.region === region);
    if (regionTeams.length !== 16) {
      return {
        message: `Region ${region} must have exactly 16 teams.`,
      };
    }
  }

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
  }: {
    round: number;
    region: string;
    team1: string | null;
    seed1: number | null;
    team2: string | null;
    seed2: number | null;
    source_game1: number | null;
    source_game2: number | null;
  }) => {
    gameRows.push({
      game_id: gameId++,
      round,
      region,
      team1,
      seed1,
      team2,
      seed2,
      source_game1,
      source_game2,
    });
  };

  // ROUND 1 — 32 games
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

  // ROUND 2 — 16 games (games 33–48)
  const round2Start = 1;
  for (let i = 0; i < 16; i++) {
    addGame({
      round: 2,
      region: gameRows[round2Start - 1 + i].region,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      source_game1: round2Start + i * 2,
      source_game2: round2Start + i * 2 + 1,
    });
  }

  // SWEET 16 — 8 games (49–56)
  const round3Start = 33;
  for (let i = 0; i < 8; i++) {
    addGame({
      round: 3,
      region: gameRows[round3Start - 1 + i].region,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      source_game1: round3Start + i * 2,
      source_game2: round3Start + i * 2 + 1,
    });
  }

  // ELITE 8 — 4 games (57–60)
  const round4Start = 49;
  for (let i = 0; i < 4; i++) {
    addGame({
      round: 4,
      region: REGIONS[i],
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      source_game1: round4Start + i * 2,
      source_game2: round4Start + i * 2 + 1,
    });
  }

  // FINAL FOUR — 2 games (61–62)
  addGame({
    round: 5,
    region: "Final Four",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: 57,
    source_game2: 58,
  });

  addGame({
    round: 5,
    region: "Final Four",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: 59,
    source_game2: 60,
  });

  // CHAMPIONSHIP — 1 game (63)
  addGame({
    round: 6,
    region: "Championship",
    team1: null,
    seed1: null,
    team2: null,
    seed2: null,
    source_game1: 61,
    source_game2: 62,
  });

  await supabase.from("games").insert(gameRows);

  return { message: "Tournament bracket generated successfully!" };
}

export async function publishTournament() {
  const supabase = createClient();

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
  const supabase = createClient();

  await supabase
    .from("tournament_settings")
    .update({ lock_time: lockTime })
    .neq("id", "");
}
