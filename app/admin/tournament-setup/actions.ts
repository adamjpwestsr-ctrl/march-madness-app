// app/admin/tournament-setup/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const REGIONS = ["East", "West", "South", "Midwest"] as const;
type Region = (typeof REGIONS)[number];

type RegionTeam = {
  seed: number;
  team: string;
  record?: string;
  conference?: string;
  bid_type?: "AQ" | "AT_LARGE" | "";
  opening_round?: boolean;
  advances_to_game?: number | null;
};

export async function saveRegionTeams(region: Region, teams: RegionTeam[]) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("tournament_teams").delete().eq("region", region);

  const rows = teams.map((t) => ({
    region,
    seed: t.seed,
    team: t.team,
    bid_type: t.bid_type ?? null,
    opening_round: t.opening_round ?? false,
    advances_to_game: t.advances_to_game ?? null,
    record: t.record ?? null,
    conference: t.conference ?? null,
  }));

  const { error } = await supabase.from("tournament_teams").insert(rows);
  if (error) throw new Error(error.message);
}

export async function clearRegion(region: Region) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("tournament_teams").delete().eq("region", region);
}

export async function loadRegionTeams(region: Region) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tournament_teams")
    .select("*")
    .eq("region", region)
    .order("seed");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function generateBracket() {
  const supabase = await createSupabaseServerClient();

  const { data: teams, error: teamErr } = await supabase
    .from("tournament_teams")
    .select("*");

  if (teamErr) return { message: "Error loading teams." };

  for (const region of REGIONS) {
    const regionTeams = teams.filter((t: any) => t.region === region);
    if (regionTeams.length !== 16) {
      return { message: `Region ${region} must have exactly 16 teams.` };
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

  const openingRoundTeams = teams.filter((t: any) => t.opening_round === true);

  if (openingRoundTeams.length !== 24) {
    return { message: "Exactly 24 teams must be marked as Opening Round." };
  }

  const groupedByAdvance: Record<number, any[]> = {};

  for (const t of openingRoundTeams) {
    if (!t.advances_to_game) {
      return {
        message: `Opening Round team ${t.team} is missing advances_to_game.`,
      };
    }
    if (!groupedByAdvance[t.advances_to_game]) {
      groupedByAdvance[t.advances_to_game] = [];
    }
    groupedByAdvance[t.advances_to_game].push(t);
  }

  for (const gameDest in groupedByAdvance) {
    if (groupedByAdvance[gameDest].length !== 2) {
      return {
        message: `Round of 64 game ${gameDest} must have exactly 2 Opening Round teams.`,
      };
    }
  }

  const openingRoundGameMap: Record<number, number> = {};

  for (const destGameId in groupedByAdvance) {
    const pair = groupedByAdvance[destGameId];

    addGame({
      round: 0,
      region: "Opening Round",
      team1: pair[0].team,
      seed1: pair[0].seed,
      team2: pair[1].team,
      seed2: pair[1].seed,
      source_game1: null,
      source_game2: null,
    });

    openingRoundGameMap[Number(destGameId)] = gameId - 1;
  }

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

      const isOpening1 = t1.opening_round === true;
      const isOpening2 = t2.opening_round === true;

      let team1 = t1.team;
      let team2 = t2.team;
      let seed1 = t1.seed;
      let seed2 = t2.seed;
      let source_game1: number | null = null;
      let source_game2: number | null = null;

      if (isOpening1) {
        const orGameId = openingRoundGameMap[t1.advances_to_game];
        team1 = `Winner of OR Game ${orGameId}`;
        seed1 = null;
        source_game1 = orGameId;
      }

      if (isOpening2) {
        const orGameId = openingRoundGameMap[t2.advances_to_game];
        team2 = `Winner of OR Game ${orGameId}`;
        seed2 = null;
        source_game2 = orGameId;
      }

      addGame({
        round: 1,
        region,
        team1,
        seed1,
        team2,
        seed2,
        source_game1,
        source_game2,
      });
    }
  }

  for (const region of REGIONS) {
    const r64 = gameRows.filter((g) => g.round === 1 && g.region === region);

    for (let i = 0; i < 4; i++) {
      const g1 = r64[i * 2];
      const g2 = r64[i * 2 + 1];

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

  for (const region of REGIONS) {
    const r32 = gameRows.filter((g) => g.round === 2 && g.region === region);

    for (let i = 0; i < 2; i++) {
      const g1 = r32[i * 2];
      const g2 = r32[i * 2 + 1];

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

  for (const region of REGIONS) {
    const r16 = gameRows.filter((g) => g.round === 3 && g.region === region);

    addGame({
      round: 4,
      region,
      team1: null,
      seed1: null,
      team2: null,
      seed2: null,
      source_game1: r16[0].game_id,
      source_game2: r16[1].game_id,
    });
  }

  const elite8 = gameRows.filter((g) => g.round === 4);

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

export async function advanceWinner(gameId: number, winnerTeam: string) {
  const supabase = await createSupabaseServerClient();

  const { data: game, error: gameErr } = await supabase
    .from("games")
    .update({ winner: winnerTeam })
    .eq("game_id", gameId)
    .select("*")
    .single();

  if (gameErr || !game) {
    throw new Error("Failed to update winner for game.");
  }

  const { data: nextGames, error: nextErr } = await supabase
    .from("games")
    .select("*")
    .or(`source_game1.eq.${gameId},source_game2.eq.${gameId}`);

  if (nextErr) {
    throw new Error("Failed to load downstream games.");
  }

  if (!nextGames || nextGames.length === 0) {
    return { message: "Winner updated; no downstream games." };
  }

  const updates = nextGames.map((g: any) => {
    const update: any = {};
    if (g.source_game1 === gameId) {
      update.team1 = winnerTeam;
    }
    if (g.source_game2 === gameId) {
      update.team2 = winnerTeam;
    }
    return supabase.from("games").update(update).eq("game_id", g.game_id);
  });

  await Promise.all(updates);

  return { message: "Winner advanced successfully." };
}

export async function updateBracketScores() {
  const supabase = await createSupabaseServerClient();

  const { data: scores, error } = await supabase
    .from("bracket_scores")
    .select("bracket_id, total_points");

  if (error) throw new Error("Failed to load bracket scores.");

  return { message: "Scores refreshed successfully.", count: scores.length };
}

export async function getLeaderboardScores() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("bracket_scores")
    .select("bracket_id, total_points")
    .order("total_points", { ascending: false });

  if (error) {
    console.error("Error loading leaderboard scores:", error);
    throw new Error("Failed to load leaderboard scores.");
  }

  return data ?? [];
}
