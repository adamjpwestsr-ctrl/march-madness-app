// app/api/march-madness/sync-scoreboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard';

export async function POST() {
  const supabase = await createClient();

  const res = await fetch(ESPN_SCOREBOARD_URL, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch ESPN scoreboard' },
      { status: 500 }
    );
  }

  const json = await res.json();
  const events = json.events ?? [];

  const { data: localGames } = await supabase
    .from('tournament_games')
    .select('*');

  let updatedGames = 0;

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

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

    // Match local game by team names
    const localGame = localGames?.find(
      (g) => g.team1 === homeTeam && g.team2 === awayTeam
    );

    if (!localGame) continue;

    await supabase
      .from('tournament_games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status,
        winner,
        completed: status === 'post',
      })
      .eq('id', localGame.id);

    updatedGames++;

    // Cache live scores
    await supabase
      .from('live_scores')
      .upsert(
        {
          game_id: competition.id,
          home_team: homeTeam,
          away_team: awayTeam,
          home_score: homeScore,
          away_score: awayScore,
          status,
        },
        { onConflict: 'game_id' }
      );

    // Auto-advance + auto-score
    if (status === 'post') {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/advance`, {
        method: 'POST',
      });

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/score`, {
        method: 'POST',
      });
    }
  }

  return NextResponse.json({
    success: true,
    updatedGames,
    eventsProcessed: events.length,
  });
}
