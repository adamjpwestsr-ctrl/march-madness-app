// app/api/march-madness/live/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { LiveGameSummary } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  // -----------------------------
  // 1. FETCH ESPN SCOREBOARD
  // -----------------------------
  const espnRes = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
  );

  const espnJson = await espnRes.json();
  const events = espnJson.events ?? [];

  // -----------------------------
  // 2. FETCH LOCAL TOURNAMENT GAMES
  // -----------------------------
  const { data: gamesData } = await supabase
    .from('tournament_games')
    .select('*');

  // Map ESPN game IDs → local game rows
  const gameMap = new Map(
    (gamesData ?? []).map((g) => [String(g.id), g])
  );

  const liveSummary: LiveGameSummary[] = [];

  // -----------------------------
  // 3. PROCESS ESPN EVENTS
  // -----------------------------
  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const espnGameId = competition.id;

    const home = competition.competitors.find((c: any) => c.homeAway === 'home');
    const away = competition.competitors.find((c: any) => c.homeAway === 'away');

    const status = competition.status?.type?.state ?? 'pre';

    // Build LiveGameSummary
    const summary: LiveGameSummary = {
      game_id: espnGameId,
      home_team: home?.team?.shortDisplayName ?? '',
      away_team: away?.team?.shortDisplayName ?? '',
      home_score: Number(home?.score ?? 0),
      away_score: Number(away?.score ?? 0),
      status,
      region: null,
      round: null,
    };

    liveSummary.push(summary);

    // -----------------------------
    // 4. UPDATE LOCAL GAME IF MATCH FOUND
    // -----------------------------
    const localGame = gameMap.get(espnGameId);
    if (!localGame) continue;

    // Update scores + status
    await supabase
      .from('tournament_games')
      .update({
        home_score: summary.home_score,
        away_score: summary.away_score,
        status: summary.status,
        completed: summary.status === 'post',
        winner:
          summary.status === 'post'
            ? summary.home_score > summary.away_score
              ? summary.home_team
              : summary.away_team
            : null,
      })
      .eq('id', localGame.id);
  }

  // -----------------------------
  // 5. RETURN LIVE SUMMARY
  // -----------------------------
  return NextResponse.json(liveSummary);
}
