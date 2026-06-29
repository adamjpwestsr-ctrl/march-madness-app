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
    <div className="rounded-xl p-4 bg-white/10 backdrop-blur-xl shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-center">Opening Round</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {games.map((g) => {
          const liveMatch = live.find(
            (l) =>
              (l.home_team === g.team1 && l.away_team === g.team2) ||
              (l.home_team === g.team2 && l.away_team === g.team1)
          );

          return (
            <div
              key={g.id}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all"
            >
              {/* Team 1 */}
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs opacity-70">
                  {g.seed1 ? `#${g.seed1}` : ''}
                </span>
                <span className="text-sm font-semibold">{g.team1 ?? 'TBD'}</span>
              </div>

              {/* Team 2 */}
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-70">
                  {g.seed2 ? `#${g.seed2}` : ''}
                </span>
                <span className="text-sm font-semibold">{g.team2 ?? 'TBD'}</span>
              </div>

              {/* Score / Status */}
              {liveMatch ? (
                <div className="mt-1 text-sm font-bold text-center">
                  {liveMatch.home_score} – {liveMatch.away_score}
                  <div className="text-xs opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-1 text-green-400 font-bold text-xs text-center">
                  Winner: {g.winner}
                </div>
              ) : (
                <div className="mt-1 opacity-70 text-xs text-center">
                  Awaiting result…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
