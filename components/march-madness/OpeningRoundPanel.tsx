'use client';

import { TournamentGame, LiveGameSummary } from '@/lib/marchMadnessTypes';

export function OpeningRoundPanel({
  games,
  live,
  onPick,
}: {
  games: TournamentGame[];
  live: LiveGameSummary[];
  onPick?: (gameId: string, winner: string) => void;
}) {
  const handlePick = (game: TournamentGame, winner: string) => {
    if (!winner || winner === 'TBD') return;
    if (onPick) onPick(game.id, winner);
  };

  return (
    <div className="rounded-xl p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl shadow-2xl space-y-6 border border-white/10">
      <h2 className="text-2xl font-extrabold text-center uppercase tracking-wide text-white/90 drop-shadow">
        Opening Round
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

          const isTeam1Picked = g.winner === team1Name;
          const isTeam2Picked = g.winner === team2Name;

          return (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all hover:shadow-xl hover:bg-white/10"
            >
              {/* Team 1 */}
              <button
                onClick={() => handlePick(g, team1Name)}
                className={`flex justify-between items-center mb-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    isTeam1Picked
                      ? 'bg-green-600/40 border border-green-400 scale-[1.02]'
                      : 'hover:bg-white/20 hover:scale-[1.01]'
                  }
                `}
              >
                <span className="text-xs opacity-70">
                  {seed1 ? `#${seed1}` : ''}
                </span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {team1Name}
                  {isTeam1Picked && (
                    <span className="text-green-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Team 2 */}
              <button
                onClick={() => handlePick(g, team2Name)}
                className={`flex justify-between items-center w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    isTeam2Picked
                      ? 'bg-green-600/40 border border-green-400 scale-[1.02]'
                      : 'hover:bg-white/20 hover:scale-[1.01]'
                  }
                `}
              >
                <span className="text-xs opacity-70">
                  {seed2 ? `#${seed2}` : ''}
                </span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {team2Name}
                  {isTeam2Picked && (
                    <span className="text-green-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Score / Status */}
              {liveMatch ? (
                <div className="mt-2 text-sm font-bold text-center">
                  {liveMatch.home_score} – {liveMatch.away_score}
                  <div className="text-xs opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-2 text-green-400 font-bold text-xs text-center">
                  Winner: {g.winner}
                </div>
              ) : (
                <div className="mt-2 opacity-70 text-xs text-center">
                  Pick a winner…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
