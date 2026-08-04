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

  try {
    console.log('🔹 [STATE API] Starting March Madness state build');

    // -----------------------------
    // 1️⃣ FETCH BRACKETS + SUBMISSION STATUS
    // -----------------------------
    const { data: bracketsData, error: bracketError } = await supabase
      .from('brackets')
      .select('*')
      .eq('sport', 'ncaab');

    if (bracketError) throw new Error(`Bracket fetch failed: ${bracketError.message}`);

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

    console.log('✅ Brackets loaded:', brackets.length);

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

    if (gamesError) throw new Error(`Games fetch failed: ${gamesError.message}`);

    console.log('✅ Games fetched:', gamesData?.length);

    // -----------------------------
    // ⭐ NORMALIZE JOINED DATA BACK INTO TournamentGame SHAPE
    // -----------------------------
    function normalizeGame(g: any): TournamentGame {
      const team1 = Array.isArray(g.team1) ? g.team1[0] : g.team1 ?? null;
      const team2 = Array.isArray(g.team2) ? g.team2[0] : g.team2 ?? null;

      // ⭐ NEW: Opening Round seeds (17–20) must be treated as placeholders
      const openingRoundSeed = (team: any) =>
        team?.seed >= 17 && team?.seed <= 20;

      const isPlaceholder =
        g.is_placeholder ||
        openingRoundSeed(team1) ||
        openingRoundSeed(team2);

      return {
        id: g.id,
        round: g.round,
        game_number: g.game_number,
        region: g.region?.trim() ?? null,
        winner: g.winner,

        team1_id: isPlaceholder ? null : team1?.id ?? null,
        team2_id: isPlaceholder ? null : team2?.id ?? null,

        team1: isPlaceholder ? 'TBD' : team1?.team_name ?? null,
        team2: isPlaceholder ? 'TBD' : team2?.team_name ?? null,

        seed1: isPlaceholder ? null : team1?.seed ?? null,
        seed2: isPlaceholder ? null : team2?.seed ?? null,

        home_score: g.home_score ?? 0,
        away_score: g.away_score ?? 0,

        round_id: null,
        winner_to_game_id: null,
        is_placeholder: isPlaceholder,
        completed: g.completed ?? false,
        status: g.status ?? 'pre',

        site: null,
        scheduled_at: null,
        bracket_id: null,
      };
    }

    // -----------------------------
    // 3️⃣ OPENING ROUND
    // -----------------------------
    const openingRoundGames: TournamentGame[] =
      (gamesData ?? [])
        .filter((g) => g.round === 1)
        .map(normalizeGame);

    console.log('✅ Opening Round games:', openingRoundGames.length);
    // -----------------------------
    // 4️⃣ GROUP REGIONAL GAMES BY REGION (rounds 2–5)
    // -----------------------------
    const regionalGamesByRegion: Record<string, TournamentGame[]> = {
      East: [],
      West: [],
      South: [],
      Midwest: [],
      Unknown: [],
    };

    (gamesData ?? [])
      .filter((g) => (g.round ?? 0) >= 2 && (g.round ?? 0) <= 5)
      .forEach((g) => {
        const region = typeof g.region === 'string' ? g.region.trim() : null;
        const normalized = normalizeGame(g);
        if (region && regionalGamesByRegion[region]) {
          regionalGamesByRegion[region].push(normalized);
        } else {
          regionalGamesByRegion['Unknown'].push(normalized);
        }
      });

    console.log('✅ Regional games grouped');

    // -----------------------------
    // ⭐ 5️⃣ FINAL FOUR (round = 6)
    // -----------------------------
    const finalFourGames: TournamentGame[] =
      (gamesData ?? [])
        .filter((g) => g.round === 6)
        .map(normalizeGame);

    // -----------------------------
    // ⭐ 6️⃣ CHAMPIONSHIP (round = 7)
    // -----------------------------
    const championshipGames: TournamentGame[] =
      (gamesData ?? [])
        .filter((g) => g.round === 7)
        .map(normalizeGame);

    // -----------------------------
    // 7️⃣ WIRE winner_to_game_id FOR ALL ROUNDS
    // -----------------------------
    function wireWinnerMappings() {
      console.log('🔹 Wiring winner mappings...');

      // Opening Round → Round of 64
      openingRoundGames.forEach((game) => {
        const region = game.region ?? 'Unknown';
        const nextRoundGames = regionalGamesByRegion[region]?.filter(
          (g) => g.round === 2
        ) ?? [];
        const targetGameNumber = Math.ceil(game.game_number / 2);
        const target = nextRoundGames.find((g) => g.game_number === targetGameNumber);
        if (target) game.winner_to_game_id = target.id;
      });

      // Regional rounds 64 → 32 → 16 → 8
      Object.keys(regionalGamesByRegion).forEach((regionKey) => {
        const games = regionalGamesByRegion[regionKey];
        for (let round = 2; round <= 5; round++) {
          const currentRoundGames = games.filter((g) => g.round === round);
          const nextRoundGames = games.filter((g) => g.round === round + 1);
          currentRoundGames.forEach((game) => {
            const targetGameNumber = Math.ceil(game.game_number / 2);
            const target = nextRoundGames.find((g) => g.game_number === targetGameNumber);
            if (target) game.winner_to_game_id = target.id;
          });
        }
      });

      // Final Four → Championship
      finalFourGames.forEach((game) => {
        const target = championshipGames[0];
        if (target) game.winner_to_game_id = target.id;
      });

      console.log('✅ Winner mappings complete');
    }

    try {
      wireWinnerMappings();
    } catch (err) {
      console.error('❌ Winner mapping error:', err);
    }
    // -----------------------------
    // 8️⃣ FETCH TEAMS
    // -----------------------------
    const { data: teamsData, error: teamsError } = await supabase
      .from('v_tournament_teams')
      .select('*');

    if (teamsError) throw new Error(`Teams fetch failed: ${teamsError.message}`);
    const teams: TournamentTeam[] = (teamsData ?? []) as TournamentTeam[];

    // -----------------------------
    // 9️⃣ FETCH LEADERBOARD
    // -----------------------------
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select('*');

    if (leaderboardError) throw new Error(`Leaderboard fetch failed: ${leaderboardError.message}`);

    const leaderboard: LeaderboardRow[] =
      leaderboardData?.map((row) => ({
        bracket_id: row.bracket_id,
        bracket_name:
          brackets.find((b) => b.bracket_id === row.bracket_id)?.bracket_name ?? 'Unknown',
        icon: brackets.find((b) => b.bracket_id === row.bracket_id)?.icon ?? null,
        earned_points: Number(row.earned_points ?? 0),
        possible_points: Number(row.possible_points ?? 0),
        max_possible_score: Number(row.max_possible_score ?? 0),
        mulligans_used: Number(row.mulligans_used ?? 0),
        email: row.email ?? null,
        has_paid: row.has_paid ?? false,
        is_active: row.is_active ?? false,
      })) ?? [];

    // -----------------------------
    // 🔟 FETCH MULLIGANS
    // -----------------------------
    const { data: mulligansData, error: mulliganError } = await supabase
      .from('bracket_mulligans')
      .select('*');

    if (mulliganError) throw new Error(`Mulligans fetch failed: ${mulliganError.message}`);

    const mulligans: MulliganSummary[] = (mulligansData ?? []) as MulliganSummary[];

    // -----------------------------
    // 1️⃣1️⃣ LIVE SUMMARY (placeholder)
    // -----------------------------
    const liveSummary: LiveGameSummary[] = [];

    // -----------------------------
    // 1️⃣2️⃣ LOCK STATE
    // -----------------------------
    const lockState = {
      bracketsOpen: true,
      openingRoundComplete: openingRoundGames.every((g) => !!g.winner),
    };

    // -----------------------------
    // 1️⃣3️⃣ FINAL PAYLOAD
    // -----------------------------
    const state: MarchMadnessState = {
      brackets,
      openingRoundGames,
      regionalGames: regionalGamesByRegion,
      finalFourGames,
      championshipGames,
      teams,
      leaderboard,
      mulligans,
      lockState,
      liveSummary,
    };

    console.log('✅ [STATE API] Completed successfully');

    return NextResponse.json(state);

  } catch (err: any) {
    console.error('❌ [STATE API] Fatal error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Unknown server error' },
      { status: 500 }
    );
  }
}
