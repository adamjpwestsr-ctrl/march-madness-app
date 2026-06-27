// app/api/march-madness/sync-scoreboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard';

export async function POST() {
  const supabase = await createClient();

  // -----------------------------
  // 1️⃣ FETCH ESPN SCOREBOARD
  // -----------------------------
  const res = await fetch(ESPN_SCOREBOARD_URL, { cache: 'no-store' });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch ESPN scoreboard' },
      { status: 500 }
    );
  }

  const json = await res.json();
  const events = json.events ?? [];

  // -----------------------------
  // 2️⃣ FETCH LOCAL GAMES (for ID matching)
  // -----------------------------
  const { data: localGames } = await supabase
    .from('tournament_games')
    .select('*');

  const gameMap = new Map(
    (localGames ?? []).map((g) => [String(g.id), g])
  );

  let updatedGames = 0;

  // -----------------------------
  // 3️⃣ PROCESS ESPN EVENTS
  // -----------------------------
  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const espnGameId = String(competition.id);

    const home = competition.competitors.find((c: any) => c.homeAway === 'home');
    const away = competition.competitors.find((c: any) => c.homeAway === 'away');

    if (!home || !away) continue;

    const status = competition.status?.type?.state ?? 'pre';

    const homeTeam = home.team?.shortDisplayName ?? home.team?.displayName;
    const awayTeam = away.team?.shortDisplayName ?? away.team?.displayName;

    const homeScore = Number(home.score ?? 0);
    const awayScore = Number(away.score ?? 0);

    const winner =
      status === 'post'
        ? homeScore > awayScore
          ? homeTeam
          : awayTeam
        : null;

    // -----------------------------
    // 4️⃣ MATCH LOCAL GAME BY ESPN GAME ID
    // -----------------------------
    const localGame = gameMap.get(espnGameId);
    if (!localGame) continue;

    // -----------------------------
    // 5️⃣ UPDATE LOCAL GAME
    // -----------------------------
    await supabase
      .from('tournament_games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status,
        winner: winner,
        completed: status === 'post',
      })
      .eq('id', localGame.id);

    updatedGames++;

    // -----------------------------
    // 6️⃣ CACHE LIVE SCORES (optional)
    // -----------------------------
    await supabase
      .from('live_scores')
      .upsert(
        {
          game_id: espnGameId,
          home_team: homeTeam,
          away_team: awayTeam,
          home_score: homeScore,
          away_score: awayScore,
          status,
        },
        { onConflict: 'game_id' }
      );
  }

  // -----------------------------
  // 7️⃣ TRIGGER WINNER ADVANCEMENT
  // -----------------------------
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/advance`, {
    method: 'POST',
  });

  // -----------------------------
  // 8️⃣ TRIGGER SCORING ENGINE
  // -----------------------------
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/score`, {
    method: 'POST',
  });

  // -----------------------------
  // 9️⃣ RETURN SYNC SUMMARY
  // -----------------------------
  return NextResponse.json({
    success: true,
    updatedGames,
    eventsProcessed: events.length,
  });
}
