// app/api/march-madness/admin/setup/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST() {
  const supabase = createClient();

  // 1. Load tournament teams
  const { data: teams, error: teamError } = await supabase
    .from('tournament_teams')
    .select('*')
    .order('region', { ascending: true })
    .order('seed', { ascending: true });

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 400 });
  }

  if (!teams || teams.length === 0) {
    return NextResponse.json(
      { error: 'No tournament teams found. Seed teams first.' },
      { status: 400 }
    );
  }

  // 2. Build Opening Round games (round = 0)
  const openingRoundGames = [];
  const mainBracketGames = [];

  // Example: seeds 11, 12, 16 often have play-in games
  const playInSeeds = [11, 12, 16];

  for (const region of ['East', 'West', 'South', 'Midwest']) {
    const regionTeams = teams.filter((t) => t.region === region);

    for (const seed of playInSeeds) {
      const contenders = regionTeams.filter((t) => t.seed === seed);

      if (contenders.length === 2) {
        openingRoundGames.push({
          round: 0,
          region,
          team1_id: contenders[0].id,
          team2_id: contenders[1].id,
          is_placeholder: false,
        });
      }
    }
  }

  // 3. Insert Opening Round games
  const { data: openingInsert, error: openingError } = await supabase
    .from('tournament_games')
    .insert(
      openingRoundGames.map((g, idx) => ({
        game_number: idx + 1,
        round: 0,
        region: g.region,
        team1_id: g.team1_id,
        team2_id: g.team2_id,
        is_placeholder: false,
      }))
    )
    .select();

  if (openingError) {
    return NextResponse.json({ error: openingError.message }, { status: 400 });
  }

  // 4. Build Round of 64 (round = 1)
  const round64Games = [];

  for (const region of ['East', 'West', 'South', 'Midwest']) {
    const regionTeams = teams.filter((t) => t.region === region);

    const seedPairs = [
      [1, 16],
      [8, 9],
      [5, 12],
      [4, 13],
      [6, 11],
      [3, 14],
      [7, 10],
      [2, 15],
    ];

    for (const [seed1, seed2] of seedPairs) {
      const t1 = regionTeams.find((t) => t.seed === seed1);
      const t2 = regionTeams.find((t) => t.seed === seed2);

      round64Games.push({
        round: 1,
        region,
        team1_id: t1?.id ?? null,
        team2_id: t2?.id ?? null,
        is_placeholder: false,
      });
    }
  }

  const { data: round64Insert, error: round64Error } = await supabase
    .from('tournament_games')
    .insert(
      round64Games.map((g, idx) => ({
        game_number: 100 + idx,
        round: 1,
        region: g.region,
        team1_id: g.team1_id,
        team2_id: g.team2_id,
        is_placeholder: false,
      }))
    )
    .select();

  if (round64Error) {
    return NextResponse.json({ error: round64Error.message }, { status: 400 });
  }

  return NextResponse.json({
    openingRoundGamesCreated: openingInsert?.length ?? 0,
    round64GamesCreated: round64Insert?.length ?? 0,
    teamsSeeded: teams.length,
  });
}
