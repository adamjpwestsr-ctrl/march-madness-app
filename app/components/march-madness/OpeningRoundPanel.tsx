'use client';

import { TournamentGame, LiveGameSummary } from '@/lib/marchMadnessTypes';

export function OpeningRoundPanel({
  games,
  live,
}: {
  games: TournamentGame[];
  live: LiveGameSummary[];
}) {
  return (
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <h2 className="text-2xl font-bold">Opening Round</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => {
          const liveMatch = live.find(
            (l) =>
              (l.home_team === g.team1 && l.away_team === g.team2) ||
              (l.home_team === g.team2 && l.away_team === g.team1)
          );

          return (
            <div
              key={g.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
            >
              <div className="font-semibold text-lg">
                {g.team1} vs {g.team2}
              </div>

              {liveMatch ? (
                <div className="mt-2 text-xl font-bold">
                  {liveMatch.home_score} - {liveMatch.away_score}
                  <div className="text-sm opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-2 text-green-400 font-bold">
                  Winner: {g.winner}
                </div>
              ) : (
                <div className="mt-2 opacity-70">Awaiting result…</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
