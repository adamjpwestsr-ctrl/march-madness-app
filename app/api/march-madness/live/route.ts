// app/api/march-madness/live/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { LiveGameSummary } from '@/lib/marchMadnessTypes';

export async function GET() {
  const supabase = createClient();

  const { data: liveData } = await supabase
    .from('live_scores')
    .select('*');

  const { data: gamesData } = await supabase
    .from('tournament_games')
    .select('id, region, round, team1, team2');

  const gameMap = new Map(
    (gamesData ?? []).map((g) => [
      `${g.team1}-${g.team2}`,
      { region: g.region, round: g.round },
    ]),
  );

  const liveSummary: LiveGameSummary[] = (liveData ?? []).map((ls) => {
    const key = `${ls.home_team}-${ls.away_team}`;
    const meta = gameMap.get(key) ?? { region: null, round: null };

    return {
      game_id: ls.game_id,
      home_team: ls.home_team,
      away_team: ls.away_team,
      home_score: ls.home_score,
      away_score: ls.away_score,
      status: ls.status,
      region: meta.region,
      round: meta.round,
    };
  });

  return NextResponse.json(liveSummary);
}
