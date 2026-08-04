// app/api/march-madness/live/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { LiveGameSummary } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = await createClient();

  // Fetch ESPN scoreboard
  const espnRes = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
  );
  const espnJson = await espnRes.json();
  const events = espnJson.events ?? [];

  // Fetch local games
  const { data: localGames } = await supabase
    .from('tournament_games')
    .select('*');

  const liveSummary: LiveGameSummary[] = [];

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const espnGameId = competition.id;

    const home = competition.competitors.find((c: any) => c.homeAway === 'home');
    const away = competition.competitors.find((c: any) => c.homeAway === 'away');

    const status = competition.status?.type?.state ?? 'pre';

    const homeTeam = home?.team?.shortDisplayName ?? '';
    const awayTeam = away?.team?.shortDisplayName ?? '';

    const homeScore = Number(home?.score ?? 0);
    const awayScore = Number(away?.score ?? 0);

    const summary: LiveGameSummary = {
      game_id: espnGameId,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: homeScore,
      away_score: awayScore,
      status,
      region: null,
      round: null,
    };

    liveSummary.push(summary);

    // Match local game by team names
    const localGame = localGames?.find(
      (g) =>
        g.team1 === homeTeam &&
        g.team2 === awayTeam
    );

    if (!localGame) continue;

    const winner =
      status === 'post'
        ? homeScore > awayScore
          ? homeTeam
          : awayTeam
        : null;

    // Update local game
    await supabase
      .from('tournament_games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status,
        completed: status === 'post',
        winner,
      })
      .eq('id', localGame.id);

    // Auto-advance winners
    if (status === 'post') {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/advance`, {
        method: 'POST',
      });

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/score`, {
        method: 'POST',
      });
    }
  }

  return NextResponse.json(liveSummary);
}
