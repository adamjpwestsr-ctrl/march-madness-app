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
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-8">
      <h2 className="text-2xl font-bold text-center">Opening Round</h2>

      {/* Opening Round Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {/* Team 1 */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm opacity-70">
                  {g.seed1 ? `#${g.seed1}` : ''}
                </span>
                <span className="font-semibold">{g.team1 ?? 'TBD'}</span>
              </div>

              {/* Team 2 */}
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">
                  {g.seed2 ? `#${g.seed2}` : ''}
                </span>
                <span className="font-semibold">{g.team2 ?? 'TBD'}</span>
              </div>

              {/* Live Score or Winner */}
              {liveMatch ? (
                <div className="mt-3 text-xl font-bold text-center">
                  {liveMatch.home_score} - {liveMatch.away_score}
                  <div className="text-sm opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-3 text-green-400 font-bold text-center">
                  Winner: {g.winner}
                </div>
              ) : (
                <div className="mt-3 opacity-70 text-center">
                  Awaiting result…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
