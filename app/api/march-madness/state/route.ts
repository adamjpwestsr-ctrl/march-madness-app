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

  // Brackets
  const { data: bracketsData } = await supabase
    .from('brackets')
    .select('*')
    .eq('sport', 'ncaab');

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

  // Games
  const { data: gamesData } = await supabase
    .from('tournament_games')
    .select('*');

  const openingRoundGames: TournamentGame[] =
    (gamesData ?? []).filter((g) => g.round === 0);

  const regionalGamesByRegion: Record<string, TournamentGame[]> = {};
  (gamesData ?? [])
    .filter((g) => (g.round ?? 0) >= 1)
    .forEach((g) => {
      const region = g.region ?? 'Unknown';
      if (!regionalGamesByRegion[region]) regionalGamesByRegion[region] = [];
      regionalGamesByRegion[region].push(g as TournamentGame);
    });

  // Teams
  const { data: teamsData } = await supabase
    .from('v_tournament_teams')
    .select('*');

  const teams: TournamentTeam[] = (teamsData ?? []) as TournamentTeam[];

  // Leaderboard
  const { data: leaderboardData } = await supabase
    .from('bracket_potential_scores')
    .select('*');

  const leaderboard: LeaderboardRow[] =
    leaderboardData?.map((row) => ({
      bracket_id: row.bracket_id,
      bracket_name:
        brackets.find((b) => b.bracket_id === row.bracket_id)?.bracket_name ??
        'Unknown',
      icon: brackets.find((b) => b.bracket_id === row.bracket_id)?.icon ?? null,
      earned_points: Number(row.earned_points ?? 0),
      possible_points: Number(row.possible_points ?? 0),
      max_possible_score: Number(row.max_possible_score ?? 0),
      mulligans_used: 0, // can be wired from mulligan views later
    })) ?? [];

  // Mulligans
  const { data: mulligansData } = await supabase
    .from('bracket_mulligans')
    .select('*');

  const mulligans: MulliganSummary[] = (mulligansData ?? []) as MulliganSummary[];

  // Live summary placeholder (to be wired to cached ESPN data)
  const liveSummary: LiveGameSummary[] = [];

  const lockState = {
    bracketsOpen: true, // later: derive from scheduled_at / admin flags
    openingRoundComplete: openingRoundGames.every((g) => !!g.winner),
  };

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
