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
          const team1Name = g.team1 ?? 'TBD';
          const team2Name = g.team2 ?? 'TBD';

          const seed1 = g.seed1 ?? null;
          const seed2 = g.seed2 ?? null;

          const liveMatch = live.find(
            (l) =>
              (l.home_team === team1Name && l.away_team === team2Name) ||
              (l.home_team === team2Name && l.away_team === team1Name)
          );

          return (
            <div
              key={g.id}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all"
            >
              {/* Team 1 */}
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs opacity-70">
                  {seed1 ? `#${seed1}` : ''}
                </span>
                <span className="text-sm font-semibold">{team1Name}</span>
              </div>

              {/* Team 2 */}
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-70">
                  {seed2 ? `#${seed2}` : ''}
                </span>
                <span className="text-sm font-semibold">{team2Name}</span>
              </div>

              {/* Score / Status */}
              {liveMatch ? (
                <div className="mt-1 text-sm font-bold text-center">
                  {liveMatch.home_score} – {liveMatch.away_score}
                  <div className="text-xs opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-1 text-green-400 font-bold text-xs text-center">
                  Winner: {g.winner}
                </div>
              ) : (
                <div className="mt-1 opacity-70 text-xs text-center">
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
