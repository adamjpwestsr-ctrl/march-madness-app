// app/api/march-madness/sync-scoreboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

const ESPN_SCOREBOARD_URL =
  'http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard';

export async function POST() {
  const supabase = createClient();

  // 1. Fetch ESPN scoreboard
  const res = await fetch(ESPN_SCOREBOARD_URL, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch ESPN scoreboard' },
      { status: 500 },
    );
  }

  const json = await res.json();

  const events = json.events ?? [];

  // 2. For each event, map to tournament_games
  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const status = competition.status?.type?.name; // 'pre', 'in', 'post'
    const competitors = competition.competitors ?? [];

    const home = competitors.find((c: any) => c.homeAway === 'home');
    const away = competitors.find((c: any) => c.homeAway === 'away');

    if (!home || !away) continue;

    const homeTeamName = home.team?.shortDisplayName ?? home.team?.displayName;
    const awayTeamName = away.team?.shortDisplayName ?? away.team?.displayName;

    const winner =
      status === 'post'
        ? competitors.find((c: any) => c.winner)?.team?.shortDisplayName ??
          competitors.find((c: any) => c.winner)?.team?.displayName
        : null;

    // 3. Find matching tournament game by team names
    const { data: game } = await supabase
      .from('tournament_games')
      .select('*')
      .or(
        `team1.eq.${homeTeamName},team2.eq.${homeTeamName},team1.eq.${awayTeamName},team2.eq.${awayTeamName}`,
      )
      .limit(1)
      .maybeSingle();

    if (!game) continue;

    // 4. Update winner + completed
    if (winner && status === 'post') {
      await supabase
        .from('tournament_games')
        .update({
          winner,
          completed: true,
        })
        .eq('id', game.id);

      // Optional: auto‑advance winner if winner_to_game_id is set
      if (game.winner_to_game_id) {
        const { data: nextGame } = await supabase
          .from('tournament_games')
          .select('*')
          .eq('id', game.winner_to_game_id)
          .single();

        if (nextGame) {
          const updateField =
            nextGame.team1 === null
              ? 'team1'
              : nextGame.team2 === null
              ? 'team2'
              : null;

          if (updateField) {
            await supabase
              .from('tournament_games')
              .update({ [updateField]: winner })
              .eq('id', nextGame.id);
          }
        }
      }
    }

    // 5. Optionally cache live scores in a small table
    await supabase
      .from('live_scores')
      .upsert(
        {
          game_id: event.id,
          home_team: homeTeamName,
          away_team: awayTeamName,
          home_score: Number(home.score ?? 0),
          away_score: Number(away.score ?? 0),
          status,
        },
        { onConflict: 'game_id' },
      );
  }

  return NextResponse.json({ success: true });
}
