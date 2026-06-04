'use client';

import { useState, useMemo } from 'react';
import type { WeeklyGame, Team } from '@/lib/sports/weekly';
import { createClient } from '@/lib/supabaseBrowserClient';

type Props = {
  sport: 'NBA' | 'NHL';
  week: number;
  games: WeeklyGame[];
  teamsById: Record<string, Team>;
  lockTime: string | null;
};

type PickMap = Record<number, string>; // game_id -> winner_team_id

export default function WeeklyClient({
  sport,
  week,
  games,
  teamsById,
  lockTime,
}: Props) {
  const supabase = createClient();
  const [picks, setPicks] = useState<PickMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLocked = useMemo(() => {
    if (!lockTime) return false;
    return new Date(lockTime) <= new Date();
  }, [lockTime]);

  const handlePick = (gameId: number, winnerId: string) => {
    if (isLocked) return;
    setPicks(prev => ({ ...prev, [gameId]: winnerId }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError('You must be logged in to submit picks.');
        return;
      }

      const payload = Object.entries(picks).map(([gameId, winnerId]) => ({
        game_id: Number(gameId),
        sport,
        week_number: week,
        winner_team_id: winnerId,
      }));

      const { error: insertError } = await supabase
        .from('user_picks')
        .upsert(payload, {
          onConflict: 'game_id,user_id,sport,week_number',
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess('Picks saved successfully.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {sport} Weekly Picks — Week {week}
          </h1>
          {lockTime && (
            <p className="text-sm text-muted-foreground">
              Lock time: {new Date(lockTime).toLocaleString()}
            </p>
          )}
        </div>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLocked || submitting || games.length === 0}
        >
          {isLocked ? 'Locked' : submitting ? 'Saving…' : 'Submit Picks'}
        </button>
      </header>

      {error && (
        <div className="rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded bg-green-100 text-green-800 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map(game => {
          const home = teamsById[game.home_team_id];
          const away = teamsById[game.away_team_id];
          const selected = picks[game.id];

          return (
            <div
              key={game.id}
              className="rounded-xl border bg-card p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-muted-foreground">
                  Game #{game.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(game.game_date).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handlePick(game.id, home.id)}
                  className={[
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-left',
                    selected === home.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-muted',
                    isLocked ? 'opacity-60 cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  <span className="font-medium">
                    {home?.name ?? game.home_team_id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {home?.abbreviation}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePick(game.id, away.id)}
                  className={[
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-left',
                    selected === away.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-muted',
                    isLocked ? 'opacity-60 cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  <span className="font-medium">
                    {away?.name ?? game.away_team_id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {away?.abbreviation}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {games.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No games found for Week {week}.
          </p>
        )}
      </div>
    </div>
  );
}
