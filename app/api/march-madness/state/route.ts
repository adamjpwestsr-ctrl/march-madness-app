import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import {
  MarchMadnessState,
  BracketSummary,
  TournamentGame,
  TournamentTeam,
  LeaderboardRow,
  MulliganSummary,
  LiveGameSummary,
} from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  // -----------------------------
  // 1️⃣ FETCH BRACKETS + SUBMISSION STATUS
  // -----------------------------
  const { data: bracketsData, error: bracketError } = await supabase
    .from('brackets')
    .select('*')
    .eq('sport', 'ncaab');

  if (bracketError) {
    return NextResponse.json({ error: bracketError.message }, { status: 400 });
  }

  const { data: submissionsData } = await supabase
    .from('bracket_submissions')
    .select('bracket_id');

  const submittedSet = new Set(submissionsData?.map((s) => s.bracket_id) ?? []);

  const brackets: BracketSummary[] =
    bracketsData?.map((b) => ({
      bracket_id: b.bracket_id,
      bracket_name: b.bracket_name,
      icon: b.icon,
      created_at: b.created_at,
      tiebreaker_score: b.tiebreaker_score,
      mulligans_remaining: b.mulligans_remaining,
      submitted: submittedSet.has(b.bracket_id),
    })) ?? [];

  // -----------------------------
  // 2️⃣ FETCH ALL GAMES (JOIN TEAMS)
  // -----------------------------
  const { data: gamesData, error: gamesError } = await supabase
    .from('tournament_games')
    .select(`
      id,
      round,
      game_number,
      region,
      home_score,
      away_score,
      winner,
      status,
      is_placeholder,
      completed,
      team1:team1_id (
        id,
        team_name,
        seed,
        region
      ),
      team2:team2_id (
        id,
        team_name,
        seed,
        region
      )
    `)
    .order('round', { ascending: true })
    .order('game_number', { ascending: true });

  if (gamesError) {
    return NextResponse.json({ error: gamesError.message }, { status: 400 });
  }

  // -----------------------------
  // ⭐ NORMALIZE JOINED DATA BACK INTO TournamentGame SHAPE
  // -----------------------------
  function normalizeGame(g: any): TournamentGame {
    return {
      id: g.id,
      round: g.round,
      game_number: g.game_number,
      region: g.region,
      winner: g.winner,

      // Convert joined team objects back into IDs
      team1_id: g.team1?.id ?? null,
      team2_id: g.team2?.id ?? null,

      // Seeds (optional)
      seed1: g.team1?.seed ?? null,
      seed2: g.team2?.seed ?? null,

      // Scores
      home_score: g.home_score ?? 0,
      away_score: g.away_score ?? 0,

      // Required fields your type expects but joined data does not provide
      round_id: null,
      winner_to_game_id: null,
      is_placeholder: g.is_placeholder ?? false,
      completed: g.completed ?? false,
      status: g.status ?? 'pre',
    };
  }

  // -----------------------------
  // 3️⃣ OPENING ROUND
  // -----------------------------
  const openingRoundGames: TournamentGame[] =
    (gamesData ?? [])
      .filter((g) => g.round === 1)
      .map(normalizeGame);

  // -----------------------------
  // 4️⃣ GROUP REGIONAL GAMES BY REGION
  // -----------------------------
  const regionalGamesByRegion: Record<string, TournamentGame[]> = {
    East: [],
    West: [],
    South: [],
    Midwest: [],
  };

  (gamesData ?? [])
    .filter((g) => (g.round ?? 0) >= 2)
    .forEach((g, i) => {
      const region =
        g.region && typeof g.region === 'string'
          ? g.region.trim()
          : null;

      if (region && regionalGamesByRegion[region]) {
        regionalGamesByRegion[region].push(normalizeGame(g));
      } else {
        // fallback: evenly distribute if region missing
        const regionKeys = Object.keys(regionalGamesByRegion);
        regionalGamesByRegion[regionKeys[i % 4]].push(normalizeGame(g));
      }
    });

  // Ensure all regions exist
  ['East', 'West', 'South', 'Midwest'].forEach((r) => {
    if (!regionalGamesByRegion[r]) regionalGamesByRegion[r] = [];
  });

  // -----------------------------
  // 5️⃣ FETCH TEAMS
  // -----------------------------
  const { data: teamsData, error: teamsError } = await supabase
    .from('v_tournament_teams')
    .select('*');

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 400 });
  }

  const teams: TournamentTeam[] = (teamsData ?? []) as TournamentTeam[];

  // -----------------------------
  // 6️⃣ FETCH LEADERBOARD
  // -----------------------------
  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('*');

  if (leaderboardError) {
    return NextResponse.json({ error: leaderboardError.message }, { status: 400 });
  }

  const leaderboard: LeaderboardRow[] =
    leaderboardData?.map((row) => ({
      bracket_id: row.bracket_id,
      bracket_name:
        brackets.find((b) => b.bracket_id === row.bracket_id)?.bracket_name ??
        'Unknown',
      icon:
        brackets.find((b) => b.bracket_id === row.bracket_id)?.icon ?? null,
      earned_points: Number(row.earned_points ?? 0),
      possible_points: Number(row.possible_points ?? 0),
      max_possible_score: Number(row.max_possible_score ?? 0),
      mulligans_used: Number(row.mulligans_used ?? 0),
      email: row.email ?? null,
      has_paid: row.has_paid ?? false,
      is_active: row.is_active ?? false,
    })) ?? [];

  // -----------------------------
  // 7️⃣ FETCH MULLIGANS
  // -----------------------------
  const { data: mulligansData, error: mulliganError } = await supabase
    .from('bracket_mulligans')
    .select('*');

  if (mulliganError) {
    return NextResponse.json({ error: mulliganError.message }, { status: 400 });
  }

  const mulligans: MulliganSummary[] = (mulligansData ?? []) as MulliganSummary[];

  // -----------------------------
  // 8️⃣ LIVE SUMMARY (placeholder)
  // -----------------------------
  const liveSummary: LiveGameSummary[] = [];

  // -----------------------------
  // 9️⃣ LOCK STATE
  // -----------------------------
  const lockState = {
    bracketsOpen: true,
    openingRoundComplete: openingRoundGames.every((g) => !!g.winner),
  };

  // -----------------------------
  // 🔟 FINAL PAYLOAD
  // -----------------------------
  const state: MarchMadnessState = {
    brackets,
    openingRoundGames,
    regionalGames: regionalGamesByRegion,
    teams,
    leaderboard,
    mulligans,
    lockState,
    liveSummary,
  };

  return NextResponse.json(state);
}
