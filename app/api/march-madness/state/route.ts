// app/api/march-madness/state/route.ts
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
  // 2️⃣ FETCH ALL GAMES
  // -----------------------------
  const { data: gamesData, error: gamesError } = await supabase
    .from('tournament_games')
    .select('*')
    .order('round', { ascending: true })
    .order('game_number', { ascending: true });

  if (gamesError) {
    return NextResponse.json({ error: gamesError.message }, { status: 400 });
  }

  // Opening Round = round 1 (76‑team format)
  const openingRoundGames: TournamentGame[] =
    (gamesData ?? []).filter((g) => g.round === 1) as TournamentGame[];

  // Regional games = rounds 2+
  const regionalGamesByRegion: Record<string, TournamentGame[]> = {};
  (gamesData ?? [])
    .filter((g) => (g.round ?? 0) >= 2)
    .forEach((g) => {
      const region = g.region ?? 'Unknown';
      if (!regionalGamesByRegion[region]) regionalGamesByRegion[region] = [];
      regionalGamesByRegion[region].push(g as TournamentGame);
    });

  // -----------------------------
  // 3️⃣ FETCH TEAMS
  // -----------------------------
  const { data: teamsData, error: teamsError } = await supabase
    .from('v_tournament_teams')
    .select('*');

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 400 });
  }

  const teams: TournamentTeam[] = (teamsData ?? []) as TournamentTeam[];

  // -----------------------------
  // 4️⃣ FETCH LEADERBOARD (new scoring engine)
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
  // 5️⃣ FETCH MULLIGANS
  // -----------------------------
  const { data: mulligansData, error: mulliganError } = await supabase
    .from('bracket_mulligans')
    .select('*');

  if (mulliganError) {
    return NextResponse.json({ error: mulliganError.message }, { status: 400 });
  }

  const mulligans: MulliganSummary[] = (mulligansData ?? []) as MulliganSummary[];

  // -----------------------------
  // 6️⃣ LIVE SUMMARY (ESPN pipeline will populate this)
  // -----------------------------
  const liveSummary: LiveGameSummary[] = [];

  // -----------------------------
  // 7️⃣ LOCK STATE
  // -----------------------------
  const lockState = {
    bracketsOpen: true,
    openingRoundComplete: openingRoundGames.every((g) => !!g.winner),
  };

  // -----------------------------
  // 8️⃣ BUILD FINAL STATE PAYLOAD
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
